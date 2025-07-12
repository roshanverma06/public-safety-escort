const express = require('express');
const router = express.Router();
const pool = require('../db');
const bcrypt = require('bcrypt');


router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    // Check if fields are present
    if (!email || !password) {
      return res.status(400).json({ message: 'Please enter both email and password.' });
    }

    // Check if driver exists
    const result = await pool.query('SELECT * FROM admins WHERE email = $1', [email]);
    const user = result.rows[0];

    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password.' });
    }

    // You can add JWT later here if needed
    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      }
    });

  } catch (err) {
    console.error('🔥 Login Error:', err.message);
    res.status(500).json({ message: 'Server error. Please try again later.' });
  }
});

// ➕ Add driver
router.post('/add-driver', async (req, res) => {
  const { name, email, phone, vehicle_number, capacity, password } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);

    const driverResult = await pool.query(
      `INSERT INTO drivers (driver_name, email, password)
       VALUES ($1, $2, $3) RETURNING email`,
      [name, email, hashedPassword]
    );

    const driverEmail = driverResult.rows[0].email;

    await pool.query(
      `INSERT INTO vehicles (driver_email, registration_number, capacity, remaining_capacity, status, started)
       VALUES ($1, $2, $3, $3, 'available', false)`,
      [driverEmail, vehicle_number, capacity]
    );

    res.status(201).json({ message: 'Driver added successfully' });
  } catch (err) {
    console.error('Error adding driver:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
