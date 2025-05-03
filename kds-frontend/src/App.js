
import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
//import PrivateRoute from './Component/ProtectedRoute'
import VerifyOTP from './components/loginregister/OtpVerification';

import ForgotPassword  from './components/resetpassword/sendrestpasswordlink';
import ResetPassword from './components/resetpassword/resetpassword';
import AdminDashboard from './pages/Dashboards/admindashboard/AdminDashboard';
import ProtectedRoute from './components/protection/ProtectedRoute';
import EngineerDashboard from './pages/Dashboards/engineerdashboard/EngineerDashboard';
import ReceptionistDashboard from './pages/Dashboards/receptiondashboard/receptiondashboard';
import Client from './pages/Dashboards/ClientDashboard/clientdashboard';
import AccountantDashboard from './pages/Dashboards/accountant/accountantdashboard';

import LoginSignup  from './components/loginregister/signinregister'
import './App.css';


function App() {
  return (

    <Router>
      <div className='app'>
      
        <Routes>
        
          <Route path="/" element={<LoginSignup />} />
          <Route path="/verify-otp" element={<VerifyOTP />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<ResetPassword />} />

    
          <Route path="/admin-dashboard/*" element={<ProtectedRoute component={AdminDashboard} />} />
          <Route path="/client/*" element={<ProtectedRoute component={Client} />} /> 
          <Route path="/receptionist/*" element={<ProtectedRoute component={ReceptionistDashboard} />} />
          <Route path="/engineer/*" element={<ProtectedRoute component={EngineerDashboard} />} />
          <Route path="/accountant/*" element={<ProtectedRoute component={AccountantDashboard} />} />
         
          
        </Routes>
      </div>
    </Router>
  
   
  );
}

export default App;
