import React, { useEffect, useState } from 'react';
import axios from 'axios';


const DashboardOverview = () => {
  const [user, setUser ] = useState({});
  const [loading, setLoading] = useState(true);
  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`); 
  const [lastName, setLastName] = useState('');
  const [requestCounts, setRequestCounts] = useState({
    pending: 0,
    verified: 0,
    approved: 0,
    rejected: 0,
    received: 0,
  });


  const [missingEntries, setMissingEntries] = useState([]);
  const [isReminderVisible, setIsReminderVisible] = useState(false);
  
  const [error, setError] = useState(null);
  useEffect(() => {
    const fetchUser  = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/profile/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setUser(response.data); // Store the whole user data
        setLastName(response.data.lastName); // Extract and set the lastName
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser ();

    const fetchRequestCounts = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/UserRequest/user-count`, {
          headers: {
            Authorization: `Bearer ${token}`, // Ensure the token is sent with the request
          },
        });
        setRequestCounts(response.data); // Assuming the response structure matches the state
      } catch (error) {
        console.error('Error fetching request counts:', error);
      }
    };
    //reminder message 
    const fetchMissingEntries = async () => {
      const currentDate = new Date();
      const day = currentDate.getDate();

      // Display the reminder only between the 20th and the end of the month
      if (day >= 20) {
        try {
          const response = await axios.get(
            `${process.env.REACT_APP_BACKEND_URL}/api/usercar-data/check-reminders`
          );
          if (response.status === 200) {
            setMissingEntries(response.data.missingEntries);
            setIsReminderVisible(response.data.missingEntries.length > 0);
          }
        } catch (error) {
          console.error('Error fetching missing entries:', error);
        }
      }
    };

    fetchMissingEntries();
    fetchRequestCounts();
  }, []);
 // Prepare data for the chart
 const chartData = [
  { name: 'Pending', count: requestCounts.pending },
  { name: 'Verified', count: requestCounts.verified },
  { name: 'Approved', count: requestCounts.approved },

];
  return (
    <div className="overview-content">
       <div className="welcome-nav">
        <h1>Welcome back to our system, <br /><span>--- {lastName} ---</span></h1>
      </div>
      {isReminderVisible && (
        <marquee className="reminder-message">
          {`Reminder: Data of kilometer covered and remaining liters in this month are missing for the following register numbers: ${missingEntries.join(', ')}`}
        </marquee>
      )}

    </div>
  );
};

export default DashboardOverview;
