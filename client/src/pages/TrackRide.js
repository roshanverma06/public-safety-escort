// client/src/components/TrackRide.js

import React, { useEffect, useState, useRef } from 'react';
import './TrackRide.css';
import axios from 'axios';
import { socket } from '../socket';


// --- Leaflet Map Imports ---
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
const backendURL = process.env.REACT_APP_BACKEND_URL;
// --- Helper Functions & Components ---

// Calculates distance between two lat/lng points in miles
const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if ([lat1, lon1, lat2, lon2].some(coord => coord === null || coord === undefined)) return 0;
  const R = 3959; // Radius of the Earth in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// --- Custom Icons for Map Markers ---
// 1️⃣ Vehicle icon (car)
export const vehicleIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3448/3448339.png', // 🟢 Car front-facing icon
  iconSize:     [32, 32],
  iconAnchor:   [16, 16],
  popupAnchor:  [0, -16],
  shadowUrl:    null,
  shadowSize:   null,
});

// 2️⃣ Pickup point (red pin)
export const pickupIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize:     [25, 41],
  iconAnchor:   [12, 41],
  popupAnchor:  [1, -34],
  shadowSize:   [41, 41],
});

// 3️⃣ Current user location (blue pin)
export const userIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize:     [25, 41],
  iconAnchor:   [12, 41],
  popupAnchor:  [1, -34],
  shadowSize:   [41, 41],
});
// Component to automatically adjust map view
const AutoFitBounds = ({ bounds }) => {
    const map = useMap();
    useEffect(() => {
      if (bounds && bounds.isValid()) {
        map.fitBounds(bounds, { padding: [50, 50] });
      }
    }, [map, bounds]);
    return null;
};

const TrackRide = () => {
  const [rideInfo, setRideInfo] = useState(null);
  const [vehiclePosition, setVehiclePosition] = useState(null);
  const [userPosition, setUserPosition] = useState(null);
  const [eta, setEta] = useState({ distance: 0, time: 0 });
  const [userDistance, setUserDistance] = useState(0);

  const user = JSON.parse(localStorage.getItem('user'));
  const watchIdRef = useRef(null);

  // **** THE FIX IS IN THIS useEffect HOOK ****
  useEffect(() => {
    let currentVehicleId = null; // Variable to hold vehicleId for cleanup

    // 1. Fetch ride details
    const fetchRideDetails = async () => {
      try {
        const res = await axios.get(`${backendURL}/api/track/${user.email}`);
        setRideInfo(res.data);
        
        // Connect and join room right after getting data
        if (res.data.vehicle_id) {
          currentVehicleId = res.data.vehicle_id;
          socket.connect();
          socket.emit('joinVehicleRoom', currentVehicleId);
        }
      } catch (err) {
        console.error("❌ Failed to fetch ride tracking info:", err);
      }
    };

    if (user?.email) {
        fetchRideDetails();
    }

    // 2. Listen for location updates
    socket.on('vehicleLocationUpdate', (data) => {
      setVehiclePosition(data.location);
    });

    // Logging errors to console
    

    // 3. Watch the user's current location
    const geoOptions = { enableHighAccuracy: true };
    watchIdRef.current = navigator.geolocation.watchPosition(
      (pos) => setUserPosition({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => console.warn(`Geolocation Error: ${err.message}`),
      geoOptions
    );

    // 4. Cleanup on component unmount
    return () => {
      if (currentVehicleId) {
        socket.emit('leaveVehicleRoom', currentVehicleId);
      }
      socket.off('vehicleLocationUpdate');
      if (socket.connected) {
        socket.disconnect();
      }
      if (watchIdRef.current) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, [user?.email]); // <<-- Dependency array simplified to prevent re-runs

  // This second effect now ONLY handles calculations
  useEffect(() => {
    const pickupPoint = rideInfo ? { lat: parseFloat(rideInfo.pickup_lat), lng: parseFloat(rideInfo.pickup_lng) } : null;

    if (vehiclePosition && pickupPoint) {
      const distance = calculateDistance(vehiclePosition.lat, vehiclePosition.lng, pickupPoint.lat, pickupPoint.lng);
      const averageSpeed = 20; // mph
      const time = (distance / averageSpeed) * 60; // minutes
      setEta({ distance: distance.toFixed(2), time: Math.ceil(time) });
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

  if (!rideInfo) {
    return <div className="track-container">Loading tracking info...</div>;
  }
  
  const pickupPoint = rideInfo?.pickup_lat ? { lat: parseFloat(rideInfo.pickup_lat), lng: parseFloat(rideInfo.pickup_lng) } : null;
  const bounds = L.latLngBounds();
  if (pickupPoint) bounds.extend(pickupPoint);
  if (vehiclePosition) bounds.extend(vehiclePosition);
  if (userPosition) bounds.extend(userPosition);

  // The JSX remains the same
  return (
    <div className="track-container">
      <h2>🚗 Vehicle Tracking</h2>
      <div className="tracking-info">
        <div className="map-placeholder">
          {pickupPoint ? (
            <MapContainer center={pickupPoint} zoom={14} style={{ height: "100%", width: "100%" }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors' />
              <Marker position={pickupPoint} icon={pickupIcon}><Popup>Pickup Point</Popup></Marker>
              {vehiclePosition && <Marker position={vehiclePosition} icon={vehicleIcon}><Popup>Your Ride</Popup></Marker>}
              {userPosition && <Marker position={userPosition} icon={userIcon}><Popup>Your Location</Popup></Marker>}
              <AutoFitBounds bounds={bounds} />
            </MapContainer>
          ) : (
            <p>Loading map...</p>
          )}
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
