// src/pages/RideConfirmation.js

import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import './RideConfirmation.css';
import MiniGame from '../components/MiniGame';
import axios from 'axios';

const RideConfirmation = () => {
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const initialPosition = parseInt(queryParams.get('position'), 10);
  const initialWait = parseInt(queryParams.get('wait'), 10);

  const [queuePosition, setQueuePosition] = useState(initialPosition || null);
  const [waitTime, setWaitTime] = useState(initialWait*60 || 600);
  const [score, setScore] = useState(0);

  const user = JSON.parse(localStorage.getItem('user'));

  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setWaitTime((prevTime) => {
        if (prevTime <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCancel = async () => {
    try {
      await axios.post('http://localhost:5050/api/cancel-ride', { email: user.email });
      alert('Ride cancelled.');
      window.location.href = '/';
    } catch (err) {
      console.error("Failed to cancel ride:", err);
      alert('Failed to cancel ride.');
    }
  };

  return (
    <div className="ride-confirmation-container">
      <h2>Assigning Vehicle...</h2>
      <p className="wait-message">
        You are in the queue. Your position is <strong>{queuePosition ?? '...'}</strong>. You will be assigned a vehicle shortly.
      </p>
      <p className="wait-time">Estimated Wait Time: {formatTime(waitTime)}</p>
      <MiniGame />
      <button onClick={handleCancel}>Cancel Ride</button>
    </div>
  );
};

export default RideConfirmation;
