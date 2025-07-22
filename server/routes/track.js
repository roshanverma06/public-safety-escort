// routes/track.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:email', async (req, res) => {
  const { email } = req.params;
  try {
    const bookingRes = await pool.query(
      `SELECT 
         rb.id AS ride_id, 
         rb.vehicle_id, 
         rb.otp, 
         rb.pickup_location_id, 
         rb.drop_location, 
         v.registration_number,
         l.name AS pickup_location_name,
         l.latitude AS pickup_lat,
         l.longitude AS pickup_lng
       FROM ride_bookings rb
       JOIN students s ON rb.cwid = s.cwid
       JOIN vehicles v ON rb.vehicle_id = v.id
       JOIN locations l ON rb.pickup_location_id = l.id
       WHERE s.email = $1 AND rb.status IN ('assigned', 'started', 'picked_up')`,
      [email]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ message: 'No active booking found' });
    }

    res.status(200).json(bookingRes.rows[0]);
  } catch (err) {
    console.error('❌ Error in /api/track/:email', err);
    res.status(500).json({ message: 'Server error while fetching tracking info' });
  }
});

module.exports = router;

