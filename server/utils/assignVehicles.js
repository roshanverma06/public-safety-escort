const pool = require('../db');

const assignVehicles = async () => {
  try {
    const pendingRes = await pool.query(
      `SELECT * FROM ride_bookings WHERE status = 'pending' ORDER BY created_at ASC`
    );

    const pendingStudents = pendingRes.rows;
    if (pendingStudents.length === 0) return;

    const vehiclesRes = await pool.query(
      `SELECT * FROM vehicles WHERE remaining_capacity > 0 AND status = 'available'`
    );

    const vehicles = vehiclesRes.rows;
    if (vehicles.length === 0) {
      console.log('🚗 No available vehicles.');
      return;
    }

    const locationMap = {};

    // ✅ Group students by pickup location (FIFO)
    for (let student of pendingStudents) {
      const loc = student.pickup_location;
      if (!locationMap[loc]) locationMap[loc] = [];
      locationMap[loc].push(student);
    }

    const locations = Object.keys(locationMap);

    for (let vehicle of vehicles) {
      let locationToServe = vehicle.working_location;

      // 🚩 If not set, pick the earliest location from students list
      if (!locationToServe) {
        const firstStudent = pendingStudents[0];
        locationToServe = firstStudent.pickup_location;

        // Set working location
        await pool.query(
          `UPDATE vehicles SET working_location = $1 WHERE id = $2`,
          [locationToServe, vehicle.id]
        );
      }

      // ✅ Assign students only from matching location
      const studentsFromLoc = locationMap[locationToServe] || [];

      if (studentsFromLoc.length === 0) continue;

      const assignableStudents = studentsFromLoc.splice(0, vehicle.remaining_capacity);
      await assignStudentsToVehicle(vehicle.id, assignableStudents);

      // Update locationMap after assignment
      locationMap[locationToServe] = studentsFromLoc;
    }

  } catch (err) {
    console.error('🔥 Vehicle assignment error:', err);
  }
};

// 🔄 Utility function (unchanged)
const assignStudentsToVehicle = async (vehicleId, students) => {
  for (let student of students) {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    await pool.query(
      `UPDATE ride_bookings 
       SET vehicle_id = $1, status = 'assigned', assigned = true, assigned_at = NOW(), otp = $2 
       WHERE id = $3`,
      [vehicleId, otp, student.id]
    );

    await pool.query(
      `UPDATE vehicles 
       SET remaining_capacity = remaining_capacity - 1 
       WHERE id = $1`,
      [vehicleId]
    );
  }
};

module.exports = assignVehicles;
