import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import StudentList from '../components/admin/StudentList';
import InstructorList from '../components/admin/InstructorList';
import PendingCourses from '../components/admin/PendingCourses';
import CourseDetails from '../components/course/CourseDetails';
import Profile from './Profile';
import '../components/admin/AdminComponents.css';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalInstructors: 0,
    totalCourses: 0,
    pendingCourses: 0
  });
  const [selectedCourseId, setSelectedCourseId] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('http://localhost:8080/api/admin/stats', {
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`
          }
        });
        if (response.ok) {
          const data = await response.json();
          setStats(data);
        } else {
          console.error('Failed to fetch stats:', response.status);
        }
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStats();
  }, []);

  const handleViewCourseDetails = (courseId) => {
    setSelectedCourseId(courseId);
  };

  const handleCloseModal = () => {
    setSelectedCourseId(null);
  };

  // Make CourseDetails component available to child components
  const courseDetailsProps = {
    onViewCourse: handleViewCourseDetails
  };

  if (!isAdmin) {
    return <div>Access denied. Admin privileges required.</div>;
  }

  return (
    <div className="main-content">
      <div className="admin-dashboard">
        <div className="admin-stats">
          <div className="stat-card">
            <h3>Total Students</h3>
            <p>{stats.totalStudents}</p>
          </div>
          <div className="stat-card">
            <h3>Total Instructors</h3>
            <p>{stats.totalInstructors}</p>
          </div>
          <div className="stat-card">
            <h3>Total Courses</h3>
            <p>{stats.totalCourses}</p>
          </div>
          <div className="stat-card">
            <h3>Pending Courses</h3>
            <p>{stats.pendingCourses}</p>
          </div>
        </div>

        <div className="admin-actions">
          {/* <button 
            className={`admin-button ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <i className="fas fa-tachometer-alt"></i>
            Dashboard
          </button> */}
          <button 
            className={`admin-button ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            <i className="fas fa-user-graduate"></i>
            Students
          </button>
          <button 
            className={`admin-button ${activeTab === 'instructors' ? 'active' : ''}`}
            onClick={() => setActiveTab('instructors')}
          >
            <i className="fas fa-chalkboard-teacher"></i>
            Instructors
          </button>
          <button 
            className={`admin-button ${activeTab === 'pending-courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('pending-courses')}
          >
            <i className="fas fa-clock"></i>
            Pending Courses
          </button>
          {/* <button 
            className={`admin-button ${activeTab === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveTab('profile')}
          >
            <i className="fas fa-user"></i>
            Profile
          </button> */}
        </div>

        <div className="admin-content">
          {activeTab === 'dashboard' && (
            <div>
              <h2>Welcome, {user?.fullName}</h2>
              <p>Use the buttons above to manage students, instructors, and review pending courses.</p>
            </div>
          )}
          {activeTab === 'students' && <StudentList />}
          {activeTab === 'instructors' && <InstructorList />}
          {activeTab === 'pending-courses' && <PendingCourses onViewCourse={handleViewCourseDetails} />}
          {activeTab === 'profile' && <Profile />}
        </div>
      </div>
      
      {selectedCourseId && (
        <CourseDetails 
          courseId={selectedCourseId}
          onClose={handleCloseModal}
        />
      )}
    </div>
  );
};

export default AdminDashboard; 