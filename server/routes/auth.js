const express = require('express');
const bcrypt = require('bcryptjs');
const pool = require('../db');

const router = express.Router();

// @route    POST /api/auth/register
// @desc     Register a new student
router.post('/register', async (req, res) => {
  const { name, cwid, email, password, address } = req.body;
  console.log("Incoming registration data:", { name, cwid, email, password, address });


  try {
    // Validate fields
    if (!name || !cwid || !email || !password) {
      return res.status(400).json({ message: 'Please fill in all required fields.' });
    }

    // Check if student already exists
    const existing = await pool.query('SELECT * FROM students WHERE email = $1 OR cwid = $2', [email, cwid]);
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Email or CWID already registered.' });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Insert student
    await pool.query(
      'INSERT INTO students (name, cwid, email, password, address) VALUES ($1, $2, $3, $4, $5)',
      [name, cwid, email, hashedPassword, address]
    );

    res.status(201).json({ message: 'Student registered successfully.' });

  } catch (err) {
    console.error(err);
    console.error("🔥 Server Error:", err.message);
    res.status(500).json({ message: 'Server error. Try again later.' });
  }
});

// @route    POST /api/auth/login
// @desc     Authenticate student and return success or failure
router.post('/login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if fields are present
      if (!email || !password) {
        return res.status(400).json({ message: 'Please enter both email and password.' });
      }
  
      // Check if student exists
      const result = await pool.query('SELECT * FROM students WHERE email = $1', [email]);
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
          cwid: user.cwid,
          address: user.address
        }
      });
  
    } catch (err) {
      console.error('🔥 Login Error:', err.message);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  });

// Rout for driver login
  router.post('/driver-login', async (req, res) => {
    const { email, password } = req.body;
  
    try {
      // Check if fields are present
      if (!email || !password) {
        return res.status(400).json({ message: 'Please enter both email and password.' });
      }
  
      // Check if driver exists
      const result = await pool.query('SELECT * FROM drivers WHERE email = $1', [email]);
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
          name: user.driver_name,
          email: user.email,
        }
      });
  
    } catch (err) {
      console.error('🔥 Login Error:', err.message);
      res.status(500).json({ message: 'Server error. Please try again later.' });
    }
  });  
  

module.exports = router;
