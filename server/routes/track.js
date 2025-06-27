// routes/track.js
const express = require('express');
const router = express.Router();
const pool = require('../db');

router.get('/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const bookingRes = await pool.query(
      `SELECT rb.otp, rb.pickup_location, rb.drop_location, v.registration_number 
       FROM ride_bookings rb
       JOIN students s ON rb.cwid = s.cwid
       JOIN vehicles v ON rb.vehicle_id = v.id
       WHERE s.email = $1 AND rb.status = 'assigned'`,
      [email]
    );

    if (bookingRes.rows.length === 0) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    res.status(200).json(bookingRes.rows[0]);
  } catch (err) {
    console.error('Error in /api/track/:email', err);
    res.status(500).json({ message: 'Server error while fetching tracking info' });
  }
});

module.exports = router;
