import React, { useEffect, useState } from 'react';
import './TrackRide.css';
import axios from 'axios';

const TrackRide = () => {
  const [rideInfo, setRideInfo] = useState(null);
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const fetchRideDetails = async () => {
      try {
        const res = await axios.get(`http://localhost:5050/api/track/${user.email}`);
        setRideInfo(res.data);
      } catch (err) {
        console.error("❌ Failed to fetch ride tracking info:", err);
      }
    };

    if (user?.email) fetchRideDetails();
  }, [user]);

  const handleNavigation = () => {
    // You can replace lat/lng dynamically if needed
    const lat = rideInfo?.pickup_lat || 41.8357;
    const lng = rideInfo?.pickup_lng || -87.6276;
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`,
      '_blank'
    );
  };

  if (!rideInfo) {
    return <div className="track-container">Loading tracking info...</div>;
  }

  return (
    <div className="track-container">
      <h2>🚗 Vehicle Tracking</h2>

      <div className="tracking-info">
        <div className="map-placeholder">
          <p>🗺️ Map will appear here with your location and the vehicle location.</p>
        </div>
        <p><strong>Assigned Vehicle:</strong> {rideInfo.registration_number}</p>
        <p><strong>Pickup Location:</strong> {rideInfo.pickup_location}</p>
        <p><strong>Arriving in:</strong> {rideInfo.estimated_arrival || '5 mins'}</p>
        <p><strong>Your OTP:</strong> <span className="otp-box">{rideInfo.otp}</span></p>
      </div>

      <button className="navigate-btn" onClick={handleNavigation}>
        Navigate to Pickup Point
      </button>
    </div>
  );
};

export default TrackRide;
