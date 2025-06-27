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




setInterval(assignVehicles, 10000);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
