import React, { useEffect,useState, useRef } from 'react';
import axios from 'axios';
import { FaHome, FaUser , FaList, FaClipboardList, FaBurn, FaSignOutAlt } from 'react-icons/fa';
import './Navigationbar.css';

const Navbar = ({ setCurrentPage, privileges, isVisible, closeNav }) => {
  const navRef = useRef(null);
  const [activePage, setActivePage] = useState('');

  const handleLinkClick = (page) => {
    setCurrentPage(page);
    setActivePage(page);
    closeNav();
  };

  // Close navbar when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isVisible && navRef.current && !navRef.current.contains(event.target)) {
        closeNav();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isVisible, closeNav]);

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
    <div ref={navRef} className={`navigation ${isVisible ? 'active' : 'hidden'}`}>

      <ul>
        <li className={activePage === 'adminoverview' ? 'active' : ''} onClick={() => handleLinkClick('adminoverview')}><FaHome /> Overview</li>
        <li className={activePage === 'view_reception_records' ? 'active' : ''} onClick={() => handleLinkClick('view_reception_records')}><FaHome />Reception Records</li>
        <li className={activePage === 'reception_data_report' ? 'active' : ''} onClick={() => handleLinkClick('reception_data_report')}><FaHome />Report</li>
       <h3>Admin settings</h3>
        <li className={activePage === 'view-Users' ? 'active' : ''} onClick={() => handleLinkClick('view-Users')}><FaUser  /> Users</li>
        <li className={activePage === 'user-roles' ? 'active' : ''} onClick={() => handleLinkClick('user-roles')}><FaHome /> User Roles</li>
     
       <h3>Account settings</h3>
    
      <li className={activePage === 'store_tool' ? 'active' : ''} onClick={() => handleLinkClick('store_tool')}><FaHome />Store stock</li>
      <li className={activePage === 'view_stock_materials' ? 'active' : ''} onClick={() => handleLinkClick('view_stock_materials')}><FaHome />View stock</li>
      <li className={activePage === 'stock_materials_report' ? 'active' : ''} onClick={() => handleLinkClick('stock_materials_report')}><FaHome />Stock report</li>

     <h3>Profile settings</h3>
    
        <li className={activePage === 'user-profile' ? 'active' : ''} onClick={() => handleLinkClick('user-profile')}><FaUser  /> Profile</li>
        <li className={activePage === 'help-center' ? 'active' : ''} onClick={() => handleLinkClick('help-center')}><FaBurn /> Help Center</li>
        
      </ul>
         <div className='logout-btn'>
                  <li onClick={handleLogout}>
                                  <FaSignOutAlt color='black' /> Logout
                                </li>
              </div>
    </div>
  );
};

export default Navbar;