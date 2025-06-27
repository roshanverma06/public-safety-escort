// utils/assignVehicles.js
const pool = require('../db');

const assignVehicles = async () => {
  try {
    const vehicles = await pool.query(`
      SELECT v.id, v.capacity
      FROM vehicles v
      WHERE v.status = 'available'
    `);

    for (const vehicle of vehicles.rows) {
      const vehicleId = vehicle.id;
      const capacity = parseInt(vehicle.capacity);

      // 1️⃣ Get the first pending student
      const firstStudentRes = await pool.query(`
        SELECT * FROM ride_bookings
        WHERE status = 'pending'
        ORDER BY created_at ASC
        LIMIT 1
      `);

      if (firstStudentRes.rows.length === 0) break;

      const firstStudent = firstStudentRes.rows[0];
      const pickupLocation = firstStudent.pickup_location;

      // 2️⃣ Get all pending students from this pickup location up to the vehicle's capacity
      const studentsRes = await pool.query(`
        SELECT * FROM ride_bookings
        WHERE status = 'pending' AND pickup_location = $1
        ORDER BY created_at ASC
        LIMIT $2
      `, [pickupLocation, capacity]);

      let assignedCount = 0;

      for (const student of studentsRes.rows) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();

        await pool.query(`
          UPDATE ride_bookings
          SET vehicle_id = $1, status = 'assigned', assigned = true,
              assigned_at = NOW(), otp = $2
          WHERE id = $3
        `, [vehicleId, otp, student.id]);

        assignedCount++;
        console.log(`✅ Assigned vehicle ${vehicleId} to student ${student.cwid}`);
      }

      // 3️⃣ If the vehicle is full after assignment, mark it busy
      if (assignedCount === capacity) {
        await pool.query(`
          UPDATE vehicles SET status = 'busy' WHERE id = $1
        `, [vehicleId]);
        console.log(`🚗 Vehicle ${vehicleId} is now full and marked as busy`);
      }
    }

  } catch (err) {
    console.error('❌ Vehicle assignment error:', err);
  }
};

module.exports = assignVehicles;
