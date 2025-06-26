// routes/profile.js
const express = require('express');
const pool = require('../db');
const router = express.Router();

// @route    GET /api/profile/:email
// @desc     Get student details by email
router.get('/:email', async (req, res) => {
  const { email } = req.params;

  try {
    const result = await pool.query(
      'SELECT name, cwid, address FROM students WHERE email = $1',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ message: 'Student not found' });
    }

    res.json(result.rows[0]);
  } catch (err) {
    console.error('❌ Error fetching student profile:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
