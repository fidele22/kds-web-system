import React, { useState, useEffect,useRef } from 'react';
import TopNavigation from '../navbar/TopNavbar';
import Footer from '../footer/Footer';
import LeftNavbar from '../navsidebar/leftNavigationbar';
import UserProfile from '../UserProfile/profile';
import Overview from './Overview';
import IssueDiscovered from './repairTool/addissueDiscovered';
import ViewTask from './repairTool/viewreceptiondata';
import './engineerDashboard.css';

const EngineerDashboard = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [privileges, setPrivileges] = useState([]);
  const [isNavVisible, setIsNavVisible] = useState(false); // State for navigation visibility
  const navRef = useRef(); 

  useEffect(() => {
    const tabId = sessionStorage.getItem('currentTab');
    console.log('Current tab ID:', tabId); // Debugging log

    if (tabId) {
      const storedPrivileges = sessionStorage.getItem(`privileges_${tabId}`);
      console.log('Stored privileges:', storedPrivileges); // Debugging log

      if (storedPrivileges) {
        try {
          const parsedPrivileges = JSON.parse(storedPrivileges); // Parse the stored privileges
          setPrivileges(parsedPrivileges); // Update state with parsed privileges
        } catch (error) {
          console.error('Error parsing privileges from sessionStorage:', error);
          setPrivileges([]); // Set to an empty array if parsing fails
        }
      } else {
        console.warn('Privileges not found in sessionStorage');
        setPrivileges([]); // Set to an empty array if no privileges are found
      }
    } else {
      console.warn('No tab ID found in sessionStorage');
      setPrivileges([]); // Set to an empty array if no tab ID is found
    }
  }, []);

  const renderContent = () => {
    switch (currentPage) {
      case 'overview':
        return <Overview />;
      case 'add_issue_discovered':
        return <IssueDiscovered />
      case 'view_task':
        return <ViewTask />  
      case 'user-profile':
        return <UserProfile />;
      default:
        return <Overview />;
    }
  };

  const toggleNav = () => {

    setIsNavVisible(!isNavVisible); // Toggle the navigation visibility

  };


  const closeNav = () => {

    setIsNavVisible(false); // Function to close the navigation

  };


  useEffect(() => {

    const handleClickOutside = (event) => {

      if (navRef.current && !navRef.current.contains(event.target)) {

        closeNav(); // Close navigation if clicked outside

      }

    };


    document.addEventListener('mousedown', handleClickOutside);

    return () => {

      document.removeEventListener('mousedown', handleClickOutside);

    };

  }, []);
  return (
    <div className="daf-dashboards">
      <TopNavigation setCurrentPage={setCurrentPage} toggleNav={toggleNav}  isNavVisible={isNavVisible}   />
      
      <div className="content-navbar">
        <LeftNavbar setCurrentPage={setCurrentPage} isVisible={isNavVisible} 
        privileges={privileges} closeNav={closeNav}  />
      </div>
      <div className='contents-page'>
          {renderContent()}
        </div>
     <div className="footer-page">
        <Footer />
      </div>
  

    </div>
  );
};

export default EngineerDashboard;