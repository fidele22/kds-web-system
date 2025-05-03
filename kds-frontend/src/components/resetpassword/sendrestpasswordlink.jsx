// src/pages/ForgotPassword.js
import React, { useState } from 'react';
import axios from 'axios';
import backgroundImage from '../../assets/bgcolor.jpg'; // adjust path as needed

import './resetpassword.css';


const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('http://localhost:5000/forgot-password', { email });
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || 'Error sending reset email');
    }
  };

  return (
    <div
  className="forgot-password-page"
  style={{
    backgroundImage: `url(${backgroundImage})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  }}
>
  {/* Overlay */}
  <div
    style={{
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(255, 255, 255, 0.0)', // light overlay, adjust alpha
      backdropFilter: 'brightness(90%) blur(2px)', // optional filter
      zIndex: 1
    }}
  />

  {/* Content */}
  <div className="forgot-password-container" style={{ zIndex: 2 }}>
    <h2>Forgot Password</h2>
    <form onSubmit={handleSubmit} className='forgot-password-form'>
      <input
        type="email"
        placeholder="Enter your email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">Send Reset Link</button>
    </form>
    {message && <p>{message}</p>}
  </div>
</div>

  );
};

export default ForgotPassword;
