// server/routes/locations.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

// GET all available locations
// This will be used by the student's booking form
router.get('/', async (req, res) => {
  try {
    const allLocations = await pool.query('SELECT * FROM locations ORDER BY name ASC');
    res.status(200).json(allLocations.rows);
  } catch (err) {
    console.error('Error fetching locations:', err);
    res.status(500).json({ message: 'Server error while fetching locations' });
  }
});

// POST a new location (for admin use)
router.post('/', async (req, res) => {
    const { name, latitude, longitude } = req.body;
    if (!name || !latitude || !longitude) {
        return res.status(400).json({ message: 'Name and coordinates are required.' });
    }
    try {
        const newLocation = await pool.query(
            'INSERT INTO locations (name, latitude, longitude) VALUES ($1, $2, $3) RETURNING *',
            [name, latitude, longitude]
        );
        res.status(201).json(newLocation.rows[0]);
    } catch (err) {
        console.error('Error creating location:', err);
        res.status(500).json({ message: 'Server error while creating location' });
    }
});

module.exports = router;
