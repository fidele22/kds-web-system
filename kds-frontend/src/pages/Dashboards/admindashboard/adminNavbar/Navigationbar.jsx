import React, { useEffect, useRef } from 'react';
import axios from 'axios';
import { FaHome, FaUser , FaList, FaClipboardList, FaBurn, FaSignOutAlt } from 'react-icons/fa';
import './Navigationbar.css';

const Navbar = ({ setCurrentPage, isMenuOpen, setIsMenuOpen }) => {
  const navbarRef = useRef(null);


  const handleLinkClick = (page) => {
    setCurrentPage(page);
    setIsMenuOpen(false); // Close the navbar
  };

  // Close navbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (navbarRef.current && !navbarRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [setIsMenuOpen]);

  // logout function
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
    <div ref={navbarRef} className={`adminavbar ${isMenuOpen ? 'open' : ''}`}>

      <ul>
        <li onClick={() => handleLinkClick('adminoverview')}><FaHome /> Overview</li>
        <u><h3>Admin settings</h3></u>
        <li onClick={() => handleLinkClick('view-Users')}><FaUser  /> Users</li>
        <li onClick={() => handleLinkClick('user-roles')}><FaHome /> User Roles</li>
     
      </ul>

      <u><h3>Account settings</h3></u>
      <ol>
        <li onClick={() => handleLinkClick('user-profile')}><FaUser  /> Profile</li>
        <li onClick={() => handleLinkClick('help-center')}><FaBurn /> Help Center</li>
        
      </ol>
         <div className='logout-btn'>
                  <li onClick={handleLogout}>
                                  <FaSignOutAlt color='black' /> Logout
                                </li>
              </div>
    </div>
  );
};

export default Navbar;