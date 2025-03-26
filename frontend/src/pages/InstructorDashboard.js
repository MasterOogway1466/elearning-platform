import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../services/auth-header';
import CreateCourse from '../components/course/CreateCourse';
import EditCourse from '../components/course/EditCourse';
import CourseList from '../components/course/CourseList';
import EnrolledStudents from '../components/course/EnrolledStudents';
import './Dashboard.css';
import { Link } from 'react-router-dom';

const InstructorDashboard = () => {
  const [myCourses, setMyCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('myCourses');
  const [selectedCourse, setSelectedCourse] = useState(null);
  const [courseToEdit, setCourseToEdit] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [categories, setCategories] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [rejectedCourses, setRejectedCourses] = useState([]);

  const fetchMyCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/instructor/courses', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setMyCourses(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching my courses:', error);
      setError('Failed to fetch your courses');
      setLoading(false);
    }
  };

  const fetchAllCourses = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/instructor/all-courses',
        { headers: authHeader() }
      );
      setAllCourses(response.data);
      
      // Extract unique categories from all courses
      const uniqueCategories = [...new Set(response.data.map(course => course.category))];
      setCategories(uniqueCategories);
      
      setError('');
    } catch (err) {
      setError('Failed to load all courses. Please try again later.');
      console.error(err);
      
      // Fallback: If we can't get all courses, at least use the instructor's courses
      // for the categories and display
      if (myCourses.length > 0) {
        setAllCourses(myCourses);
        const uniqueCategories = [...new Set(myCourses.map(course => course.category))];
        setCategories(uniqueCategories);
      }
    }
  };

  const fetchRejectedCourses = async () => {
    try {
      const response = await axios.get('http://localhost:8080/api/instructor/rejected-courses', {
        headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` }
      });
      setRejectedCourses(response.data);
    } catch (error) {
      console.error('Error fetching rejected courses:', error);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchMyCourses();
      
      try {
        await fetchAllCourses();
        await fetchRejectedCourses();
      } catch (error) {
        console.error("Could not fetch all courses:", error);
      }
      
      setLoading(false);
    };
    loadData();
  }, []);

  const handleCourseCreated = (newCourse) => {
    setMyCourses([...myCourses, newCourse]);
    // Also update all courses
    setAllCourses([...allCourses, newCourse]);
    setActiveTab('myCourses');
  };
  
  const handleViewStudents = (courseId) => {
    setSelectedCourse(courseId);
    setActiveTab('students');
  };

  const handleEditCourse = (course) => {
    console.log('Course being set for editing:', course);
    setCourseToEdit(course);
    setActiveTab('editCourse');
  };

  const handleCourseUpdated = (updatedCourse) => {
    console.log('Updated course received:', updatedCourse);
    const updatedMyCourses = myCourses.map(course => 
      course.id === updatedCourse.id ? updatedCourse : course
    );
    setMyCourses(updatedMyCourses);
    
    // Also update in all courses
    const updatedAllCourses = allCourses.map(course => 
      course.id === updatedCourse.id ? updatedCourse : course
    );
    setAllCourses(updatedAllCourses);
    
    setActiveTab('myCourses');
  };

  const handleCancelEdit = () => {
    setCourseToEdit(null);
    setActiveTab('myCourses');
  };

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

  // Check if a course belongs to the instructor
  const isInstructorCourse = (courseId) => {
    return myCourses.some(course => course.id === courseId);
  };

  const filteredMyCourses = filterCourses(myCourses);
  const filteredAllCourses = filterCourses(allCourses);

  const handleResubmitCourse = async (courseId) => {
    try {
      const response = await axios.post(
        `http://localhost:8080/api/instructor/courses/${courseId}/resubmit`,
        {},
        { headers: { Authorization: `Bearer ${localStorage.getItem('authToken')}` } }
      );
      
      // Update the course in rejectedCourses state
      setRejectedCourses(rejectedCourses.filter(course => course.id !== courseId));
      
      // Show success message
      setError('');
    } catch (err) {
      // Extract error message from the error object
      const errorMessage = err.response?.data?.message || err.message || 'Failed to resubmit course';
      setError(errorMessage);
    }
  };

  return (
    <div className="main-content">
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
            className={`tab-button ${activeTab === 'discover' ? 'active' : ''}`}
            onClick={() => setActiveTab('discover')}
          >
            All Courses
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
            className={`tab-button ${activeTab === 'rejected' ? 'active' : ''}`}
            onClick={() => setActiveTab('rejected')}
          >
            Rejected Courses
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
              <div className="section-header">
                <h2>My Courses</h2>
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
              ) : myCourses.length === 0 ? (
                <div className="courses-empty">
                  <i className="bi bi-book me-2"></i>
                  <h3>No Courses Created</h3>
                  <p>Create your first course to get started!</p>
                </div>
              ) : filteredMyCourses.length === 0 ? (
                <div className="courses-empty">
                  <i className="bi bi-search me-2"></i>
                  <h3>No Matching Courses</h3>
                  <p>Try adjusting your search criteria</p>
                </div>
              ) : (
                <div className="courses-grid">
                  {filteredMyCourses.map(course => (
                    <div className="course-card" key={course.id}>
                      <div className="course-image">
                        {course.imageUrl ? (
                          <img src={course.imageUrl} alt={course.title} />
                        ) : (
                          <div className="default-course-image">
                            <span>{course.title.charAt(0)}</span>
                          </div>
                        )}
                        <div className={`course-status ${course.status?.toLowerCase() || 'pending'}`}>
                          {course.status === 'PENDING' ? 'Under Review' : 
                           course.status === 'APPROVED' ? 'Approved' : 
                           course.status === 'REJECTED' ? 'Rejected' :
                           'Under Review'}
                        </div>
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
                          {course.status === 'APPROVED' && (
                            <button 
                              className="btn btn-primary me-2"
                              onClick={() => handleViewStudents(course.id)}
                            >
                              <i className="bi bi-people me-2"></i>
                              View Students
                            </button>
                          )}
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleEditCourse(course)}
                          >
                            <i className="bi bi-pencil me-2"></i>
                            Edit Course
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'discover' && (
            <div className="discover-section">
              <div className="section-header">
                <h2>All Available Courses</h2>
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
              ) : allCourses.length === 0 ? (
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
                <div className="courses-grid">
                  {filteredAllCourses.map(course => (
                    <div className="course-card" key={course.id}>
                      {isInstructorCourse(course.id) && (
                        <div className="course-badge">
                          <i className="bi bi-check-circle-fill me-1"></i>
                          Your Course
                        </div>
                      )}
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
                        <div className="course-instructor">By {course.instructorName}</div>
                        <p className="course-description">
                          {course.description.length > 100
                            ? `${course.description.substring(0, 100)}...`
                            : course.description}
                        </p>
                        <div className="course-actions">
                          <Link to={`/courses/${course.id}`} className="btn btn-primary">
                            <i className="bi bi-eye me-2"></i>
                            View Course
                          </Link>
                          {isInstructorCourse(course.id) && (
                            <button
                              className="btn btn-secondary ms-2"
                              onClick={() => handleEditCourse(course)}
                            >
                              <i className="bi bi-pencil me-2"></i>
                              Edit Course
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'createCourse' && (
            <div className="create-course-section">
              <div className="section-header">
                <h2>Create New Course</h2>
              </div>
              <div className="feature-card">
                <CreateCourse onSuccess={handleCourseCreated} />
              </div>
            </div>
          )}

          {activeTab === 'editCourse' && courseToEdit && (
            <div className="edit-course-section">
              <div className="section-header">
                <h2>Edit Course</h2>
                <button 
                  className="btn btn-secondary"
                  onClick={handleCancelEdit}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Courses
                </button>
              </div>
              <div className="feature-card">
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
              <div className="section-header">
                <h2>Students Enrolled in {myCourses.find(c => c.id === selectedCourse)?.title}</h2>
                <button 
                  className="btn btn-secondary"
                  onClick={() => setActiveTab('myCourses')}
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Back to Courses
                </button>
              </div>
              <div className="feature-card">
                <EnrolledStudents courseId={selectedCourse} />
              </div>
            </div>
          )}
          
          {activeTab === 'rejected' && (
            <div className="rejected-courses-section">
              <div className="section-header">
                <h2>Rejected Courses</h2>
              </div>
              {error && (
                <div className="alert alert-danger">
                  <i className="bi bi-exclamation-circle-fill me-2"></i>
                  {typeof error === 'string' ? error : 'An error occurred while resubmitting the course'}
                </div>
              )}
              {rejectedCourses.length === 0 ? (
                <div className="courses-empty">
                  <i className="bi bi-check-circle me-2"></i>
                  <h3>No Rejected Courses</h3>
                  <p>All your courses are either approved or pending review!</p>
                </div>
              ) : (
                <div className="courses-grid">
                  {rejectedCourses.map(course => (
                    <div className="course-card" key={course.id}>
                      <div className="course-image">
                        {course.imageUrl ? (
                          <img src={course.imageUrl} alt={course.title} />
                        ) : (
                          <div className="default-course-image">
                            <span>{course.title.charAt(0)}</span>
                          </div>
                        )}
                        <div className="course-status rejected">
                          Rejected
                        </div>
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
                            onClick={() => handleResubmitCourse(course.id)}
                          >
                            <i className="bi bi-arrow-clockwise me-2"></i>
                            Resubmit for Review
                          </button>
                          <button
                            className="btn btn-secondary"
                            onClick={() => handleEditCourse(course)}
                          >
                            <i className="bi bi-pencil me-2"></i>
                            Edit Course
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {activeTab === 'analytics' && (
            <div className="analytics-section">
              <div className="section-header">
                <h2>Course Analytics</h2>
              </div>
              <div className="courses-empty">
                <i className="bi bi-graph-up me-2"></i>
                <h3>Analytics Coming Soon</h3>
                <p>Course analytics will be available here soon!</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InstructorDashboard; 