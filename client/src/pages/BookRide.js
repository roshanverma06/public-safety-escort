// src/pages/BookRide.js

import React, { useState, useEffect } from 'react';
import './BookRide.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function BookRide() {
  const [formData, setFormData] = useState({
    name: '',
    cwid: '',
    address: '',
    pickup: '',
    dropoff: ''
  });
  const [useSavedDrop, setUseSavedDrop] = useState(true);
  const [manualDrop, setManualDrop] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchProfile = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.email) return;

      try {
        const res = await axios.get(`http://localhost:5050/api/profile/${user.email}`);
        const { name, cwid, address } = res.data;
        setFormData(prev => ({ ...prev, name, cwid, address, dropoff: address }));
      } catch (err) {
        console.error('❌ Failed to fetch profile:', err);
      }
    };

    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const bookingData = {
      ...formData,
      dropoff: useSavedDrop ? formData.address : manualDrop,
    };

    try {
      const res = await axios.post('http://localhost:5050/api/booking', bookingData);
      const { queuePosition, estimatedWait } = res.data;
      

      // Redirect to confirmation page with estimated wait time
      navigate(`/ride-confirmation?position=${queuePosition}&wait=${estimatedWait}`);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Booking failed. Please try again.');
    }
  };

  return (
    <div className="bookride-container">
      <h1>Book a Safety Escort Ride</h1>
      <form className="bookride-form" onSubmit={handleSubmit}>
        <label>Student Name:</label>
        <input type="text" value={formData.name} disabled />

        <label>Student CWID:</label>
        <input type="text" value={formData.cwid} disabled />

        <label>Pickup Location:</label>
        <select
          value={formData.pickup}
          onChange={(e) => setFormData(prev => ({ ...prev, pickup: e.target.value }))}
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
            Use saved address ({formData.address})
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
