import React, { useState } from 'react';
import './Register.css';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    cwid: '',
    email: '',
    address: '', 
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Registered student:', formData);
    // You can send formData to the backend here
  };

  return (
    <div className="register-container">
      <h2>Student Registration</h2>
      <form onSubmit={handleSubmit} className="register-form">
        <label>
          Full Name
          <input type="text" name="name" value={formData.name} onChange={handleChange} required />
        </label>

        <label>
          CWID
          <input type="text" name="cwid" value={formData.cwid} onChange={handleChange} required />
        </label>

        <label>
          Student Email
          <input type="email" name="email" value={formData.email} onChange={handleChange} required />
        </label>

        <label>
          Address
          <input type="text" name="address" value={formData.address} onChange={handleChange} required />
        </label>

        <label>
          Password
          <input type="password" name="password" value={formData.password} onChange={handleChange} required />
        </label>

        <label>
          Confirm Password
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} required />
        </label>

        <div className="login-links">
            <span> Already have an account? </span>
            <a href="/">Login</a>
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
