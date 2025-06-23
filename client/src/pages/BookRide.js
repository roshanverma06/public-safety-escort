// src/pages/BookRide.js

import React, { useState, useEffect } from 'react';
import './BookRide.css';

function BookRide() {
  // Simulated profile info – later replace with real auth/user context
  const studentProfile = {
    name: 'Roshan Verma',
    cwid: 'A12345678',
    savedAddress: '3500 S State St, Chicago, IL',
  };

  const [studentName, setStudentName] = useState('');
  const [pickupLocation, setPickupLocation] = useState('');
  const [useSavedDrop, setUseSavedDrop] = useState(true);
  const [manualDrop, setManualDrop] = useState('');

  useEffect(() => {
    // Simulate fetching from profile
    setStudentName(studentProfile.name);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const rideData = {
      name: studentName,
      cwid: studentProfile.cwid,
      pickup: pickupLocation,
      drop: useSavedDrop ? studentProfile.savedAddress : manualDrop,
    };
    console.log('Booking data:', rideData);
  };

  return (
    <div className="bookride-container">
      <h1>Book a Safety Escort Ride</h1>
      <form className="bookride-form" onSubmit={handleSubmit}>

        <label>Student Name:</label>
        <input
          type="text"
          value={studentName}
          onChange={(e) => setStudentName(e.target.value)}
          required
        />

        <label>Student CWID:</label>
        <input type="text" value={studentProfile.cwid} disabled />

        <label>Pickup Location:</label>
        <select
          value={pickupLocation}
          onChange={(e) => setPickupLocation(e.target.value)}
          required
        >
          <option value="">Select pickup point</option>
          <option value="Library">Library</option>
          <option value="Harman Hall">Harman Hall</option>
          <option value="Galvin Tower">Galvin Tower</option>
        </select>

        <label>Drop Location:</label>
        <div className="radio-group">
          <label>
            <input
              type="radio"
              name="dropOption"
              checked={useSavedDrop}
              onChange={() => setUseSavedDrop(true)}
            />
            Use saved address ({studentProfile.savedAddress})
          </label>
          <label>
            <input
              type="radio"
              name="dropOption"
              checked={!useSavedDrop}
              onChange={() => setUseSavedDrop(false)}
            />
            Enter manually
          </label>
        </div>

        {!useSavedDrop && (
          <input
            type="text"
            placeholder="Enter drop address"
            value={manualDrop}
            onChange={(e) => setManualDrop(e.target.value)}
            required
          />
        )}

        <button type="submit">Submit Booking</button>
      </form>
    </div>
  );
}

export default BookRide;
