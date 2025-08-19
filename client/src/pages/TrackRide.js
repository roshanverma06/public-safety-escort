// client/src/components/TrackRide.js

import React, { useEffect, useState, useRef } from 'react';
import './TrackRide.css';
import axios from 'axios';
import { socket } from '../socket';
import { 
  GoogleMap, 
  Marker, 
  InfoWindow, 
  useJsApiLoader, 
  DirectionsRenderer 
} from '@react-google-maps/api';

const backendURL = process.env.REACT_APP_BACKEND_URL;

// Singleton loader config (must not change between renders)
const loaderConfig = {
  googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_KEY,
  libraries: ['places']
};

const containerStyle = { width: '100%', height: '400px' };

// Haversine distance in miles
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some(coord => coord === null || coord === undefined)) return 0;
  const R = 3959;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) *
    Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const TrackRide = () => {
  const [rideInfo, setRideInfo] = useState(null);
  const [vehiclePosition, setVehiclePosition] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [eta, setEta] = useState({ distance: 0, time: 0 });
  const [userDistance, setUserDistance] = useState(0);
  const [directions, setDirections] = useState(null);

  const user = JSON.parse(localStorage.getItem('user'));
  const watchIdRef = useRef(null);

  // Google Maps loader - singleton
  const { isLoaded } = useJsApiLoader(loaderConfig);

  useEffect(() => {
    let currentVehicleId = null;

    const fetchRideDetails = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/track/${user.email}`);
        setRideInfo(res.data);

        if (res.data.vehicle_id) {
          currentVehicleId = res.data.vehicle_id;
          socket.connect();
          socket.emit('joinVehicleRoom', currentVehicleId);
        }
      } catch (err) {
        console.error("❌ Failed to fetch ride tracking info:", err);
      }
    };

    if (user?.email) fetchRideDetails();

    socket.on('vehicleLocationUpdate', (data) => {
      setVehiclePosition(data.location);
    });

    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn(`Geolocation Error: ${err.message}`),
      { enableHighAccuracy: true }
    );

    return () => {
      if (currentVehicleId) socket.emit('leaveVehicleRoom', currentVehicleId);
      socket.off('vehicleLocationUpdate');
      if (socket.connected) socket.disconnect();
      if (watchIdRef.current) navigator.geolocation.clearWatch(watchIdRef.current);
    };
  }, [user?.email]);

  useEffect(() => {
    const pickupPoint = rideInfo
      ? { lat: parseFloat(rideInfo.pickup_lat), lng: parseFloat(rideInfo.pickup_lng) }
      : null;

    if (vehiclePosition && pickupPoint) {
      const distance = calculateDistance(vehiclePosition.lat, vehiclePosition.lng, pickupPoint.lat, pickupPoint.lng);
      const averageSpeed = 20;
      const time = (distance / averageSpeed) * 60;
      setEta({ distance: distance.toFixed(2), time: Math.ceil(time) });

      // Fetch route directions using Google Maps DirectionsService
      const directionsService = new window.google.maps.DirectionsService();
      directionsService.route(
        {
          origin: vehiclePosition,
          destination: pickupPoint,
          travelMode: window.google.maps.TravelMode.DRIVING,
        },
        (result, status) => {
          if (status === 'OK') {
            setDirections(result);
          } else {
            console.error('Directions request failed due to ', status);
          }
        }
      );
    }

    if (userPosition && pickupPoint) {
      const distance = calculateDistance(userPosition.lat, userPosition.lng, pickupPoint.lat, pickupPoint.lng);
      setUserDistance(distance.toFixed(2));
    }
  }, [vehiclePosition, userPosition, rideInfo]);

  const handleNavigation = () => {
    const lat = rideInfo?.pickup_lat;
    const lng = rideInfo?.pickup_lng;
    if (lat && lng) {
      window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank');
    }
  };

  if (!rideInfo || !isLoaded) {
    return <div className="track-container">Loading tracking info...</div>;
  }

  const pickupPoint = rideInfo?.pickup_lat
    ? { lat: parseFloat(rideInfo.pickup_lat), lng: parseFloat(rideInfo.pickup_lng) }
    : null;

  const center = vehiclePosition || pickupPoint || { lat: 41.8781, lng: -87.6298 };

  return (
    <div className="track-container">
      <h2>🚗 Vehicle Tracking</h2>
      <div className="tracking-info">
        <div className="map-placeholder">
          <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14}>
            {pickupPoint && <Marker position={pickupPoint} label="P" />}
            {vehiclePosition && (
              <Marker position={vehiclePosition} label="V">
                <InfoWindow position={vehiclePosition}>
                  <div>Your Ride</div>
                </InfoWindow>
              </Marker>
            )}
            {userPosition && (
              <Marker position={userPosition} label="U">
                <InfoWindow position={userPosition}>
                  <div>You are here</div>
                </InfoWindow>
              </Marker>
            )}
            {directions && <DirectionsRenderer directions={directions} />}
          </GoogleMap>
        </div>
        <p><strong>Assigned Vehicle:</strong> {rideInfo.registration_number}</p>
        <p><strong>Pickup Location:</strong> {rideInfo.pickup_location_name}</p>
        <p><strong>Arriving in:</strong> {eta.time > 0 ? `${eta.time} mins (${eta.distance} miles away)` : 'Calculating...'}</p>
        <p>You are <strong>{userDistance > 0 ? `${userDistance} miles` : 'Calculating distance'}</strong> from the pickup point.</p>
        <p><strong>Your OTP:</strong> <span className="otp-box">{rideInfo.otp}</span></p>
      </div>
      <button className="navigate-btn" onClick={handleNavigation}>
        Navigate to Pickup Point
      </button>
    </div>
  );
};

export default TrackRide;
