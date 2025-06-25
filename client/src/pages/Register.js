import React, { useState } from 'react';
import './Register.css';
import axios from 'axios';

function Register() {
  const [formData, setFormData] = useState({
    name: '',
    cwid: '',
    email: '',
    address: '', 
    password: '',
    confirmPassword: '',
  });
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const response = await axios.post("http://localhost:5050/api/auth/register", formData);
      setSuccessMessage('Successfully registered!');
      setFormData({ name: '', cwid: '', email: '', address: '', password: '' });
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="register-container">
      <h2>Student Registration</h2>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {errorMessage && <p style={{ color: 'red' }}>{errorMessage}</p>}
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
          <input type="password" name="confirmPassword" value={formData.confirmPassword || ''} onChange={handleChange} required />
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
