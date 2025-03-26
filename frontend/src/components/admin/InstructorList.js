import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './AdminComponents.css';

const InstructorList = () => {
  const [instructors, setInstructors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInstructors = async () => {
      try {
        const response = await axios.get('http://localhost:8080/api/admin/instructors', {
          headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
        });
        setInstructors(response.data);
        setLoading(false);
      } catch (error) {
        setError('Failed to fetch instructors');
        setLoading(false);
      }
    };

    fetchInstructors();
  }, []);

  if (loading) return <div className="loading">Loading instructors...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="list-container">
      <div className="list-header">
        <h3>All Instructors</h3>
        <div className="search-box">
          <input
            type="text"
            placeholder="Search instructors..."
            onChange={(e) => {
              // Implement search functionality
            }}
          />
        </div>
      </div>

      <div className="table-responsive">
        <table className="list-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Username</th>
              <th>Phone</th>
              <th>Courses</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {instructors.map((instructor) => (
              <tr key={instructor.id}>
                <td>{instructor.fullName}</td>
                <td>{instructor.email}</td>
                <td>{instructor.username}</td>
                <td>{instructor.phoneNumber || 'N/A'}</td>
                <td>{instructor.courses?.length || 0}</td>
                <td>
                  <button
                    className="btn-view"
                    onClick={() => {
                      // Implement view details functionality
                    }}
                  >
                    View
                  </button>
                  <button
                    className="btn-edit"
                    onClick={() => {
                      // Implement edit functionality
                    }}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default InstructorList; 