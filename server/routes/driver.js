// routes/driver.js

const express = require('express');
const router = express.Router();
const pool = require('../db');

// 1. Get assigned students for driver’s vehicle
router.get('/assigned/:vehicleId', async (req, res) => {
  const { vehicleId } = req.params;
  try {
    const result = await pool.query(
      `SELECT student_name, pickup_location_id, drop_location, otp, status 
       FROM ride_bookings 
       WHERE vehicle_id = $1 AND (status = 'assigned' OR status = 'started')`,
      [vehicleId]
    );
    res.json(result.rows);
  } catch (err) {
    console.error('Error fetching assigned students:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 2. Mark ride as started
router.post('/start-ride', async (req, res) => {
    const { driverEmail } = req.body;
  
    try {
      const vehicleRes = await pool.query(
        `SELECT id FROM vehicles WHERE driver_email = $1`,
        [driverEmail]
      );
  
      if (vehicleRes.rows.length === 0) {
        return res.status(404).json({ message: 'Vehicle not found for this driver' });
      }
  
      const vehicleId = vehicleRes.rows[0].id;
  
      // ✅ Update vehicle to started and busy
      await pool.query(
        `UPDATE vehicles 
         SET started = true, status = 'busy' 
         WHERE id = $1`,
        [vehicleId]
      );
      await pool.query(
        `UPDATE ride_bookings 
         SET status='started'  WHERE vehicle_id = $1 AND status = 'assigned'`,
        [vehicleId]
      );
  
      res.status(200).json({ message: 'Ride started and vehicle marked busy' });
    } catch (err) {
      console.error('🔥 Error starting ride:', err);
      res.status(500).json({ message: 'Server error while starting ride' });
    }
  });
  
  
  router.post('/accept-more', async (req, res) => {
    const { driverEmail } = req.body;
    console.log('🔥 Hit /accept-more route');
  
    try {
      // Get vehicle assigned to the driver
      const vehicleRes = await pool.query(
        `SELECT * FROM vehicles 
         WHERE driver_email = $1 
           AND status = 'available' 
           AND remaining_capacity > 0`,
        [driverEmail]
      );
  
      if (vehicleRes.rows.length === 0) {
        return res.status(404).json({ message: 'No eligible vehicle found' });
      }
  
      const vehicle = vehicleRes.rows[0];
      const { id: vehicleId, working_location, remaining_capacity } = vehicle;
  
      // ✅ Fetch students NOT from the working location
      const extraStudentsRes = await pool.query(
        `SELECT * FROM ride_bookings 
         WHERE status = 'pending' 
           AND pickup_location_id != $1
         ORDER BY created_at ASC
         LIMIT $2`,
        [working_location, remaining_capacity]
      );
  
      const extraStudents = extraStudentsRes.rows;
  
      // 🔁 Assign each student to this vehicle
      for (let student of extraStudents) {
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
  
        await pool.query(
          `UPDATE ride_bookings
           SET vehicle_id = $1,
               status = 'assigned',
               assigned = true,
               assigned_at = NOW(),
               otp = $2
           WHERE id = $3`,
          [vehicleId, otp, student.id]
        );
  
        await pool.query(
          `UPDATE vehicles 
           SET remaining_capacity = remaining_capacity - 1 
           WHERE id = $1`,
          [vehicleId]
        );
      }
  
      res.status(200).json({
        message: `${extraStudents.length} extra students assigned from other locations`,
        assigned: extraStudents.length
      });
  
    } catch (err) {
      console.error('🔥 Error in /driver/accept-more:', err);
      res.status(500).json({ message: 'Server error during assigning extra students' });
    }
  });

// 3. Mark ride as completed
router.post('/complete-ride', async (req, res) => {
    const { driverEmail } = req.body;
  
    try {
      const vehicleRes = await pool.query(
        `SELECT id FROM vehicles WHERE driver_email = $1`,
        [driverEmail]
      );
  
      if (vehicleRes.rows.length === 0) {
        return res.status(404).json({ message: 'Vehicle not found for this driver' });
      }
  
      const vehicleId = vehicleRes.rows[0].id;
    // Update bookings
    await pool.query(
      `UPDATE ride_bookings SET status = 'completed' WHERE vehicle_id = $1 AND status = 'dropped'`,
      [vehicleId]
    );

    // Free up the vehicle
    await pool.query(
      `UPDATE vehicles 
       SET status = 'available', remaining_capacity = capacity, started='false', working_location=null
       WHERE id = $1`,
      [vehicleId]
    );

    res.json({ message: 'Ride completed and vehicle is now available' });
  } catch (err) {
    console.error('Error completing ride:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// 4. Get vehicle info
router.get('/vehicle/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const result = await pool.query(
      `SELECT * FROM vehicles WHERE id = $1`,
      [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    console.error('Error fetching vehicle info:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// GET /api/driver/waiting-students/:email
router.get('/waiting-students/:email', async (req, res) => {
    const { email } = req.params;
  
    const driverRes = await pool.query(
      `SELECT id, working_location, remaining_capacity FROM vehicles WHERE driver_email = $1`,
      [email]
    );
    const vehicle = driverRes.rows[0];
  
    const studentsRes = await pool.query(
      `SELECT pickup_location_id, COUNT(*) 
       FROM ride_bookings 
       WHERE status = 'pending' AND pickup_location_id <> $1 
       GROUP BY pickup_location_id
       ORDER BY COUNT(*) DESC LIMIT 1`,
      [vehicle.working_location]
    );
  
    if (studentsRes.rows.length === 0) {
      return res.json({ location: null, count: 0 });
    }
  
    const { pickup_location_id, count } = studentsRes.rows[0];
    res.json({ location: pickup_location_id, count: parseInt(count) });
  });
  

// routes/driver.js
router.get('/dashboard/:email', async (req, res) => {
    const driverEmail = req.params.email;
  
    try {
      // 1. Find vehicle assigned to the driver
      const vehicleRes = await pool.query(
        `SELECT * FROM vehicles WHERE driver_email = $1`,
        [driverEmail]
      );
  
      if (vehicleRes.rows.length === 0) {
        return res.status(404).json({ message: 'No vehicle assigned to this driver' });
      }
  
      const vehicle = vehicleRes.rows[0];
  
      // 2. Fetch all students assigned to this vehicle
      const studentsRes = await pool.query(
        `SELECT id, student_name, pickup_location_id, drop_location, otp, status
         FROM ride_bookings
         WHERE vehicle_id = $1
           AND status IN ('assigned', 'picked_up', 'started')
         ORDER BY pickup_location_id, created_at ASC`,
        [vehicle.id]
      );
      
  
      const assignedStudents = studentsRes.rows;
  
      // 3. Send structured response
      res.status(200).json({
        vehicle: {
          vehicleId: vehicle.id,
          vehicleNumber: vehicle.registration_number,
          capacity: vehicle.capacity,
          remaining: vehicle.remaining_capacity,
          status: vehicle.status
        },
        students: assignedStudents
      });
  
    } catch (err) {
      console.error('❌ Driver dashboard fetch error:', err);
      res.status(500).json({ message: 'Server error while loading driver dashboard' });
    }
  });

  
  
  

module.exports = router;
