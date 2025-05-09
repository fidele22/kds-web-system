import React, { useState,useRef,useEffect } from 'react';
import { FaHome, FaBars, FaTimes } from 'react-icons/fa';
import Navbar from './adminNavbar/Navigationbar';
import Navigation from '../navbar/TopNavbar';
import Footer from '../footer/Footer';
import AdminOverview from './adminOverview/AdminOverview';
import ViewUser  from './user/users';
import UserRole from './roles/viewRoles';
import ReceptionDataReport from './Report/viewReport';
import ViewReceptionRecords from './receptionData/viewReceptionRecords';
import StoreTool from './Toolstock/storeTool';
import ViewStock from './Toolstock/stockMaterial';
import StockReportMonthly  from './Toolstock/stockReport';
import TrackInfo from './searinfo/searchinfo'

import UserProfile from '../UserProfile/profile';
import './css/adminDashboard.css';
import HelpCenter from '../helpcenter/helpcenter';

const AdminDashboard = () => {
  const [currentPage, setCurrentPage] = useState('overview');
  const [privileges, setPrivileges] = useState([]);
  const [isNavVisible, setIsNavVisible] = useState(false); // State for navigation visibility
  const navRef = useRef(); 

  const renderContent = () => {
    switch (currentPage) {
      case 'adminoverview':
        return <AdminOverview />;
      case 'view-Users':
        return <ViewUser  />;
      case 'user-roles':
        return <UserRole />;
      case 'reception_data_report':
        return <ReceptionDataReport />;
      case 'view_reception_records':
        return <ViewReceptionRecords />;
      case 'reception_data_tracker':
        return <TrackInfo />
      case 'store_tool':
        return <StoreTool />  
      case 'view_stock_materials':
        return <ViewStock /> 
      case 'stock_materials_report':
        return <StockReportMonthly />  
      case 'user-profile':
        return <UserProfile />;
      case 'help-center':
        return <HelpCenter />  
      default:
        return <AdminOverview />;
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
    <div className={`admin-dashboard `}>
      
      <div>
      <Navigation setCurrentPage={setCurrentPage} toggleNav={toggleNav}  isNavVisible={isNavVisible} />
      
      </div>

      <Navbar setCurrentPage={setCurrentPage} isVisible={isNavVisible} 
        privileges={privileges} closeNav={closeNav}  />
      
      <div className="Admincontent-page">
        <div className="Admincontent">
          {renderContent()}
       
        </div>
        <Footer />
      </div>
    
    </div>
  );
};

export default AdminDashboard;