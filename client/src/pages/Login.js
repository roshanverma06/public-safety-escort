import React, { useState, useEffect } from 'react';
import './Login.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
const backendURL = process.env.REACT_APP_BACKEND_URL;

const Login = () => {


  const [formData, setFormData] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const user = localStorage.getItem('user');
    if (user) {
      navigate('/book-ride'); // or dashboard/status depending on your flow
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // reset error

    try {
      const res = await axios.post('${backendURL}/api/auth/login', formData);

      if (res.status === 200) {
        console.log('✅ Login successful:', res.data);

        // Optionally save user to localStorage or context
        localStorage.setItem('user', JSON.stringify(res.data.user));

        // Redirect to Book Ride page
        navigate('/book-ride');
      }
    } catch (err) {
      console.error('❌ Login failed:', err.response?.data?.message || err.message);
      setError('Login failed. Please check your credentials.');
    }
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Student Login</h2>
        {error && <p style={{ color: 'red' }}>{error}</p>}
        <label>
          Email:
          <input
          type="email"
          name="email"
          placeholder="Student Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        </label>

        <label>
          Password:
          <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        </label>
        <div className="login-links">
            <a href="/forgotpassword">Forgot Password?</a>
            <span> | </span>
            <a href="/register">Create Account</a>
        </div>
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
