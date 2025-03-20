import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../services/auth-header';
import CreateCourse from '../components/course/CreateCourse';
import EditCourse from '../components/course/EditCourse';
import CourseList from '../components/course/CourseList';
import EnrolledStudents from '../components/course/EnrolledStudents';
import './Dashboard.css';

const InstructorDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('myCourses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToEdit, setCourseToEdit] = useState(null);

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

  const handleEditCourse = (course) => {
    setCourseToEdit(course);
    setActiveTab('editCourse');
  };

  const handleCourseUpdated = (updatedCourse) => {
    const updatedCourses = courses.map(course => 
      course.id === updatedCourse.id ? updatedCourse : course
    );
    setCourses(updatedCourses);
  };

  const handleCancelEdit = () => {
    setCourseToEdit(null);
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
        {courseToEdit && (
          <button
            className={`tab-button ${activeTab === 'editCourse' ? 'active' : ''}`}
            onClick={() => setActiveTab('editCourse')}
          >
            Edit Course
          </button>
        )}
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
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
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
                                  className="btn btn-primary me-2"
                                  onClick={() => handleViewStudents(course.id)}
                                >
                                  View Students
                                </button>
                                <button
                                  className="btn btn-secondary"
                                  onClick={() => handleEditCourse(course)}
                                >
                                  Edit Course
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
          <div className="create-course-section feature-card">
            <div className="card-body p-4">
              <CreateCourse onSuccess={handleCourseCreated} />
            </div>
          </div>
        )}

        {activeTab === 'editCourse' && courseToEdit && (
          <div className="edit-course-section feature-card">
            <div className="card-body p-4">
              <EditCourse 
                course={courseToEdit} 
                onSuccess={handleCourseUpdated} 
                onCancel={handleCancelEdit} 
              />
            </div>
          </div>
        )}
        
        {activeTab === 'students' && selectedCourse && (
          <div className="students-section">
            <div className="d-flex justify-content-between align-items-center mb-3">
              <h2>Students Enrolled in {courses.find(c => c.id === selectedCourse)?.title}</h2>
              <button 
                className="btn btn-outline-primary" 
                onClick={() => setActiveTab('myCourses')}
              >
                Back to Courses
              </button>
            </div>
            <div className="feature-card" style={{ padding: 0, overflow: 'hidden' }}>
              <EnrolledStudents courseId={selectedCourse} />
            </div>
          </div>
        )}
        
        {activeTab === 'analytics' && (
          <div className="analytics-section feature-card">
            <div className="card-body p-4">
              <h2>Analytics</h2>
              <p>Course analytics will be available here soon.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard; 