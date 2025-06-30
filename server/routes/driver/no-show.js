// routes/driver/no-show.js
const express = require('express');
const router = express.Router();
const pool = require('../../db');

router.post('/', async (req, res) => {
  const { studentId } = req.body;

  try {
    const rideRes = await pool.query(
      `SELECT vehicle_id FROM ride_bookings WHERE id = $1`,
      [studentId]
    );

    if (rideRes.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    const vehicleId = rideRes.rows[0].vehicle_id;

    await pool.query(
      `UPDATE ride_bookings SET status = 'no_show' WHERE id = $1`,
      [studentId]
    );

    // Increment vehicle's remaining capacity
    await pool.query(
      `UPDATE vehicles SET remaining_capacity = remaining_capacity + 1 WHERE id = $1`,
      [vehicleId]
    );

    res.json({ message: 'Student marked as no show' });
  } catch (err) {
    console.error('Error in no-show:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
