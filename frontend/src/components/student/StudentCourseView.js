import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import authHeader from '../../services/auth-header';
import './StudentCourseView.css';

const StudentCourseView = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchCourseDetails = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`http://localhost:8080/api/courses/${courseId}`, {
          headers: authHeader()
        });
        setCourse(response.data);
        setError(null);
      } catch (err) {
        setError('Failed to load course details. Please try again later.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    if (courseId) {
      fetchCourseDetails();
    }
  }, [courseId]);

  const handleBackToDashboard = () => {
    navigate('/student-dashboard');
  };

  const handleViewChapter = (index) => {
    navigate(`/student/course/${courseId}/chapter/${index}`);
  };

  const handleViewNotes = () => {
    navigate(`/student/notes/${courseId}`);
  };

  if (loading) {
    return (
      <div className="course-view-container loading">
        <div className="loading-spinner">
          <i className="bi bi-arrow-repeat"></i>
          <p>Loading course content...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="course-view-container error">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {error}
        </div>
        <button className="btn btn-primary" onClick={handleBackToDashboard}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </button>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="course-view-container">
        <div className="alert alert-warning">
          <i className="bi bi-info-circle-fill me-2"></i>
          Course not found
        </div>
        <button className="btn btn-primary" onClick={handleBackToDashboard}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="course-view-container">
      <div className="course-view-header">
        <div className="course-header-top">
          <div className="d-flex gap-2">
            <button className="btn btn-outline-primary" onClick={handleBackToDashboard}>
              <i className="bi bi-arrow-left me-2"></i>
              Back to Dashboard
            </button>
            <button className="btn btn-outline-secondary" onClick={handleViewNotes}>
              <i className="bi bi-journal-text me-2"></i>
              View Notes
            </button>
          </div>
          
          <div className="course-navigation">
            <button 
              className={`nav-pill ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="bi bi-info-circle me-1"></i>
              Overview
            </button>
            {course.pdfUrl && (
              <button 
                className={`nav-pill ${activeTab === 'content' ? 'active' : ''}`}
                onClick={() => setActiveTab('content')}
              >
                <i className="bi bi-book me-1"></i>
                Content
              </button>
            )}
            <button 
              className={`nav-pill ${activeTab === 'chapters' ? 'active' : ''}`}
              onClick={() => setActiveTab('chapters')}
            >
              <i className="bi bi-list-check me-1"></i>
              Chapters
            </button>
          </div>
          
          <div className="course-quick-details">
            <div className="quick-detail-item">
              <i className="bi bi-info-circle me-2"></i>
              <span>{course.category} · {course.courseType === 'STUDENT' ? 'Student Course' : 
                            course.courseType === 'PROFESSIONAL' ? 'Professional Course' : 
                            'Placement Training Course'}</span>
            </div>
            <div className="quick-detail-item">
              <i className="bi bi-list-check me-2"></i>
              <span>Chapters: {course.chapters ? course.chapters.length : 0}</span>
            </div>
          </div>
        </div>
        
        <h1>{course.title}</h1>
        <p className="instructor-info">
          <i className="bi bi-person-circle me-2"></i>
          Instructor: {course.instructorName}
        </p>
      </div>

      <div className="course-view-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="course-image">
              {course.imageUrl ? (
                <img src={course.imageUrl} alt={course.title} />
              ) : (
                <div className="default-course-image">
                  <span>{course.title.charAt(0)}</span>
                </div>
              )}
            </div>
            
            <div className="course-info-section">
              <h3>Course Information</h3>
              <div className="info-grid">
                <div className="info-item">
                  <span className="info-label">Category:</span>
                  <span className="info-value">{course.category}</span>
                </div>
                <div className="info-item">
                  <span className="info-label">Course Type:</span>
                  <span className="info-value">
                    {course.courseType === 'STUDENT' ? 'Student Course' :
                     course.courseType === 'PROFESSIONAL' ? 'Professional Course' :
                     'Placement Training Course'}
                  </span>
                </div>
                <div className="info-item">
                  <span className="info-label">Last Updated:</span>
                  <span className="info-value">{new Date(course.updatedAt).toLocaleDateString()}</span>
                </div>
              </div>
            </div>
            
            {course.description && (
              <div className="course-section">
                <h3>Description</h3>
                <p>{course.description}</p>
              </div>
            )}
            
            {course.syllabus && (
              <div className="course-section">
                <h3>Syllabus</h3>
                <p>{course.syllabus}</p>
              </div>
            )}
            
            {course.requirements && (
              <div className="course-section">
                <h3>Requirements</h3>
                <p>{course.requirements}</p>
              </div>
            )}
            
            {course.objectives && (
              <div className="course-section">
                <h3>Learning Objectives</h3>
                <p>{course.objectives}</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'content' && course.pdfUrl && (
          <div className="content-tab">
            <div className="pdf-container">
              <iframe
                src={`${course.pdfUrl}#toolbar=1&navpanes=1&scrollbar=1`}
                title={course.title}
                frameBorder="0"
                width="100%"
                height="800px"
              ></iframe>
            </div>
            <div className="pdf-download">
              <a href={course.pdfUrl} target="_blank" rel="noopener noreferrer" className="btn btn-success">
                <i className="bi bi-file-earmark-pdf me-2"></i>
                Download PDF
              </a>
            </div>
          </div>
        )}
        
        {activeTab === 'chapters' && (
          <div className="chapters-tab">
            <h3>Course Chapters</h3>
            {course.chapters && course.chapters.length > 0 ? (
              <div className="chapter-list">
                {course.chapters.map((chapter, index) => (
                  <div 
                    key={index} 
                    className="chapter-item"
                    onClick={() => handleViewChapter(index)}
                  >
                    <div className="chapter-number">{index + 1}</div>
                    <div className="chapter-content">
                      <h4>{chapter}</h4>
                    </div>
                    <div className="chapter-action">
                      <i className="bi bi-arrow-right-circle"></i>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="alert alert-info">
                <i className="bi bi-info-circle me-2"></i>
                No chapters available for this course.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentCourseView; 