// routes/driver/pickup-student.js
const express = require('express');
const router = express.Router();
const pool = require('../../db');

router.post('/', async (req, res) => {
  const { studentId, enteredOtp } = req.body;

  try {
    const result = await pool.query(
      `SELECT otp FROM ride_bookings WHERE id = $1`,
      [studentId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    const correctOtp = result.rows[0].otp;

    if (enteredOtp !== correctOtp) {
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    await pool.query(
      `UPDATE ride_bookings SET status = 'picked_up' WHERE id = $1`,
      [studentId]
    );

    res.json({ message: 'Student marked as picked up' });
  } catch (err) {
    console.error('Error in pickup-student:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
