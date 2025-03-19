import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../services/auth-header';
import CourseList from '../components/course/CourseList';
import './Dashboard.css';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('allCourses');

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/student/courses',
        { headers: authHeader() }
      );
      setCourses(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load courses. Please try again later.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  return (
    <div className="dashboard-container">
      <h1>Student Dashboard</h1>
      
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'allCourses' ? 'active' : ''}`}
          onClick={() => setActiveTab('allCourses')}
        >
          All Courses
        </button>
        <button
          className={`tab-button ${activeTab === 'myLearning' ? 'active' : ''}`}
          onClick={() => setActiveTab('myLearning')}
        >
          My Learning
        </button>
        <button
          className={`tab-button ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          Certificates
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'allCourses' && (
          <div className="all-courses-section">
            <h2>Available Courses</h2>
            {loading ? (
              <p>Loading courses...</p>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <CourseList courses={courses} />
            )}
          </div>
        )}
        
        {activeTab === 'myLearning' && (
          <div className="my-learning-section">
            <h2>My Learning</h2>
            <p>Your enrolled courses will appear here.</p>
          </div>
        )}
        
        {activeTab === 'certificates' && (
          <div className="certificates-section">
            <h2>My Certificates</h2>
            <p>Your earned certificates will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard; 