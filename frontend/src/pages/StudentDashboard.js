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
      await axios.put(
        'http://localhost:8080/api/student/update-user-type',
        selectedUserType,
        { headers: authHeader() }
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
    }
  };

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
    <div className="dashboard-container">
      <h1>Student Dashboard</h1>
      
      {/* Display user type and account type */}
      {userType && (
        <div className="user-type-banner mb-4">
          <div className="alert alert-info">
            <div>
              <strong>Account Type:</strong> Student
            </div>
            <div>
              <strong>User Type:</strong> {userType === 'STUDENT' ? 'Student' :
                                       userType === 'PROFESSIONAL' ? 'Professional' :
                                       'Placement Training'}
            </div>
            <button 
              className="btn btn-sm btn-outline-primary mt-2"
              onClick={() => {
                setSelectedUserType(userType);
                setShowUserTypeModal(true);
              }}
            >
              Change User Type
            </button>
          </div>
        </div>
      )}
      
      {/* User Type Update Modal */}
      {showUserTypeModal && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">Update User Type</h5>
                <button 
                  type="button" 
                  className="btn-close" 
                  onClick={() => setShowUserTypeModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                {updateSuccess && (
                  <div className="alert alert-success">{updateSuccess}</div>
                )}
                {updateError && (
                  <div className="alert alert-danger">{updateError}</div>
                )}
                <div className="form-group">
                  <label>Select User Type</label>
                  <select 
                    className="form-control"
                    value={selectedUserType}
                    onChange={(e) => setSelectedUserType(e.target.value)}
                  >
                    <option value="STUDENT">Student</option>
                    <option value="PROFESSIONAL">Professional</option>
                    <option value="PLACEMENT_TRAINING">Placement Training</option>
                  </select>
                </div>
                <div className="alert alert-warning mt-3">
                  <small>
                    Note: Changing your user type will affect the courses available to you.
                    You may need to re-enroll in courses that match your new user type.
                  </small>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  onClick={() => setShowUserTypeModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  onClick={handleUserTypeUpdate}
                >
                  Update
                </button>
              </div>
            </div>
          </div>
        </div>
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
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>My Learning</h2>
              
              {/* Search and filter inline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search courses"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{ width: '250px' }}
                />
                <select
                  className="form-control"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  style={{ width: '150px' }}
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>
            </div>
            
            {loading ? (
              <p>Loading courses...</p>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : enrolledCourses.length === 0 ? (
              <p>You haven't enrolled in any courses yet.</p>
            ) : filteredEnrolledCourses.length === 0 ? (
              <p>No courses match your search criteria.</p>
            ) : (
              <CourseList courses={filteredEnrolledCourses} isEnrolledView={true} />
            )}
          </div>
        )}
        
        {activeTab === 'discover' && (
          <div className="discover-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <div>
                <h2>Available Courses</h2>
                <p className="text-muted">
                  Showing courses suitable for your user type: {userType === 'STUDENT' ? 'Student' :
                                                           userType === 'PROFESSIONAL' ? 'Professional' :
                                                           'Placement Training'}
                </p>
              </div>
              
              {/* Search and filter inline */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search courses"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{ width: '250px' }}
                />
                <select
                  className="form-control"
                  value={selectedCategory}
                  onChange={handleCategoryChange}
                  style={{ width: '150px' }}
                >
                  <option value="">All Categories</option>
                  {categories.map((category, index) => (
                    <option key={index} value={category}>
                      {category}
                    </option>
                  ))}
                </select>
                <button 
                  className="btn btn-sm btn-secondary"
                  onClick={resetFilters}
                >
                  Reset
                </button>
              </div>
            </div>
            
            {loading ? (
              <p>Loading courses...</p>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : courses.length === 0 ? (
              <div className="courses-empty">
                <h3>No courses available for your user type</h3>
                <p>Check back later for new courses!</p>
              </div>
            ) : filteredAllCourses.length === 0 ? (
              <p>No courses match your search criteria.</p>
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
            <h2>My Certificates</h2>
            <p>Your certificates will appear here once you complete courses.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard; 