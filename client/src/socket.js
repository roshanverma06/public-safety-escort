// client/src/socket.js

import { io } from 'socket.io-client';

// The URL of your backend server
const SERVER_URL = 'http://localhost:5050';

export const socket = io(SERVER_URL, {
    autoConnect: false,
    withCredentials: true,  // ADD THIS
    transports: ['websocket'] // OPTIONAL: Force WebSocket to avoid polling fallback
  });
  
