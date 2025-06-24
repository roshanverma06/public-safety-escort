import React, { useEffect, useState } from 'react';
import './RideConfirmation.css';
import MiniGame from '../components/MiniGame';

// Inside JSX



const RideConfirmation = () => {
  const [waitTime, setWaitTime] = useState(10 * 60); // 10 minutes in seconds

  // Mini game
  const [score, setScore] = useState(0);
  const handleClickGame = () => {
  setScore(score + 1);
  };


  // Countdown timer
  useEffect(() => {
    const timer = setInterval(() => {
      setWaitTime((prevTime) => {
        if (prevTime <= 1) clearInterval(timer);
        return prevTime - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // Convert seconds to mm:ss format
  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
      .toString()
      .padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const handleCancel = () => {
    // TODO: cancel ride from backend here
    alert('Ride cancelled.');
  };

  return (
    <div className="ride-confirmation-container">
      <h2>Assigning Vehicle...</h2>
      <p className="wait-message">
        You are in the queue. Your position is <strong>3</strong>. You will be assigned a vehicle shortly.
      </p>
      <p className="wait-time">Estimated Wait Time: {formatTime(waitTime)}</p>
      <MiniGame />
      <button onClick={handleCancel}>Cancel Ride</button>
    </div>
  );
};

export default RideConfirmation;
