import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './oveviewadmin.css';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';


const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#00C49F', '#FFBB28', '#FF4444'];
const StatusOverview = () => {
  const [statusSummary, setStatusSummary] = useState([]);
  const [user, setUser] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const userRole = sessionStorage.getItem('role');
  const allRoles = [
    { title: 'RECEPTIONIST', color: '#4e73df', icon: '📋' },
    { title: 'ENGINEER', color: '#1cc88a', icon: '🛠️' },
    { title: 'ACCOUNTANT', color: '#f6c23e', icon: '💰' },
    { title: 'STOREKEEPER', color: '#36b9cc', icon: '📦' },
    { title: 'DG', color: '#e74a3b', icon: '🏛️' },
    { title: 'DAF', color: '#858796', icon: '📑' },
  ];
  
  const currentRoleCard = allRoles.find((role) => role.title === userRole);
  
  useEffect(() => {
    const fetchUser = async () => {
      const tabId = sessionStorage.getItem('currentTab');
      const token = sessionStorage.getItem(`token_${tabId}`);

      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/authentication/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data);
      } catch (err) {
        console.error('Failed to fetch user profile:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  useEffect(() => {
    axios.get('http://localhost:5000/api/userdata/status-summary-overview')
      .then(res => setStatusSummary(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <div>
      {!loading && user && (
        <div className="admin-welcome-box">
          <h2>👋 Welcome back, <span>{user.lastName}</span>!</h2>
          <p>We're glad to see you again. Here's an overview of company work statuses.</p>
        </div>
      )}

      {error && <p className="error-text">Error: {error}</p>}

      {currentRoleCard && (
  <div className="role-badge">
    <div
      className="role-card"
     
    >
      <div className="role-icon">{currentRoleCard.icon}</div>
      <div className="role-title">{currentRoleCard.title}</div>
    </div>
  </div>
)}


    <div className="status-grid">
      {statusSummary.map((item) => (
        <div key={item.status} className="status-card">
          <h4>{item.status} {item.count === 1 ? 'Activity' : 'Activities'}</h4>
          <p>{item.count} </p>
        </div>
      ))}
    </div>

    <div className="charts-container">
      {/* Bar Chart */}
      <div className="chart-box">
        <h3>Status Bar Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={statusSummary}>
            <XAxis dataKey="status" />
            <YAxis allowDecimals={false} />
            <Tooltip />
            <Bar dataKey="count" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Pie Chart */}
      <div className="chart-box">
        <h3>Status Pie Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={statusSummary}
              dataKey="count"
              nameKey="status"
              cx="50%"
              cy="50%"
              outerRadius={100}
              label
            >
              {statusSummary.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  </div>
  );
};

export default StatusOverview;
