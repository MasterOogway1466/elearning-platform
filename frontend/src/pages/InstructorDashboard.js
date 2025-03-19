import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../services/auth-header';
import CreateCourse from '../components/course/CreateCourse';
import CourseList from '../components/course/CourseList';
import './Dashboard.css';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('myCourses');

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/instructor/courses',
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

  const handleCourseCreated = (newCourse) => {
    setCourses([...courses, newCourse]);
    setActiveTab('myCourses');
  };

  return (
    <div className="dashboard-container">
      <h1>Instructor Dashboard</h1>
      
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'myCourses' ? 'active' : ''}`}
          onClick={() => setActiveTab('myCourses')}
        >
          My Courses
        </button>
        <button
          className={`tab-button ${activeTab === 'createCourse' ? 'active' : ''}`}
          onClick={() => setActiveTab('createCourse')}
        >
          Create Course
        </button>
        <button
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'myCourses' && (
          <div className="my-courses-section">
            <h2>My Courses</h2>
            {loading ? (
              <p>Loading your courses...</p>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <CourseList courses={courses} />
            )}
          </div>
        )}
        
        {activeTab === 'createCourse' && (
          <div className="create-course-section">
            <CreateCourse onSuccess={handleCourseCreated} />
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="analytics-section">
            <h2>Analytics</h2>
            <p>Course analytics will be available here soon.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard; 