import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../../services/auth-header';
import './AdminComponents.css';

const MentoringSessions = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('all'); // 'all', 'pending', 'approved', 'completed', 'rejected'
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchMentoringSessions();
  }, []);

  const fetchMentoringSessions = async () => {
    try {
      setLoading(true);
      const response = await axios.get(
        'http://localhost:8080/api/admin/mentoring-sessions',
        { headers: authHeader() }
      );
      setSessions(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching mentoring sessions:', err);
      setError('Failed to load mentoring sessions. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'PENDING':
        return 'status-pending';
      case 'APPROVED':
        return 'status-approved';
      case 'COMPLETED':
        return 'status-completed';
      case 'REJECTED':
        return 'status-rejected';
      default:
        return '';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Not scheduled';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  const handleFilterChange = (e) => {
    setFilter(e.target.value);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredSessions = sessions
    .filter(session => {
      if (filter === 'all') return true;
      return session.status === filter.toUpperCase();
    })
    .filter(session => {
      const searchLower = searchTerm.toLowerCase();
      return (
        session.studentName?.toLowerCase().includes(searchLower) ||
        session.instructorName?.toLowerCase().includes(searchLower) ||
        session.courseName?.toLowerCase().includes(searchLower) ||
        session.topic?.toLowerCase().includes(searchLower)
      );
    });

  if (loading) {
    return <div className="loading">Loading mentoring sessions...</div>;
  }

  if (error) {
    return <div className="error-message">{error}</div>;
  }

  return (
    <div className="admin-section">
      <h2>Mentoring Sessions</h2>
      
      <div className="admin-filters">
        <div className="filter-group">
          <label htmlFor="status-filter">Filter by Status:</label>
          <select 
            id="status-filter" 
            value={filter} 
            onChange={handleFilterChange}
            className="filter-select"
          >
            <option value="all">All Sessions</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        
        <div className="search-group">
          <input
            type="text"
            placeholder="Search sessions..."
            value={searchTerm}
            onChange={handleSearchChange}
            className="search-input"
          />
        </div>
      </div>

      {filteredSessions.length === 0 ? (
        <div className="no-data-message">No mentoring sessions found.</div>
      ) : (
        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Instructor</th>
                <th>Course</th>
                <th>Topic</th>
                <th>Status</th>
                <th>Date</th>
                <th>Requested On</th>
              </tr>
            </thead>
            <tbody>
              {filteredSessions.map(session => (
                <tr key={session.id}>
                  <td>{session.id}</td>
                  <td>{session.studentName}</td>
                  <td>{session.instructorName}</td>
                  <td>{session.courseName}</td>
                  <td>{session.topic}</td>
                  <td>
                    <span className={`status-badge ${getStatusClass(session.status)}`}>
                      {session.status}
                    </span>
                  </td>
                  <td>{formatDate(session.sessionDate)}</td>
                  <td>{formatDate(session.createdAt)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default MentoringSessions; 