const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/auth');
const pool = require('./db');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.get('/', (req, res) => {
  res.send('Server is up and running 🚀');
});

const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);

const bookRideRoutes = require('./routes/booking');
app.use('/api/booking', bookRideRoutes);





app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
