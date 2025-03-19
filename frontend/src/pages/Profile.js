import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "./Home.css"; // Import the Home.css for feature-card styling

const Profile = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      const token = localStorage.getItem("authToken");

      if (!token) {
        setError("No authentication token found. Please login again.");
        setLoading(false);
        return;
      }

      try {
        console.log("Fetching profile with token:", token.substring(0, 10) + "..."); // Debug log
        
        // First try instructor endpoint
        let response = await fetch("http://localhost:8080/api/instructor/profile", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          credentials: "include"
        });

        console.log("Instructor endpoint response:", response.status); // Debug log

        // If instructor endpoint fails with 403 (forbidden), try student endpoint
        if (response.status === 403) {
          console.log("Trying student endpoint..."); // Debug log
          response = await fetch("http://localhost:8080/api/student/profile", {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
              "Accept": "application/json"
            },
            credentials: "include"
          });
        }

        console.log("Final response status:", response.status); // Debug log

        if (response.ok) {
          const data = await response.json();
          console.log("Profile data received:", data); // Debug log
          setUser(data);
          setLoading(false);
        } else {
          const errorText = await response.text();
          console.error("Error response:", errorText); // Debug log
          setError(`Failed to fetch profile: ${response.status} - ${errorText}`);
          setLoading(false);
        }
      } catch (error) {
        console.error("Network error:", error); // Debug log
        setError(`Network error: ${error.message}`);
        setLoading(false);
      }
    };

    fetchUserProfile();
  }, []);

  if (loading) {
    return <div className="text-center p-5">Loading profile...</div>;
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4>Error</h4>
          <p>{error}</p>
          {error.includes("No authentication token") && (
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

  if (!user) {
    return <div className="text-center p-5">No profile data available.</div>;
  }

  // Determine user role for display
  const isInstructor = user.roles && user.roles.includes("ROLE_INSTRUCTOR");

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
          <h2>{isInstructor ? "Instructor" : "Student"} Profile</h2>
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
              <div className="col-md-4" style={{ fontWeight: "bold" }}>Username:</div>
              <div className="col-md-8">{user.username}</div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4" style={{ fontWeight: "bold" }}>Email:</div>
              <div className="col-md-8">{user.email}</div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4" style={{ fontWeight: "bold" }}>Full Name:</div>
              <div className="col-md-8">{user.fullName}</div>
            </div>
            <div className="row mb-3">
              <div className="col-md-4" style={{ fontWeight: "bold" }}>Role:</div>
              <div className="col-md-8">
                {user.roles ? user.roles.map(role => role.replace('ROLE_', '')).join(', ') : 'N/A'}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
