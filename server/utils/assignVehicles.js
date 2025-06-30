const pool = require('../db');

const assignVehicles = async () => {
  try {
    // ✅ Get all pending students first — if none, exit early
    const pendingRes = await pool.query(
      `SELECT COUNT(*) FROM ride_bookings WHERE status = 'pending'`
    );
    const pendingCount = parseInt(pendingRes.rows[0].count);
    if (pendingCount === 0) {
      //console.log('⏸️ No pending students. Skipping vehicle assignment.');
      return;
    }

    // ✅ Fetch all vehicles that are available and not full
    const vehiclesRes = await pool.query(
      `SELECT * FROM vehicles 
      WHERE remaining_capacity > 0 
        AND status = 'available'`
    );


    const vehicles = vehiclesRes.rows;
    if (vehicles.length === 0) {
      console.log('🚗 No available vehicles with capacity. Skipping assignment.');
      return;
    }

    let assignedAny = false;

    for (let vehicle of vehicles) {
      const { id: vehicleId, remaining_capacity, working_location, started } = vehicle;

      // 🔹 Before ride start: assign only students from same pickup location
      if (!started) {
        let locationToServe = working_location;

        // First student sets the working location
        if (!locationToServe) {
          const firstStudentRes = await pool.query(
            `SELECT * FROM ride_bookings WHERE status = 'pending' ORDER BY created_at ASC LIMIT 1`
          );
          if (firstStudentRes.rows.length === 0) continue;

          const firstStudent = firstStudentRes.rows[0];
          locationToServe = firstStudent.pickup_location;

          // Update vehicle's working location
          await pool.query(
            `UPDATE vehicles SET working_location = $1 WHERE id = $2`,
            [locationToServe, vehicleId]
          );
        }

        // Fetch students from working location
        const studentsRes = await pool.query(
          `SELECT * FROM ride_bookings 
           WHERE status = 'pending' AND pickup_location = $1 
           ORDER BY created_at ASC 
           LIMIT $2`,
          [locationToServe, remaining_capacity]
        );

        if (studentsRes.rows.length > 0) {
          await assignStudentsToVehicle(vehicleId, studentsRes.rows);
          assignedAny = true;
        }
      }

      // 🔹 After ride start: only assign if driver allowed extra pickups
      else if (started && remaining_capacity > 0) {
        const driverConsentRes = await pool.query(
          `SELECT allow_extra_pickups FROM vehicles WHERE id = $1`,
          [vehicleId]
        );
        const allowExtra = driverConsentRes.rows[0].allow_extra_pickups;

        if (allowExtra) {
          const studentsRes = await pool.query(
            `SELECT * FROM ride_bookings 
             WHERE status = 'pending' 
             ORDER BY created_at ASC 
             LIMIT $1`,
            [remaining_capacity]
          );

          if (studentsRes.rows.length > 0) {
            await assignStudentsToVehicle(vehicleId, studentsRes.rows);
            assignedAny = true;
          }
        }
      }
    }

    // if (assignedAny) {
    //   console.log('✅ Vehicle assignment complete.');
    // } else {
    //   console.log('ℹ️ No students matched for assignment right now.');
    // }

  } catch (err) {
    console.error('🔥 Vehicle assignment error:', err);
  }
};

// 🔄 Utility function
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
