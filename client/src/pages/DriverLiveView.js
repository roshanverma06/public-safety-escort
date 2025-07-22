// client/src/components/DriverLiveView.js

import React, { useState, useEffect, useRef } from 'react';
import { socket } from '../socket';

// This component expects `vehicle` data to be passed in as a prop
// from the main driver dashboard.
const DriverLiveView = ({ vehicle }) => {
  const [isTransmitting, setIsTransmitting] = useState(false);
  const [location, setLocation] = useState(null);
  const [error, setError] = useState(null);
  const watchId = useRef(null);

  useEffect(() => {
    // Connect and join room when the component mounts with a valid vehicle
    if (vehicle?.vehicleId) {
      socket.connect();
      socket.emit('joinVehicleRoom', vehicle.vehicleId);
    }

    // Cleanup on unmount
    return () => {
      if (vehicle?.vehicleId) {
        socket.emit('leaveVehicleRoom', vehicle.vehicleId);
      }
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
      }
      socket.disconnect();
    };
  }, [vehicle]);

  const handleToggleTransmit = () => {
    if (!isTransmitting) {
      // Start transmitting
      if (!navigator.geolocation) {
        setError("Geolocation is not supported.");
        return;
      }
      
      const options = { enableHighAccuracy: true };
      watchId.current = navigator.geolocation.watchPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          const newLocation = { lat: latitude, lng: longitude };
          setLocation(newLocation);
          
          // Emit location with vehicleId to the server
          socket.emit('driverLocationUpdate', {
            vehicleId: vehicle.vehicleId,
            location: newLocation,
          });
        },
        (err) => setError(`Geolocation Error: ${err.message}`),
        options
      );
      setIsTransmitting(true);
      setError(null);
    } else {
      // Stop transmitting
      if (watchId.current) {
        navigator.geolocation.clearWatch(watchId.current);
        watchId.current = null;
      }
      setIsTransmitting(false);
    }
  };

  if (!vehicle?.vehicleId) {
    return <div>Loading vehicle data...</div>;
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '1rem', marginTop: '1rem' }}>
      <h3>Live GPS Transmitter</h3>
      <p>Vehicle: {vehicle.vehicleNumber}</p>
      <button onClick={handleToggleTransmit}>
        {isTransmitting ? 'Stop Transmitting' : 'Start Transmitting Location'}
      </button>
      <p><strong>Status:</strong> {isTransmitting ? '🔴 Live' : '⚫ Idle'}</p>
      {location && <p>Lat: {location.lat.toFixed(5)}, Lng: {location.lng.toFixed(5)}</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}
    </div>
  );
};

export default DriverLiveView;
