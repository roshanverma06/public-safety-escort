// server/index.js

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const http = require('http');
const { Server } = require("socket.io");

const authRoutes = require('./routes/auth');
const pool = require('./db');
const assignVehicles = require('./utils/assignVehicles');
dotenv.config();

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000", // Explicitly allow your React app's origin
    methods: ["GET", "POST"],
    allowedHeaders: ["my-custom-header"], // Optional: Add any custom headers if you use them
    credentials: true
  }
});

const PORT = process.env.PORT || 5050;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
const adminLogin = require('./routes/admin');
app.use('/api/admin', adminLogin);
app.use('/api/auth', authRoutes);
const profileRoutes = require('./routes/profile');
app.use('/api/profile', profileRoutes);
const bookRideRoutes = require('./routes/booking');
app.use('/api/booking', bookRideRoutes);
const trackRoutes = require('./routes/track');
app.use('/api/track', trackRoutes);
const driverRoutes = require('./routes/driver');
app.use('/api/driver', driverRoutes);
const locationsRoutes = require('./routes/locations');
app.use('/api/locations', locationsRoutes);

// Socket.IO Connection & Room Logic
io.on('connection', (socket) => {
  console.log(`✅ User connected: ${socket.id}`);

  socket.on('joinVehicleRoom', (vehicleId) => {
    const roomName = `vehicle-${vehicleId}`;
    socket.join(roomName);
    console.log(`User ${socket.id} joined room: ${roomName}`);
  });

  socket.on('driverLocationUpdate', (data) => {
    const { vehicleId, location } = data;
    if (vehicleId) {
      const roomName = `vehicle-${vehicleId}`;
      io.to(roomName).emit('vehicleLocationUpdate', { location });
    }
  });
  
  socket.on('leaveVehicleRoom', (vehicleId) => {
    const roomName = `vehicle-${vehicleId}`;
    socket.leave(roomName);
    console.log(`User ${socket.id} left room: ${roomName}`);
  });

  socket.on('disconnect', () => {
    console.log(`❌ User disconnected: ${socket.id}`);
  });
});

setInterval(assignVehicles, 50000);

// Start the server using the http server instance
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
