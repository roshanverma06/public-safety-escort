import React from 'react';
import './TrackRide.css';

const TrackRide = () => {
  const vehicleRegNumber = "IL-TECH-9876"; // placeholder
  const otp = "5421"; // mock OTP
  const pickupLocation = "Library"; // mock location
  const estimatedArrival = "5 mins"; // placeholder

  const handleNavigation = () => {
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=41.8357,-87.6276`, 
      '_blank'
    );
  };

  return (
    <div className="track-container">
      <h2>🚗 Vehicle Tracking</h2>

      <div className="tracking-info">
        <div className="map-placeholder">
            <p>🗺️ Map will appear here with your location and the vehicle location.</p>
        </div>
        <p><strong>Assigned Vehicle:</strong> {vehicleRegNumber}</p>
        <p><strong>Pickup Location:</strong> {pickupLocation}</p>
        <p><strong>Arriving in:</strong> {estimatedArrival}</p>
        <p><strong>Your OTP:</strong> <span className="otp-box">{otp}</span></p>
      </div>

      <button className="navigate-btn" onClick={handleNavigation}>
        Navigate to Pickup Point
      </button>
    </div>
  );
};

export default TrackRide;
