
import React, { useState, useEffect } from 'react';
import './BookRide.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const backendURL = process.env.REACT_APP_BACKEND_URL;

function BookRide() {
  const [formData, setFormData] = useState({
    name: '',
    cwid: '',
    address: '', // User's saved address for drop-off
    pickupLocationId: '', // ID for the selected pickup location
  });
  
  // State for the list of available pickup locations
  const [locations, setLocations] = useState([]);

  // Original state for handling drop-off location
  const [useSavedDrop, setUseSavedDrop] = useState(true);
  const [manualDrop, setManualDrop] = useState('');

  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchInitialData = async () => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user?.email) return;

      try {
        const profilePromise = axios.get(`${backendURL}/api/profile/${user.email}`);
        const locationsPromise = axios.get(`${backendURL}/api/locations`);

        const [profileRes, locationsRes] = await Promise.all([profilePromise, locationsPromise]);
        
        const { name, cwid, address } = profileRes.data;
        setFormData(prev => ({ ...prev, name, cwid, address }));
        
        setLocations(locationsRes.data);
      } catch (err) {
        console.error('❌ Failed to fetch initial data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.pickupLocationId) {
        alert('Please select a pickup location.');
        return;
    }

    const bookingData = {
      cwid: formData.cwid,
      name: formData.name,
      pickup: formData.pickupLocationId,
      dropoff: useSavedDrop ? formData.address : manualDrop,
    };

    try {
      const res = await axios.post(`${backendURL}/api/booking`, bookingData);
      const { queuePosition, estimatedWait } = res.data;
      navigate(`/ride-confirmation?position=${queuePosition}&wait=${estimatedWait}`);
    } catch (err) {
      console.error('Booking failed:', err);
      alert('Booking failed. Please try again.');
    }
  };

  if (loading) return <div className="book-ride-container"><h2>Loading...</h2></div>;

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
            id="pickupLocationId"
            name="pickupLocationId"
            value={formData.pickupLocationId}
            onChange={handleChange}
            required
          >
            <option value="" disabled>Select pickup point</option>
            {locations.map(location => (
              <option key={location.id} value={location.id}>
                {location.name}
              </option>
            ))}
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
