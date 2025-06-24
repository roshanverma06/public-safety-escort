import React, { useState } from 'react';
import './Login.css';

const Login = () => {
  const [cwid, setCwid] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // TODO: Replace with API call
    console.log('Logging in with:', cwid, password);
  };

  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleSubmit}>
        <h2>Student Login</h2>

        <label>
          CWID:
          <input
            type="text"
            value={cwid}
            onChange={(e) => setCwid(e.target.value)}
            required
          />
        </label>

        <label>
          Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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
