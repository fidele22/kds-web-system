import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './LoginSignup.css';

import image1 from '../../assets/1.png';
import image2 from '../../assets/3.png';
import image3 from '../../assets/5.png';

const images = [image1, image2, image3];

const LoginSignup = () => {
  const [isSignIn, setIsSignIn] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOTP] = useState('');

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const validateSignUpForm = () => {
    const newErrors = {};
    const { firstName, lastName, phone, email, password, confirmPassword } = formData;

    if (!firstName) newErrors.firstName = 'First name is required';
    if (!lastName) newErrors.lastName = 'Last name is required';
    if (!/^\d{10}$/.test(phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!email) newErrors.email = 'Email is required';
    if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = 'Email is invalid';
    if (!password) newErrors.password = 'Password is required';
    if (password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    if (password !== confirmPassword) newErrors.confirmPassword = 'Passwords do not match';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    if (validateSignUpForm()) {
      const { firstName, lastName, phone, email, password } = formData;

      try {
        const response = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/authentication/register`, {
          firstName,
          lastName,
          phone,
          email,
          password,
        });

        alert(response.data.message);
        setFormData({
          firstName: '',
          lastName: '',
          phone: '',
          email: '',
          password: '',
          confirmPassword: '',
        });
        setErrors({});
      } catch (error) {
        if (error.response) {
          alert(`Error: ${error.response.status} - ${error.response.data.message}`);
        } else if (error.request) {
          alert('No response from server. Please try again later.');
        } else {
          alert('Error: ' + error.message);
        }
      }
    }
  };

  const validateLoginForm = () => {
    const newErrors = {};
    const { phone, password } = formData;

    if (!/^\d{10}$/.test(phone)) newErrors.phone = 'Phone number must be 10 digits';
    if (!password) newErrors.password = 'Password is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    if (validateLoginForm()) {
      try {
        const res = await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/authentication/login`, { phone: formData.phone, password: formData.password });
        console.log('Login response:', res.data);
        setIsLoggedIn(true);
        document.body.classList.add('logged-in');

        const { token, role, privileges } = res.data;
        const tabId = Date.now() + Math.random().toString(36);
        sessionStorage.setItem(`token_${tabId}`, token);
        sessionStorage.setItem(`privileges_${tabId}`, JSON.stringify(privileges));
        sessionStorage.setItem('role', role);  // Save the role here
        sessionStorage.setItem('currentTab', tabId);

        switch (role) {
          case 'ADMIN':
            navigate('/admin-dashboard');
            break;
          case 'RECEPTIONIST':
            navigate('/receptionist');
            break;
          case 'ACCOUNTANT':
            navigate('/accountant');
            break;
          case 'ENGINEER':
            navigate('/engineer');
            break;
          case 'CLIENT':
            navigate('/client');
            break;
          default:
            navigate('/');
        }
      } catch (err) {
        console.error('Login error:', err);
        alert('Invalid phone number or password');
      }
    }
  };

  const toggle = () => {
    setIsSignIn(!isSignIn);
  };

  useEffect(() => {
    const scrollInterval = setInterval(() => {
      setCurrentImageIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000); // Adjust this interval as needed
  
    return () => clearInterval(scrollInterval); // Clear interval on component unmount
  }, []);
  
  return (
    <div id="container" className={`container ${isSignIn ? 'sign-in' : 'sign-up'}`}>
      <div className="row">
        <div className="col align-items-center flex-col sign-up">
          <div className="form-wrapper align-items-center">
            <div className="form sign-up">
              <div className="input-group">
                <i className='bx bxs-user'></i>
                <input type="text" name="firstName" placeholder="First Name" value={formData.firstName} onChange={handleChange} />
                {errors.firstName && <span className="error">{errors.firstName}</span>}
              </div>
              <div className="input-group">
                <i className='bx bxs-user'></i>
                <input type="text" name="lastName" placeholder="Last Name" value={formData.lastName} onChange={handleChange} />
                {errors.lastName && <span className="error">{errors.lastName}</span>}
              </div>
              <div className="input-group">
                <i className='bx bxs-user'></i>
                <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>
              <div className="input-group">
                <i className='bx bx-mail-send'></i>
                <input type="email" name="email" placeholder="Email" value={formData.email} onChange={handleChange} />
                {errors.email && <span className="error">{errors.email}</span>}
              </div>
              <div className="input-group">
                <i className='bx bxs-lock-alt'></i>
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                {errors.password && <span className="error">{errors.password}</span>}
              </div>
              <div className="input-group">
                <i className='bx bxs-lock-alt'></i>
                <input type="password" name="confirmPassword" placeholder="Confirm password" value={formData.confirmPassword} onChange={handleChange} />
                {errors.confirmPassword && <span className="error">{errors.confirmPassword}</span>}
              </div>
              <button onClick={handleRegister}>Register</button>
              <p>
                <span>Already have an account?</span>
                <b onClick={toggle} className="pointer">Sign in here</b>
              </p>
            </div>
          </div>
        </div>

        <div className="col align-items-center flex-col sign-in">
          <div className="form-wrapper align-items-center">
            <div className="form sign-in">
              <div className="input-group">
                <i className='bx bxs-user'></i>
                <input type="tel" name="phone" placeholder="Phone Number" value={formData.phone} onChange={handleChange} />
                {errors.phone && <span className="error">{errors.phone}</span>}
              </div>
              <div className="input-group">
                <i className='bx bxs-lock-alt'></i>
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} />
                {errors.password && <span className="error">{errors.password}</span>}
              </div>
              <button onClick={handleLogin}>Sign in</button>
              <p>
                <b>Forgot password?</b>
              </p>
              <p>
                <span>Don't have an account?</span>
                <b onClick={toggle} className="pointer">Sign up here</b>
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="row content-row">
        <div className="col align-items-center flex-col">
          <div className="text sign-in">
            <h2>Welcome</h2>
            <p>Welcome to our Kigali diesel service Ltd! We're dedicated to providing reliable and efficient diesel solutions for your needs,
              . Enjoy the convenience and quality of our service.</p>
          </div>
          <div className="img sign-in">
            <img src={images[currentImageIndex]} alt="Slideshow" />
          </div>
        </div>

        <div className="col align-items-center flex-col">
          <div className="img sign-up"></div>
          <div className="text sign-up">
            <h2>KDS</h2>
            <p>Join our trusted system for fast, reliable, and affordable diesel car maintenance and repair services. </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginSignup;
