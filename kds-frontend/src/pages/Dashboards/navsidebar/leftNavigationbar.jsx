import React, { useState ,useEffect,useRef} from 'react';
import { FaHome, FaList, FaBoxOpen, FaPlus, FaGasPump, FaClipboardList, 
  FaChartBar, FaClipboardCheck ,FaUser ,FaBurn,FaSignOutAlt} from 'react-icons/fa';

import axios from 'axios';
  
import './navigationbar.css';

const LeftNavbar = ({ setCurrentPage, privileges, isVisible, closeNav }) => {

  const [activePage, setActivePage] = useState('');
  const navRef = useRef(null);

  const handleNavigation = (page) => {
    setCurrentPage(page);
    setActivePage(page);
    closeNav(); // Close nav after clicking a link
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
      {/* links supposed to be on receptionist */}
      <ul>
        {privileges.includes('view_overview') && (
          <li className={activePage === 'overview' ? 'active' : ''} onClick={() => handleNavigation('overview')}>
            <span><FaHome /></span> Overview
          </li>
        )}
        {privileges.includes('fill_reception_form') && (
          <li className={activePage === 'reception_form' ? 'active' : ''} onClick={() => handleNavigation('reception_form')}>
            <span><FaList /></span> Register tool
          </li>
        )}
        {privileges.includes('veiw_reception_data') && (
          <li className={activePage === 'view_reception_data' ? 'active' : ''} onClick={() => handleNavigation('view_reception_data')}>
            <span><FaBoxOpen /></span> View reception data
          </li>
        )}
    
  {/*  links for engineer dashboard */}
       {privileges.includes('view_reception_task') && (
          <li className={activePage === 'vew_task' ? 'active' : ''} onClick={() => handleNavigation('view_task')}>
            <span><FaBoxOpen /></span> View Task
          </li>
        )}
        
        {privileges.includes('add_issuediscovered_data') && (
          <li className={activePage === 'add_issue_discovered' ? 'active' : ''} onClick={() => handleNavigation('add_issue_discovered')}>
            <span><FaBoxOpen /></span> Add issueDiscovered
          </li>
        )}

   
      </ul>
      <h2>Setting</h2>
      <ol>
        <li onClick={() => handleNavigation('user-profile')}><FaUser  /> Profile</li>
        <li onClick={() => handleNavigation('help-center')}><FaBurn /> Help Center</li>

        <div className='logout-btn'>
            <li onClick={handleLogout}>
                            <FaSignOutAlt color='black' /> Logout
                          </li>
        </div>
        
      </ol>
    </div>
  );
};

export default LeftNavbar;
