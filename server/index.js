const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const pool = require('./db');
const assignVehicles = require('./utils/assignVehicles'); 

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);


const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

const bookRideRoutes = require('./routes/booking');
app.use('/api/booking', bookRideRoutes);

const trackRoutes = require('./routes/track');
app.use('/api/track', trackRoutes);

const driverRoutes = require('./routes/driver');
app.use('/api/driver', driverRoutes);




const pickupStudent = require('./routes/driver/pickup-student');
const dropStudent = require('./routes/driver/drop-student');
const noShow = require('./routes/driver/no-show');
app.use('/api/driver/pickup-student', pickupStudent);
app.use('/api/driver/drop-student', dropStudent);
app.use('/api/driver/no-show', noShow);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);





setInterval(assignVehicles, 10000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
