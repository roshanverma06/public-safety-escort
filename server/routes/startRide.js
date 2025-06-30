// // routes/startRide.js

// const express = require('express');
// const router = express.Router();
// const pool = require('../db');

// router.post('/start-ride', async (req, res) => {
//   const { vehicleId, acceptAdditional } = req.body;

//   try {
//     if (acceptAdditional) {
//       // Assign students from other locations
//       const extraStudents = await pool.query(
//         `SELECT * FROM ride_bookings 
//          WHERE status = 'pending' AND vehicle_id IS NULL 
//          ORDER BY created_at ASC LIMIT 2`
//       );

//       for (let student of extraStudents.rows) {
//         const otp = Math.floor(100000 + Math.random() * 900000).toString();

//         await pool.query(
//           `UPDATE ride_bookings
//            SET vehicle_id = $1, status = 'assigned', assigned = true, assigned_at = NOW(), otp = $2
//            WHERE id = $3`,
//           [vehicleId, otp, student.id]
//         );

//         await pool.query(
//           `UPDATE vehicles SET remaining_capacity = remaining_capacity - 1 WHERE id = $1`,
//           [vehicleId]
//         );
//       }
//     }

//     // Finally, mark vehicle as busy
//     await pool.query(`UPDATE vehicles SET status = 'busy' WHERE id = $1`, [vehicleId]);

//     res.status(200).json({ message: 'Ride started. Vehicle now marked busy.' });
//   } catch (err) {
//     console.error('Error starting ride:', err);
//     res.status(500).json({ message: 'Failed to start ride.' });
//   }
// });

// module.exports = router;
