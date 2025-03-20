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

  const fetchCourses = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/student/courses',
        { headers: authHeader() }
      );
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
              <h2>Available Courses</h2>
              
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
                <h3>No courses available</h3>
                <p>Check back later for new courses!</p>
              </div>
            ) : filteredAllCourses.length === 0 ? (
              <p>No courses match your search criteria.</p>
            ) : (
              <div className="courses-grid">
                {filteredAllCourses.map(course => (
                  <div className="course-card" key={course.id} style={{ position: 'relative' }}>
                    <div className="course-image">
                      {course.imageUrl ? (
                        <img src={course.imageUrl} alt={course.title} />
                      ) : (
                        <div className="default-course-image">
                          <span>{course.title.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    {isEnrolled(course.id) && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#28a745',
                        color: 'white',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold',
                        zIndex: 2
                      }}>
                        Enrolled
                      </div>
                    )}
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
                          View Course
                        </Link>
                        {!isEnrolled(course.id) && (
                          <button
                            onClick={() => handleEnroll(course.id)}
                            className="btn btn-success"
                          >
                            Enroll Now
                          </button>
                        )}
                        {isEnrolled(course.id) && (
                          <Link to={`/student/course/${course.id}`} className="btn btn-success">
                            Continue Learning
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
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