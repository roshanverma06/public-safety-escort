import React, { useState } from 'react';
import './DriverHistory.css';

const DriverHistory = () => {
  const [history, setHistory] = useState([
    {
      name: 'Roshan Verma',
      cwid: 'A12345678',
      pickup: 'Library',
      dropoff: '123 S Wabash Ave, Chicago, IL',
      timestamp: '2025-06-24 10:45 AM',
    },
    {
      name: 'Jane Doe',
      cwid: 'A98765432',
      pickup: 'Harman Hall',
      dropoff: '77 S Green St, Chicago, IL',
      timestamp: '2025-06-24 11:15 AM',
    },
  ]);

  return (
    <div className="driver-history-container">
      <h2>📋 Ride History</h2>
      {history.length === 0 ? (
        <p>No rides completed yet.</p>
      ) : (
        history.map((ride, index) => (
          <div className="history-card" key={index}>
            <p><strong>Student:</strong> {ride.name} ({ride.cwid})</p>
            <p><strong>Pickup:</strong> {ride.pickup}</p>
            <p><strong>Drop-off:</strong> {ride.dropoff}</p>
            <p><strong>Dropped At:</strong> {ride.timestamp}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default DriverHistory;
