import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import axios from "axios";
import authHeader from "../services/auth-header";
import "./Profile.css"; // Import the Profile-specific CSS

const Profile = () => {
  const { currentUser, isLoggedIn, isInstructor, isStudent, isAdmin } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    fullName: "",
    email: "",
    phoneNumber: "",
    userType: ""
  });
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoggedIn || !currentUser) {
        setError("No authentication data found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        let endpoint;
        if (isAdmin) {
          endpoint = "http://localhost:8080/api/admin/profile";
        } else if (isInstructor) {
          endpoint = "http://localhost:8080/api/instructor/profile";
        } else {
          endpoint = "http://localhost:8080/api/student/profile";
        }

        const response = await axios.get(endpoint, { headers: authHeader() });
        setUserData(response.data);
        setEditData({
          fullName: response.data.fullName || "",
          email: response.data.email || "",
          phoneNumber: response.data.phoneNumber || "",
          userType: response.data.userType || "STUDENT"
        });
        setError(null);
      } catch (error) {
        setError(error.response?.data?.message || error.message || "Failed to fetch profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isLoggedIn, currentUser, isInstructor, isAdmin, isStudent]);

  const handleEditClick = () => {
    setIsEditing(true);
    setUpdateSuccess(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditData({
      fullName: userData.fullName || "",
      email: userData.email || "",
      phoneNumber: userData.phoneNumber || "",
      userType: userData.userType || "STUDENT"
    });
    setError(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setUpdateSuccess(false);

    try {
      let endpoint;
      if (isAdmin) {
        endpoint = "http://localhost:8080/api/admin/profile";
      } else if (isInstructor) {
        endpoint = "http://localhost:8080/api/instructor/profile";
      } else {
        endpoint = "http://localhost:8080/api/student/profile";
      }

      // If user type is being updated, send it separately
      if (isStudent && editData.userType !== userData.userType) {
        await axios.put(
          "http://localhost:8080/api/student/update-user-type",
          editData.userType,
          { 
            headers: {
              ...authHeader(),
              'Content-Type': 'application/json'
            }
          }
        );
      }

      // Send other profile updates
      const response = await axios.put(
        endpoint,
        {
          fullName: editData.fullName,
          email: editData.email,
          phoneNumber: editData.phoneNumber
        },
        { headers: authHeader() }
      );

      setUserData(response.data);
      setUpdateSuccess(true);
      setIsEditing(false);
    } catch (error) {
      setError(error.response?.data?.message || error.message || "Failed to update profile");
    }
  };

  // Get initials for avatar
  const getInitials = () => {
    if (userData.fullName) {
      const names = userData.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
      }
      return userData.fullName.charAt(0).toUpperCase();
    }
    return userData.username.charAt(0).toUpperCase();
  };

  if (loading) {
    return <div className="text-center p-5">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="profile-container">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          {error === "No authentication data found. Please login again." && (
            <p>
              <Link to="/login" className="btn btn-primary">
                Go to Login
              </Link>
            </p>
          )}
        </div>
      </div>
    );
  }

  // Use either fetched userData or currentUser from context
  const user = userData || currentUser;

  if (!user) {
    return <div className="text-center p-5">No profile data available.</div>;
  }

  return (
    <div className="main-content">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-header">
            <div className="d-flex justify-content-between align-items-center">
              <h2>{isAdmin ? "Admin" : isInstructor ? "Instructor" : "Student"} Profile</h2>
            </div>
          </div>
          
          <div className="profile-content">
            {updateSuccess && (
              <div className="alert alert-success mb-4">
                Profile updated successfully!
              </div>
            )}

            {/* Profile Picture Circle */}
            <div className="profile-avatar">
              <div className="avatar-circle">
                {getInitials()}
              </div>
            </div>

            {/* Inner box for user details */}
            <div className="profile-details">
              {isEditing ? (
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label">Username</label>
                    <input
                      type="text"
                      className="form-control"
                      value={user.username}
                      disabled
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Full Name</label>
                    <input
                      type="text"
                      className="form-control"
                      name="fullName"
                      value={editData.fullName}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      name="email"
                      value={editData.email}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Phone Number</label>
                    <input
                      type="tel"
                      className="form-control"
                      name="phoneNumber"
                      value={editData.phoneNumber}
                      onChange={handleInputChange}
                    />
                  </div>

                  {isStudent && (
                    <div className="mb-3">
                      <label className="form-label">User Type</label>
                      <select
                        className="form-select"
                        name="userType"
                        value={editData.userType}
                        onChange={handleInputChange}
                      >
                        <option value="STUDENT">General Student</option>
                        <option value="STUDENT_PLUS">Premium Student</option>
                      </select>
                    </div>
                  )}

                  <div className="profile-actions">
                    <button type="submit" className="btn btn-success">
                      Save Changes
                    </button>
                    <button
                      type="button"
                      className="btn btn-secondary"
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="mb-3">
                    <label className="fw-bold">Username:</label>
                    <p>{user.username}</p>
                  </div>
                  <div className="mb-3">
                    <label className="fw-bold">Full Name:</label>
                    <p>{user.fullName}</p>
                  </div>
                  <div className="mb-3">
                    <label className="fw-bold">Email:</label>
                    <p>{user.email}</p>
                  </div>
                  <div className="mb-3">
                    <label className="fw-bold">Phone Number:</label>
                    <p>{user.phoneNumber || "Not provided"}</p>
                  </div>
                  {isStudent && (
                    <div className="mb-3">
                      <label className="fw-bold">User Type:</label>
                      <p>
                        {user.userType === "STUDENT_PLUS"
                          ? "Premium Student"
                          : "General Student"}
                      </p>
                    </div>
                  )}
                  <div className="profile-actions">
                    <button
                      className="btn btn-primary"
                      onClick={handleEditClick}
                    >
                      Edit Profile
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
