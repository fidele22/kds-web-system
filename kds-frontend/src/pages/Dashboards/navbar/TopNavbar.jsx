import React, { useState, useEffect } from 'react';
import { FaUser , FaSignOutAlt, FaChevronDown, FaBars,FaTimes } from 'react-icons/fa'; // Import FaBars
// import image3 from '../../../assets/4.png';
import './TopNavbar.css';
import axios from 'axios';

function TopNavbar({ setCurrentPage, toggleNav,isNavVisible}) {
  const [user, setUser ] = useState({}); // Initialize user as an empty object
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {
    const fetchUser  = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/authentication/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser (response.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser ();


    const handleOutsideClick = (event) => {

      if (!event.target.closest('.user-dropdown')) {

        setDropdownOpen(false);

      }

    };


    document.addEventListener('click', handleOutsideClick);


    return () => {

      document.removeEventListener('click', handleOutsideClick);

    };

  }, []);


  const toggleDropdown = () => {
    setDropdownOpen(!dropdownOpen);
  };

  const handleLogout = async () => {
    try {
      await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/logout`);
      sessionStorage.clear();
      window.location.href = '/';
      window.history.pushState(null, null, '/');
      window.onpopstate = () => {
        window.location.href = '/';
      };
    } catch (error) {
      console.error('Error during logout:', error);
      alert('Error while logging out');
    }
  };

  return (
    <div className='Navbar'>
      <div className="logo">
        <h1>KDS</h1>
        <p>Kigali Diesel Service</p>
        {/* <img src={image3} alt="" /> */}
      </div>
      <div className="menu-navbar-toggle" onClick={toggleNav}>
      {isNavVisible ? <FaTimes /> : <FaBars />} {/* Toggle icon for opening the left navigation */}
      </div>
      <ul className='navbar-menu'>
        <li className="user-dropdown" onClick={toggleDropdown}>
          {user ? (
            <>
              <img
                src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.firstName}&backgroundColor=E3F2FD`}
                alt={`${user.firstName} ${user.lastName}`}
                className="profile-avatar"
              />
              <h3>{`${user.firstName} ${user.lastName}`}</h3> 
            </>
          ) : (
            <span>Loading...</span>
          )}
   
        </li>
      </ul>
    
    </div>
  );
}

export default TopNavbar;