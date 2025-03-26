import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../services/auth-header';
import CourseList from '../components/course/CourseList';
import './Dashboard.css';
import { Link } from 'react-router-dom';

const StudentDashboard = () => {
  const [courses, setCourses] = useState([]);
  const [enrolledCourses, setEnrolledCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('myLearning');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [userType, setUserType] = useState(null);
  const [showUserTypeModal, setShowUserTypeModal] = useState(false);
  const [selectedUserType, setSelectedUserType] = useState(null);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  const fetchUserType = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/student/profile',
        { headers: authHeader() }
      );
      setUserType(response.data.userType);
    } catch (err) {
      console.error('Failed to fetch user type:', err);
    }
  };

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/student/courses',
        { headers: authHeader() }
      );
      // The backend already filters courses based on user type, so we don't need to filter again
      setCourses(response.data);
      
      // Extract unique categories from courses
      const uniqueCategories = [...new Set(response.data.map(course => course.category))];
      setCategories(uniqueCategories);
      
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
      // The backend already filters courses based on user type, so we don't need to filter again
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

  const handleUserTypeUpdate = async () => {
    try {
      setIsUpdating(true);
      await axios.put(
        'http://localhost:8080/api/student/update-user-type',
        JSON.stringify(selectedUserType),
        { 
          headers: {
            ...authHeader(),
            'Content-Type': 'application/json'
          }
        }
      );
      setUpdateSuccess('User type updated successfully!');
      setUpdateError('');
      await fetchUserType(); // Refresh user type
      await fetchCourses(); // Refresh courses to show updated list
      setTimeout(() => {
        setShowUserTypeModal(false);
        setUpdateSuccess('');
      }, 2000);
    } catch (err) {
      setUpdateError(err.response?.data?.message || 'Failed to update user type');
      setUpdateSuccess('');
    } finally {
      setIsUpdating(false);
    }
  };

  // Add keyboard event listener for Esc key
  useEffect(() => {
    const handleEscKey = (event) => {
      if (event.key === 'Escape' && showUserTypeModal) {
        setShowUserTypeModal(false);
      }
    };

    window.addEventListener('keydown', handleEscKey);
    return () => window.removeEventListener('keydown', handleEscKey);
  }, [showUserTypeModal]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchUserType();
      await Promise.all([fetchCourses(), fetchEnrolledCourses()]);
      setLoading(false);
    };
    
    loadData();
    
    // Set up periodic refresh every 30 seconds
    const refreshInterval = setInterval(() => {
      Promise.all([fetchCourses(), fetchEnrolledCourses()]);
    }, 30000);
    
    // Cleanup interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCategoryChange = (e) => {
    setSelectedCategory(e.target.value);
  };

  const resetFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
  };

  // Filter courses based on search term and category
  const filterCourses = (courseList) => {
    return courseList.filter(course => {
      const matchesSearch = course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           course.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === '' || course.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  };

  // Check if a course is already enrolled to display different UI
  const isEnrolled = (courseId) => {
    return enrolledCourses.some(course => course.id === courseId);
  };

  // Apply filters to both enrolled and available courses
  const filteredEnrolledCourses = filterCourses(enrolledCourses);
  const filteredAllCourses = filterCourses(courses);

  return (
    <div className="main-content">
      <div className="dashboard-container">
        <h1>Student Dashboard</h1>
        
        {/* Display user type and account type */}
        {userType && (
          <div className="user-type-banner mb-4">
            <div className="user-type-card">
              <div className="user-type-info">
                <i className="bi bi-person-circle me-2"></i>
                <div>
                  <h6 className="mb-1">Current User Type</h6>
                  <span className="user-type-badge">
                    {userType === 'STUDENT' ? 'Student' :
                     userType === 'PROFESSIONAL' ? 'Professional' :
                     'Placement Training'}
                  </span>
                </div>
              </div>
              <button 
                className="btn btn-primary"
                onClick={() => {
                  setSelectedUserType(userType);
                  setShowUserTypeModal(true);
                }}
              >
                <i className="bi bi-pencil-square me-2"></i>
                Change User Type
              </button>
            </div>
          </div>
        )}
        
        {/* User Type Update Modal */}
        {showUserTypeModal && (
          <>
            <div 
              className="modal-backdrop"
              onClick={() => setShowUserTypeModal(false)}
            />
            <div className="modal">
              <div className="modal-content" style={{
                border: 'none',
                borderRadius: '15px',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)',
                animation: 'slideIn 0.3s ease-out',
                backgroundColor: 'white'
              }}>
                <div className="modal-header" style={{
                  borderBottom: '1px solid #eee',
                  padding: '1.5rem'
                }}>
                  <h5 className="modal-title" style={{
                    fontSize: '1.5rem',
                    fontWeight: '600',
                    color: '#2c3e50'
                  }}>Update User Type</h5>
                  <button 
                    type="button" 
                    className="btn-close" 
                    onClick={() => setShowUserTypeModal(false)}
                    disabled={isUpdating}
                    style={{
                      opacity: isUpdating ? '0.5' : '1',
                      transition: 'opacity 0.2s'
                    }}
                  ></button>
                </div>
                <div className="modal-body" style={{ padding: '1.5rem' }}>
                  {updateSuccess && (
                    <div className="alert alert-success" style={{
                      animation: 'slideIn 0.3s ease-out',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(40, 167, 69, 0.1)'
                    }}>
                      <i className="bi bi-check-circle-fill me-2"></i>
                      {updateSuccess}
                    </div>
                  )}
                  {updateError && (
                    <div className="alert alert-danger" style={{
                      animation: 'slideIn 0.3s ease-out',
                      borderRadius: '8px',
                      border: 'none',
                      boxShadow: '0 2px 10px rgba(220, 53, 69, 0.1)'
                    }}>
                      <i className="bi bi-exclamation-circle-fill me-2"></i>
                      {updateError}
                    </div>
                  )}
                  <div className="form-group">
                    <label className="form-label" style={{
                      fontSize: '1.1rem',
                      fontWeight: '500',
                      color: '#2c3e50',
                      marginBottom: '0.8rem'
                    }}>Select User Type</label>
                    <select 
                      className="form-select"
                      value={selectedUserType}
                      onChange={(e) => setSelectedUserType(e.target.value)}
                      disabled={isUpdating}
                      style={{
                        padding: '0.8rem',
                        borderRadius: '8px',
                        border: '2px solid #e9ecef',
                        fontSize: '1rem',
                        transition: 'all 0.2s',
                        cursor: isUpdating ? 'not-allowed' : 'pointer',
                        backgroundColor: isUpdating ? '#f8f9fa' : 'white',
                        boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
                      }}
                    >
                      <option value="STUDENT">Student</option>
                      <option value="PROFESSIONAL">Professional</option>
                      <option value="PLACEMENT_TRAINING">Placement Training</option>
                    </select>
                  </div>
                  <div className="alert alert-warning mt-3" style={{
                    borderRadius: '8px',
                    border: 'none',
                    backgroundColor: '#fff3cd',
                    color: '#856404',
                    boxShadow: '0 2px 10px rgba(255, 193, 7, 0.1)'
                  }}>
                    <small>
                      <i className="bi bi-exclamation-triangle-fill me-2"></i>
                      Note: Changing your user type will affect the courses available to you.
                      You may need to re-enroll in courses that match your new user type.
                    </small>
                  </div>
                </div>
                <div className="modal-footer" style={{
                  borderTop: '1px solid #eee',
                  padding: '1.5rem'
                }}>
                  <button 
                    type="button" 
                    className="btn btn-secondary" 
                    onClick={() => setShowUserTypeModal(false)}
                    disabled={isUpdating}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      opacity: isUpdating ? '0.7' : '1'
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    type="button" 
                    className="btn btn-primary" 
                    onClick={handleUserTypeUpdate}
                    disabled={isUpdating}
                    style={{
                      padding: '0.6rem 1.2rem',
                      borderRadius: '8px',
                      transition: 'all 0.2s',
                      backgroundColor: '#0d6efd',
                      border: 'none',
                      boxShadow: '0 2px 5px rgba(13, 110, 253, 0.2)'
                    }}
                  >
                    {isUpdating ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Updating...
                      </>
                    ) : (
                      'Update'
                    )}
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
        
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
              <div className="section-header">
                <h2>My Learning</h2>
                <div className="search-filter-controls">
                  <input
                    type="text"
                    placeholder="Search courses"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <button 
                    className="btn btn-secondary"
                    onClick={resetFilters}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Reset
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="loading-state">
                  <i className="bi bi-arrow-repeat"></i>
                  <p>Loading your courses...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle-fill me-2"></i>
                  {error}
                </div>
              ) : enrolledCourses.length === 0 ? (
                <div className="courses-empty">
                  <i className="bi bi-book me-2"></i>
                  <h3>No Enrolled Courses</h3>
                  <p>Start your learning journey by enrolling in courses!</p>
                </div>
              ) : filteredEnrolledCourses.length === 0 ? (
                <div className="courses-empty">
                  <i className="bi bi-search me-2"></i>
                  <h3>No Matching Courses</h3>
                  <p>Try adjusting your search criteria</p>
                </div>
              ) : (
                <CourseList courses={filteredEnrolledCourses} isEnrolledView={true} />
              )}
            </div>
          )}
          
          {activeTab === 'discover' && (
            <div className="discover-section">
              <div className="section-header">
                <div>
                  <h2>Available Courses</h2>
                  <p className="text-muted">
                    Showing courses suitable for your user type: {userType === 'STUDENT' ? 'Student' :
                                                             userType === 'PROFESSIONAL' ? 'Professional' :
                                                             'Placement Training'}
                  </p>
                </div>
                <div className="search-filter-controls">
                  <input
                    type="text"
                    placeholder="Search courses"
                    value={searchTerm}
                    onChange={handleSearchChange}
                  />
                  <select
                    value={selectedCategory}
                    onChange={handleCategoryChange}
                  >
                    <option value="">All Categories</option>
                    {categories.map((category, index) => (
                      <option key={index} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  <button 
                    className="btn btn-secondary"
                    onClick={resetFilters}
                  >
                    <i className="bi bi-x-circle me-2"></i>
                    Reset
                  </button>
                </div>
              </div>
              
              {loading ? (
                <div className="loading-state">
                  <i className="bi bi-arrow-repeat"></i>
                  <p>Loading available courses...</p>
                </div>
              ) : error ? (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle-fill me-2"></i>
                  {error}
                </div>
              ) : courses.length === 0 ? (
                <div className="courses-empty">
                  <i className="bi bi-book me-2"></i>
                  <h3>No Courses Available</h3>
                  <p>Check back later for new courses!</p>
                </div>
              ) : filteredAllCourses.length === 0 ? (
                <div className="courses-empty">
                  <i className="bi bi-search me-2"></i>
                  <h3>No Matching Courses</h3>
                  <p>Try adjusting your search criteria</p>
                </div>
              ) : (
                <CourseList 
                  courses={filteredAllCourses} 
                  showEnrollButton={true} 
                  onEnroll={handleEnroll}
                />
              )}
            </div>
          )}
          
          {activeTab === 'certificates' && (
            <div className="certificates-section">
              <div className="section-header">
                <h2>My Certificates</h2>
              </div>
              <div className="courses-empty">
                <i className="bi bi-award me-2"></i>
                <h3>No Certificates Yet</h3>
                <p>Complete courses to earn certificates!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard; 