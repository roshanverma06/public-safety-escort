// routes/booking.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

router.post('/', async (req, res) => {
  const { name, cwid, pickup, dropoff } = req.body;

  try {
    // Insert the new booking with 'pending' status
    await pool.query(
      `INSERT INTO ride_bookings (student_name, cwid, pickup_location, drop_location, status)
       VALUES ($1, $2, $3, $4, $5)`,
      [name, cwid, pickup, dropoff, 'pending']
    );

    // // Now calculate queue position for this student based on pickup location
    const queueResult = await pool.query(
      `SELECT COUNT(*) FROM ride_bookings 
       WHERE pickup_location = $1 AND status = 'pending'`,
      [pickup]
    );

    const queuePosition = parseInt(queueResult.rows[0].count);

    // Estimate wait time (2 mins per student before them in queue)
    const estimatedWait = queuePosition * 2;

    res.status(201).json({
      message: 'Booking successful',
      queuePosition,
      estimatedWait
    });

  } catch (err) {
    console.error('🔥 Booking error:', err);
    res.status(500).json({ message: 'Server error while booking' });
  }
});

router.get('/status/:email', async (req, res) => {
    const { email } = req.params;
  
    try {
      const result = await pool.query(
        `SELECT status FROM ride_bookings WHERE cwid = (SELECT cwid FROM students WHERE email = $1) ORDER BY created_at DESC LIMIT 1`,
        [email]
      );
      if (result.rows.length === 0) return res.status(404).json({ status: 'none' });
  
      res.status(200).json({ status: result.rows[0].status });
    } catch (err) {
      console.error('Status check error:', err);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
module.exports = router;
