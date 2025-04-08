import React, { useState, useEffect } from 'react';
import Swal from 'sweetalert2';
import axios from 'axios';
import '../css/AddUser.css';

const AddUser = ({ onUserAdded }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmitRegisterUser = async (e) => {
    e.preventDefault();

    try {
      const formDataToSend = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone,
        email: formData.email,
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      };

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/authentication/register`,
        formDataToSend,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      console.log('User registered:', response.data);

      sessionStorage.setItem('token', response.data.token);

      Swal.fire({
        title: 'Success!',
        text: 'User registered successfully',
        icon: 'success',
        confirmButtonText: 'OK',
      });
  // 👇 Call this to notify parent (ViewItems)
  if (onUserAdded) {
    onUserAdded();
  }
      // Clear form
      setFormData({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        password: '',
        confirmPassword: '',
      });

      // Call the parent callback to refresh user list
      if (onUserAdded) {
        onUserAdded();
      }
    } catch (error) {
      console.error('Error registering user:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to register new user!',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };
  return (
    <div className='add-user'>
      <div className="register-user">
        <form onSubmit={handleSubmitRegisterUser}>
          <h1>Register New User</h1>
          <span>Use your email for registration</span>

          <label>First Name</label>
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder='First name'
            required
          />

          <label>Last Name</label>
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder='Last name'
            required
          />

          <label>Phone Number</label>
          <input
            type="text"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            placeholder='Phone number'
            required
          />

          <label>Email Address</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder='Email address'
            required
          />

          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder='Enter password'
            required
          />

          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder='Enter confirm password'
            required
          />

          <button type="submit" className='register-user-btn'>Register User</button>
        </form>
      </div>
    </div>
  );
};

export default AddUser;
