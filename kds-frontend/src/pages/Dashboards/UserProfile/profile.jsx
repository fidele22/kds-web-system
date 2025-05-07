import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Swal from 'sweetalert2'; 
import './profile.css'; // Import the CSS file for styles

const UserProfile = () => {
  const [user, setUser] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const tabId = sessionStorage.getItem('currentTab');
  const token = sessionStorage.getItem(`token_${tabId}`); // Get the token for the current tab

  const [twoFAEnabled, setTwoFAEnabled] = useState(user.twoFAEnabled);

  const [showPasswordForm, setShowPasswordForm] = useState(false);
const [currentPassword, setCurrentPassword] = useState('');
const [newPassword, setNewPassword] = useState('');
const [confirmPassword, setConfirmPassword] = useState('');


  useEffect(() => {
    const fetchUser  = async () => {
      try {
        console.log('Token:', token); // Log the token
        const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/api/authentication/profile`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log('User  Profile Response:', response.data); // Log the response
        setUser (response.data);
      } catch (err) {
        console.error('Error fetching user profile:', err); // Log the error
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUser ();
  }, [token]);

   const handleToggle2FA = async () => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `You are about to ${twoFAEnabled ? 'disable' : 'enable'} Two-Factor Authentication.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, continue',
      cancelButtonText: 'Cancel',
      customClass: {
        popup: 'custom-swal', // Use custom size
      },
    });
  
    if (!result.isConfirmed) return;
  
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/authentication/enable-disable-2fa`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      setTwoFAEnabled(response.data.twoFAEnabled);
      Swal.fire({
        title: 'Success',
        text: response.data.message,
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal',
        },
      });
    } catch (err) {
      console.error('Error toggling 2FA:', err);
      Swal.fire({
        title: 'Error',
        text: 'Could not update 2FA preference',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal',
        },
      });
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${process.env.REACT_APP_BACKEND_URL}/api/authentication/update`, user, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      console.log('Update Response:', response.data); // Log the response
      setUser (response.data.user); // Update user state with the returned user data
      Swal.fire({
        title: 'Success!',
        text: 'Profile updated successfully',
        icon: 'success',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal',
        },
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Error updating profile:', err); // Log the error
      Swal.fire({
        title: 'Error',
        text: 'Failed to update profile',
        icon: 'error',
        confirmButtonText: 'OK',
        customClass: {
          popup: 'custom-swal',
        },
      });
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      return Swal.fire({
        title: 'Error',
        text: 'New passwords do not match',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/api/authentication/change-password`,
        {
          currentPassword,
          newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      Swal.fire({
        title: 'Success!',
        text: response.data.message,
        icon: 'success',
        confirmButtonText: 'OK',
      });
  
      // Clear the fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setShowPasswordForm(false);
    } catch (error) {
      console.error('Error changing password:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to change password',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  };
  

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">Error: {error}</div>;

  return (
    <div className="user-profile">
      <h2>Profile Setting</h2>
      <div className="profile-header">
        <img
          src={`https://api.dicebear.com/6.x/initials/svg?seed=${user.firstName}&backgroundColor=E3F2FD`}
          alt={`${user.firstName} ${user.lastName}`}
          className="profile-avatar"
        />
        <h3>{`${user.firstName} ${user.lastName}`}</h3>
      </div>
      <form onSubmit={handleUpdate} className="profile-form">
        <div className="form-group">
          <label>First Name:</label>
          <input
            type="text"
            value={user.firstName}
            onChange={(e) => setUser ({ ...user, firstName: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Last Name:</label>
          <input
            type="text"
            value={user.lastName}
            onChange={(e) => setUser ({ ...user, lastName: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Email:</label>
          <input
            type="email"
            value={user.email}
            onChange={(e) => setUser ({ ...user, email: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="form-group">
          <label>Phone:</label>
          <input
            type="text"
            value={user.phone}
            onChange={(e) => setUser ({ ...user, phone: e.target.value })}
            disabled={!isEditing}
          />
        </div>
        <div className="form-actions">
          <button type="submit" disabled={!isEditing} className="update-button">Update Profile</button>
          <button type="button" onClick={() => setIsEditing(!isEditing)} className="edit-button">
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </form>
      <div className="password-section">
  <button
    className="toggle-password-form"
    onClick={() => setShowPasswordForm(!showPasswordForm)}
  >
    {showPasswordForm ? 'Cancel Password Change' : 'Change Password'}
  </button>

  {showPasswordForm && (
    <form onSubmit={handleChangePassword} className="password-form">
      <div className="form-group">
        <label>Current Password:</label>
        <input
          type="password"
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>New Password:</label>
        <input
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
      </div>
      <div className="form-group">
        <label>Confirm New Password:</label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
      </div>
      <div className="form-actions">
        <button type="submit" className="update-button">Update Password</button>
      </div>
    </form>
  )}
</div>
<hr />
<div className="form-group switch-group">
  <label>Two-Factor Authentication:</label>
  <label className="switch">
    <input
      type="checkbox"
      checked={twoFAEnabled}
      onChange={handleToggle2FA}
    />
    <span className="slider round"></span>
  </label>
  <span className="switch-label">{twoFAEnabled ? 'Enabled' : 'Disabled'}</span>
</div>


    </div>
  );
};

export default UserProfile;