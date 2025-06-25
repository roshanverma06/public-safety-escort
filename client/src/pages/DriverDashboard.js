import React, { useState } from 'react';
import './DriverDashboard.css';

const initialRides = [
  {
    name: 'Roshan Verma',
    cwid: 'A12345678',
    pickup: 'Library',
    dropoff: '123 S Wabash Ave, Chicago, IL',
    otp: '5421',
    status: 'pending',
  },
  {
    name: 'Jane Doe',
    cwid: 'A98765432',
    pickup: 'Harman Hall',
    dropoff: '77 S Green St, Chicago, IL',
    otp: '9164',
    status: 'pending',
  },
];

const DriverDashboard = () => {
  const [rides, setRides] = useState(initialRides);
  const [otpModal, setOtpModal] = useState({ show: false, index: null, action: null });
  const [enteredOtp, setEnteredOtp] = useState('');

  const handleOpenModal = (index, action) => {
    setOtpModal({ show: true, index, action });
    setEnteredOtp('');
  };

  const handleVerifyOtp = () => {
    const ride = rides[otpModal.index];
    if (enteredOtp === ride.otp) {
      const updatedRides = [...rides];
      if (otpModal.action === 'pickup') {
        updatedRides[otpModal.index].status = 'picked';
      } else if (otpModal.action === 'dropoff') {
        updatedRides.splice(otpModal.index, 1); // remove after drop-off
      }
      setRides(updatedRides);
      setOtpModal({ show: false, index: null, action: null });
    } else {
      alert("Incorrect OTP");
    }
  };

  return (
    <div className="driver-dashboard-container">
      <h2>🚘 Driver Dashboard</h2>

      {rides.length === 0 ? (
        <p>No active rides assigned.</p>
      ) : (
        rides.map((ride, index) => (
          <div className="ride-card" key={index}>
            <p><strong>Student:</strong> {ride.name} ({ride.cwid})</p>
            <p><strong>Pickup:</strong> {ride.pickup}</p>
            <p><strong>Drop-off:</strong> {ride.dropoff}</p>
            <a
              href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(ride.dropoff)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="navigate-link"
            >
              Navigate
            </a>
            <div className="actions">
              {ride.status === 'pending' && (
                <button className="pickup" onClick={() => handleOpenModal(index, 'pickup')}>Mark as Picked Up</button>
              )}
              {ride.status === 'picked' && (
                <button className="dropoff" onClick={() => handleOpenModal(index, 'dropoff')}>Mark as Dropped</button>
              )}
            </div>
            <p className="ride-status">Status: <strong>{ride.status.toUpperCase()}</strong></p>
          </div>
        ))
      )}

      {otpModal.show && (
        <div className="otp-modal">
          <div className="otp-modal-content">
            <h3>Enter OTP to confirm</h3>
            <input
              type="text"
              placeholder="Enter OTP"
              value={enteredOtp}
              onChange={(e) => setEnteredOtp(e.target.value)}
            />
            <div className="otp-buttons">
              <button className="confirm" onClick={handleVerifyOtp}>Verify</button>
              <button className="cancel" onClick={() => setOtpModal({ show: false, index: null, action: null })}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DriverDashboard;
