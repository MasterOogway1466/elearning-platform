import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import "./Home.css"; // Import the Home.css for feature-card styling

const Profile = () => {
  const { currentUser, isLoggedIn, isInstructor, isStudent } = useAuth();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      if (!isLoggedIn || !currentUser) {
        setError("No authentication data found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        const endpoint = isInstructor
          ? "http://localhost:8080/api/instructor/profile"
          : "http://localhost:8080/api/student/profile";

        const token = currentUser.token;
        
        const response = await fetch(endpoint, {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          credentials: "include"
        });

        if (response.ok) {
          const data = await response.json();
          setUserData(data);
        } else {
          const errorText = await response.text();
          setError(`Failed to fetch profile: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        setError(`Network error: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, [isLoggedIn, currentUser, isInstructor, isStudent]);

  if (loading) {
    return <div className="text-center p-5">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          {error.includes("No authentication") && (
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

  // Get initials for avatar
  const getInitials = () => {
    if (user.fullName) {
      const names = user.fullName.split(' ');
      if (names.length >= 2) {
        return `${names[0].charAt(0)}${names[names.length - 1].charAt(0)}`.toUpperCase();
      }
      return user.fullName.charAt(0).toUpperCase();
    }
    return user.username.charAt(0).toUpperCase();
  };

  return (
    <div className="home-container" style={{ paddingTop: "40px", paddingBottom: "40px" }}>
      <div className="feature-card" style={{ maxWidth: "600px", margin: "0 auto", padding: "0" }}>
        <div className="card-header bg-primary text-white" style={{ padding: "20px", borderTopLeftRadius: "8px", borderTopRightRadius: "8px" }}>
          <h2>{isInstructor ? "Instructor" : "Student"}</h2>
        </div>
        
        <div style={{ padding: "30px" }}>
          {/* Profile Picture Circle */}
          <div style={{ 
            display: "flex", 
            justifyContent: "center", 
            marginBottom: "25px" 
          }}>
            <div style={{ 
              width: "120px", 
              height: "120px", 
              borderRadius: "50%", 
              backgroundColor: "#007bff", 
              color: "white", 
              display: "flex", 
              alignItems: "center", 
              justifyContent: "center", 
              fontSize: "3rem",
              fontWeight: "bold",
              boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)"
            }}>
              {getInitials()}
            </div>
          </div>

          {/* Inner box for user details */}
          <div style={{
            backgroundColor: "#f8f9fa",
            borderRadius: "8px",
            padding: "20px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.05)",
            border: "1px solid #e9ecef"
          }}>
            <div className="row mb-3">
              <div className="col-md-4" style={{ fontWeight: "bold" }}>Full Name:</div>
              <div className="col-md-8">{user.fullName}</div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4" style={{ fontWeight: "bold" }}>Username:</div>
              <div className="col-md-8">{user.username}</div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4" style={{ fontWeight: "bold" }}>Email:</div>
              <div className="col-md-8">{user.email}</div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4" style={{ fontWeight: "bold" }}>Phone Number:</div>
              <div className="col-md-8">{user.phoneNumber || 'Not provided'}</div>
            </div>
            {/* <div className="row mb-3">
              <div className="col-md-4" style={{ fontWeight: "bold" }}>Role:</div>
              <div className="col-md-8">
                {user.roles ? user.roles.map(role => role.replace('ROLE_', '')).join(', ') : 'N/A'}
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
