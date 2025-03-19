import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../services/auth-header';
import CreateCourse from '../components/course/CreateCourse';
import CourseList from '../components/course/CourseList';
import EnrolledStudents from '../components/course/EnrolledStudents';
import './Dashboard.css';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('myCourses');
  const [selectedCourse, setSelectedCourse] = useState(null);

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
  
  const handleViewStudents = (courseId) => {
    setSelectedCourse(courseId);
    setActiveTab('students');
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
        {selectedCourse && (
          <button
            className={`tab-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Enrolled Students
          </button>
        )}
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
              <>
                {courses.length === 0 ? (
                  <div className="alert alert-info">
                    You haven't created any courses yet. Create your first course to get started.
                  </div>
                ) : (
                  <div>
                    <div className="instructor-course-list">
                      {courses.map(course => (
                        <div className="instructor-course-item" key={course.id}>
                          <div className="course-card">
                            <div className="course-image">
                              {course.imageUrl ? (
                                <img src={course.imageUrl} alt={course.title} />
                              ) : (
                                <div className="default-course-image">
                                  <span>{course.title.charAt(0)}</span>
                                </div>
                              )}
                            </div>
                            <div className="course-details">
                              <h3>{course.title}</h3>
                              <div className="course-category">{course.category}</div>
                              <p className="course-description">
                                {course.description.length > 100
                                  ? `${course.description.substring(0, 100)}...`
                                  : course.description}
                              </p>
                              <div className="course-actions">
                                <button 
                                  className="btn btn-primary"
                                  onClick={() => handleViewStudents(course.id)}
                                >
                                  View Enrolled Students
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {activeTab === 'createCourse' && (
          <div className="create-course-section">
            <CreateCourse onSuccess={handleCourseCreated} />
          </div>
        )}
        
        {activeTab === 'students' && selectedCourse && (
          <div className="students-section">
            <h2>Students Enrolled in {courses.find(c => c.id === selectedCourse)?.title}</h2>
            <EnrolledStudents courseId={selectedCourse} />
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