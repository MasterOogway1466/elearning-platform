import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../services/auth-header';
import CourseList from '../components/course/CourseList';
import './Dashboard.css';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('myLearning');

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
    }
  };

  const fetchEnrolledCourses = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/student/enrolled-courses',
        { headers: authHeader() }
      );
      setEnrolledCourses(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load enrolled courses. Please try again later.');
      console.error(err);
    }
  };

  const handleEnroll = async (courseId) => {
    try {
      await axios.post(
        'http://localhost:8080/api/student/enroll',
        { courseId },
        { headers: authHeader() }
      );
      // Refresh enrolled courses after successful enrollment
      await fetchEnrolledCourses();
      // Show a success message
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to enroll in course');
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await Promise.all([fetchCourses(), fetchEnrolledCourses()]);
      setLoading(false);
    };
    
    loadData();
  }, []);

  // Filter out courses that the student has already enrolled in
  const availableCourses = courses.filter(course => 
    !enrolledCourses.some(enrolledCourse => enrolledCourse.id === course.id)
  );

  return (
    <div className="dashboard-container">
      <h1>Student Dashboard</h1>
      
      <div className="dashboard-tabs">
        <button
          className={`tab-button ${activeTab === 'myLearning' ? 'active' : ''}`}
          onClick={() => setActiveTab('myLearning')}
        >
          My Learning
        </button>
        <button
          className={`tab-button ${activeTab === 'discover' ? 'active' : ''}`}
          onClick={() => setActiveTab('discover')}
        >
          Discover Courses
        </button>
        <button
          className={`tab-button ${activeTab === 'certificates' ? 'active' : ''}`}
          onClick={() => setActiveTab('certificates')}
        >
          Certificates
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'myLearning' && (
          <div className="my-learning-section">
            <h2>My Learning</h2>
            {loading ? (
              <p>Loading courses...</p>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : enrolledCourses.length === 0 ? (
              <p>You haven't enrolled in any courses yet.</p>
            ) : (
              <CourseList courses={enrolledCourses} />
            )}
          </div>
        )}
        
        {activeTab === 'discover' && (
          <div className="discover-section">
            <h2>Available Courses</h2>
            {loading ? (
              <p>Loading courses...</p>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : availableCourses.length === 0 ? (
              <div className="courses-empty">
                <h3>No more courses available</h3>
                <p>Check back later for new courses!</p>
              </div>
            ) : (
              <CourseList 
                courses={availableCourses} 
                onEnroll={handleEnroll}
                showEnrollButton={true}
              />
            )}
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