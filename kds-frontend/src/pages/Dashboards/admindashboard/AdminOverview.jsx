import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Profile = () => {
  const [userData, setUserData] = useState({});
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({});
  const token = sessionStorage.getItem(`token_${sessionStorage.getItem('currentTab')}`);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/authentication/profile`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setUserData(res.data);
        setFormData(res.data); // Initialize form with current user data
      } catch (error) {
        console.error('Error fetching profile:', error);
      }
    };

    fetchProfile();
  }, [token]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleUpdate = async () => {
    try {
      await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/authentication/update`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert('Profile updated successfully!');
      setUserData(formData);
      setEditMode(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  return (
    <div>
      <h2>User Profile</h2>
      {editMode ? (
        <div>
          <input type="text" name="firstName" value={formData.firstName} onChange={handleChange} />
          <input type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
          <input type="text" name="phone" value={formData.phone} onChange={handleChange} />
          <input type="email" name="email" value={formData.email} onChange={handleChange} />
          <button onClick={handleUpdate}>Save</button>
          <button onClick={() => setEditMode(false)}>Cancel</button>
        </div>
      ) : (
        <div>
          <p><b>First Name:</b> {userData.firstName}</p>
          <p><b>Last Name:</b> {userData.lastName}</p>
          <p><b>Phone:</b> {userData.phone}</p>
          <p><b>Email:</b> {userData.email}</p>
          <button onClick={() => setEditMode(true)}>Edit Profile</button>
        </div>
      )}
    </div>
  );
};

export default Profile;
