// client/src/socket.js

import { io } from 'socket.io-client';
const backendURL = process.env.REACT_APP_BACKEND_URL;
// The URL of your backend server
const SERVER_URL = '${backendURL}';

export const socket = io(SERVER_URL, {
    autoConnect: false,
    withCredentials: true,  // ADD THIS
    transports: ['websocket'] // OPTIONAL: Force WebSocket to avoid polling fallback
  });
  
