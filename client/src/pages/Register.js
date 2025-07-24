import React, { useState } from 'react';
import './Register.css';
import axios from 'axios';
const backendURL = process.env.REACT_APP_BACKEND_URL;

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
  const [submitErrorMessage, setSubmitErrorMessage] = useState('');
  const [errors, setErrors] = useState({}); // For field-wise inline errors

  const validate = () => {
    const newErrors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.name.trim()) newErrors.name = "Name is required";
    if (!formData.cwid.trim()) newErrors.cwid = "CWID is required";
    if (!emailRegex.test(formData.email)) newErrors.email = "Enter a valid email";
    if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
    if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = "Passwords do not match";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' }); // Clear individual error on change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setSubmitErrorMessage('');

    if (!validate()) return;

    try {
      const response = await axios.post(`${backendURL}/api/auth/register`, formData);
      setSuccessMessage('Successfully registered!');
      setFormData({
        name: '',
        cwid: '',
        email: '',
        address: '',
        password: '',
        confirmPassword: '',
      });
      setErrors({});
    } catch (error) {
      setSubmitErrorMessage(error.response?.data?.message || 'Registration failed.');
    }
  };

  return (
    <div className="register-container">
      <h2>Student Registration</h2>
      {successMessage && <p style={{ color: 'green' }}>{successMessage}</p>}
      {submitErrorMessage && <p style={{ color: 'red' }}>{submitErrorMessage}</p>}

      <form onSubmit={handleSubmit} className="register-form">
        <label>
          Full Name
          <input type="text" name="name" value={formData.name} onChange={handleChange} />
          {errors.name && <span className="error">{errors.name}</span>}
        </label>

        <label>
          CWID
          <input type="text" name="cwid" value={formData.cwid} onChange={handleChange} />
          {errors.cwid && <span className="error">{errors.cwid}</span>}
        </label>

        <label>
          Student Email
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
          {errors.email && <span className="error">{errors.email}</span>}
        </label>

        <label>
          Address
          <input type="text" name="address" value={formData.address} onChange={handleChange} />
        </label>

        <label>
          Password
          <input type="password" name="password" value={formData.password} onChange={handleChange} />
          {errors.password && <span className="error">{errors.password}</span>}
        </label>

        <label>
          Confirm Password
          <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} />
          {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
        </label>

        <div className="login-links">
          <span>Already have an account? </span>
          <a href="/">Login</a>
        </div>

        <button type="submit">Register</button>
      </form>
    </div>
  );
}

export default Register;
