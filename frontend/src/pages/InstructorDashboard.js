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

  const fetchMyCourses = async () => {
    try {
      const response = await axios.get(
        'http://localhost:8080/api/instructor/courses',
        { headers: authHeader() }
      );
      setMyCourses(response.data);
      setError('');
    } catch (err) {
      setError('Failed to load your courses. Please try again later.');
      console.error(err);
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

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      await fetchMyCourses();
      
      try {
        await fetchAllCourses();
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
          className={`tab-button ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => setActiveTab('analytics')}
        >
          Analytics
        </button>
      </div>
      
      <div className="dashboard-content">
        {activeTab === 'myCourses' && (
          <div className="my-courses-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>My Courses</h2>
              
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
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : (
              <>
                {myCourses.length === 0 ? (
                  <div className="alert alert-info">
                    You haven't created any courses yet. Create your first course to get started.
                  </div>
                ) : filteredMyCourses.length === 0 ? (
                  <div className="alert alert-warning">
                    No courses match your search criteria.
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
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        )}
        
        {activeTab === 'discover' && (
          <div className="discover-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2>All Available Courses</h2>
              
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
              <div className="d-flex justify-content-center align-items-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : error ? (
              <div className="alert alert-danger">{error}</div>
            ) : allCourses.length === 0 ? (
              <div className="alert alert-info">
                No courses available at the moment.
              </div>
            ) : filteredAllCourses.length === 0 ? (
              <div className="alert alert-warning">
                No courses match your search criteria.
              </div>
            ) : (
              <div className="courses-grid">
                {filteredAllCourses.map(course => (
                  <div className="course-card" key={course.id} style={{ position: 'relative' }}>
                    {isInstructorCourse(course.id) && (
                      <div style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        background: 'rgba(33, 150, 83, 0.8)',
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 'bold'
                      }}>
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
                          View Course
                        </Link>
                        {isInstructorCourse(course.id) && (
                          <button
                            className="btn btn-secondary ms-2"
                            onClick={() => handleEditCourse(course)}
                          >
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
              <h2>Students Enrolled in {myCourses.find(c => c.id === selectedCourse)?.title}</h2>
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