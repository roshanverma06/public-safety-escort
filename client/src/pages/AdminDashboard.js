import React, { useState } from 'react';
import axios from 'axios';
import './AdminDashboard.css';
const backendURL = process.env.REACT_APP_BACKEND_URL;
const AdminDashboard = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    vehicle_number: '',
    capacity: '',
    password: ''
  });

  const handleChange = (e) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleAddDriver = async () => {
    try {
      await axios.post(`${backendURL}/api/admin/add-driver`, form);
      alert('Driver added successfully');
      setForm({ name: '', email: '',  vehicle_number: '', capacity: '', password: '' });
    } catch (err) {
      alert('Error adding driver');
    }
  };

  return (
    <div className="admin-form-container">
  <h2>Add New Driver</h2>
  <input
    name="name"
    placeholder="Driver Name"
    value={form.name}
    onChange={handleChange}
    className="admin-input"
/>
  <input
    name="email"
    placeholder="Email"
    value={form.email}
    onChange={handleChange}
    className="admin-input"
/>
  <input
    name="vehicle_number"
    placeholder="Vehicle Number"
    value={form.vehicle_number}
    onChange={handleChange}
    className="admin-input"
/>
  <input
    name="capacity"
    placeholder="Capacity"
    type="number"
    value={form.capacity}
    onChange={handleChange}
    className="admin-input"
/>
  <input
    name="password"
    placeholder="Driver Password"
    type="password"
    value={form.password}
    onChange={handleChange}
    className="admin-input"
/>
  <button onClick={handleAddDriver} className="admin-submit-btn">
    Add Driver
  </button>
</div>

  );
};

export default AdminDashboard;
