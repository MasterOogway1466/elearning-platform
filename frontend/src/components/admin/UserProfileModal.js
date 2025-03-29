import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../../services/auth-header';
import './AdminComponents.css';

const UserProfileModal = ({ userId, userType, onClose }) => {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!userId) return;
      
      try {
        const endpoint = userType === 'student' 
          ? `http://localhost:8080/api/admin/student/${userId}` 
          : `http://localhost:8080/api/admin/instructor/${userId}`;
          
        const response = await axios.get(endpoint, { headers: authHeader() });
        setUserData(response.data);
        setError(null);
      } catch (error) {
        console.error('Error fetching user profile:', error);
        setError('Failed to load user profile');
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [userId, userType]);

  // Get initials for avatar
  const getInitials = () => {
    if (!userData || !userData.fullName) return "?";
    
    const names = userData.fullName.split(' ');
    if (names.length >= 2) {
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
    }
    return userData.fullName.charAt(0).toUpperCase();
  };

  // Close modal when clicking on backdrop
  const handleBackdropClick = (e) => {
    if (e.target.className === 'modal-backdrop') {
      onClose();
    }
  };

  // Prevent event bubbling when clicking on modal content
  const handleModalClick = (e) => {
    e.stopPropagation();
  };

  return (
    <>
      <div className="modal-backdrop" onClick={handleBackdropClick}></div>
      <div className="user-profile-modal" onClick={handleModalClick}>
        <div className="modal-header">
          <h3>{userType === 'student' ? 'Student' : 'Instructor'} Profile</h3>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          {loading ? (
            <div className="loading">Loading profile...</div>
          ) : error ? (
            <div className="error">{error}</div>
          ) : userData ? (
            <div className="user-profile-content">
              <div className="profile-avatar">
                <div className="avatar-circle">
                  {getInitials()}
                </div>
              </div>
              
              <div className="profile-info">
                <div className="info-group">
                  <label>Full Name</label>
                  <div className="info-value">{userData.fullName}</div>
                </div>
                
                <div className="info-group">
                  <label>Username</label>
                  <div className="info-value">{userData.username}</div>
                </div>
                
                <div className="info-group">
                  <label>Email</label>
                  <div className="info-value">{userData.email}</div>
                </div>
                
                <div className="info-group">
                  <label>Phone Number</label>
                  <div className="info-value">{userData.phoneNumber || 'Not provided'}</div>
                </div>
                
                {userType === 'student' && (
                  <div className="info-group">
                    <label>User Type</label>
                    <div className="info-value">{userData.userType || 'STUDENT'}</div>
                  </div>
                )}
                
                {userType === 'instructor' && (
                  <div className="info-group">
                    <label>Courses</label>
                    <div className="info-value">{userData.courses?.length || 0} courses</div>
                  </div>
                )}
                
                <div className="info-group">
                  <label>Account Created</label>
                  <div className="info-value">
                    {userData.createdAt ? new Date(userData.createdAt).toLocaleDateString() : 'Unknown'}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="error">No user data available</div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>Close</button>
        </div>
      </div>
    </>
  );
};

export default UserProfileModal; 