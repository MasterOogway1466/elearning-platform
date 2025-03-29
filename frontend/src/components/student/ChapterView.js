import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import authHeader from '../../services/auth-header';
import noteService from '../../services/note.service';
import './ChapterView.css';

const ChapterView = () => {
  const { courseId, chapterIndex } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeChapterIndex, setActiveChapterIndex] = useState(parseInt(chapterIndex, 10) || 0);
  const [showNotesPanel, setShowNotesPanel] = useState(false);
  const [notes, setNotes] = useState('');
  const [savingNotes, setSavingNotes] = useState(false);
  const [notesSaved, setNotesSaved] = useState(false);
  const [notesError, setNotesError] = useState('');

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

  useEffect(() => {
    // Update active chapter when the URL parameter changes
    if (chapterIndex) {
      setActiveChapterIndex(parseInt(chapterIndex, 10));
    }
  }, [chapterIndex]);

  useEffect(() => {
    // Fetch notes when chapter changes
    if (courseId && activeChapterIndex !== null && activeChapterIndex !== undefined) {
      fetchChapterNotes();
    }
  }, [courseId, activeChapterIndex]);

  const fetchChapterNotes = async () => {
    try {
      setNotesError('');
      // Instead of requesting chapter-specific notes, we get the general course notes
      const response = await noteService.getCourseNotes(courseId);
      
      if (response.data && response.data.length > 0) {
        // Get the general course note (without a chapter)
        const generalNote = response.data.find(note => note.chapterIndex === null) || response.data[0];
        setNotes(generalNote.content || '');
      } else {
        setNotes('');
      }
    } catch (err) {
      console.error('Failed to load notes:', err);
      setNotesError('Failed to load notes. Please try again.');
    }
  };

  const handleSaveNotes = async () => {
    try {
      setSavingNotes(true);
      setNotesError('');
      
      // Save to general course notes instead of chapter-specific notes
      await noteService.saveNote(courseId, notes, null);
      
      setNotesSaved(true);
      
      // Clear the success message after 3 seconds
      setTimeout(() => setNotesSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save notes:', err);
      setNotesError('Failed to save notes. Please try again.');
    } finally {
      setSavingNotes(false);
    }
  };

  const handleNotesChange = (e) => {
    setNotes(e.target.value);
    setNotesSaved(false);
  };

  const toggleNotesPanel = () => {
    setShowNotesPanel(!showNotesPanel);
  };

  const handleChapterClick = (index) => {
    setActiveChapterIndex(index);
    // Update URL without full page reload
    navigate(`/student/course/${courseId}/chapter/${index}`, { replace: true });
  };

  const handleBackToCourse = () => {
    navigate(`/student/course/${courseId}`);
  };

  if (loading) {
    return (
      <div className="chapter-view-container">
        <div className="loading-spinner">
          <i className="bi bi-arrow-repeat"></i>
          <p>Loading chapter content...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="chapter-view-container">
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {error || 'Course not found'}
        </div>
        <button className="btn btn-primary" onClick={handleBackToCourse}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Course
        </button>
      </div>
    );
  }

  const chapters = course.chapters || [];
  const currentChapter = chapters[activeChapterIndex];

  if (!currentChapter) {
    return (
      <div className="chapter-view-container">
        <div className="alert alert-warning">
          <i className="bi bi-info-circle-fill me-2"></i>
          Chapter not found
        </div>
        <button className="btn btn-primary" onClick={handleBackToCourse}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Course
        </button>
      </div>
    );
  }

  return (
    <div className="chapter-view-container">
      <div className="chapter-view-header">
        <button className="btn btn-outline-primary" onClick={handleBackToCourse}>
          <i className="bi bi-arrow-left me-2"></i>
          Back to Course
        </button>
        <h1>{course.title}</h1>
        <p className="course-info">
          <i className="bi bi-book me-2"></i>
          Chapter {activeChapterIndex + 1} of {chapters.length}
        </p>
      </div>

      <div className="chapter-view-content">
        <div className="chapter-sidebar">
          <h3>Chapters</h3>
          <div className="chapter-list-nav">
            {chapters.map((chapter, index) => (
              <button
                key={index}
                className={`chapter-nav-item ${index === activeChapterIndex ? 'active' : ''}`}
                onClick={() => handleChapterClick(index)}
              >
                <div className="chapter-nav-number">{index + 1}</div>
                <div className="chapter-nav-title">{chapter}</div>
                {index === activeChapterIndex && <i className="bi bi-chevron-right chapter-nav-indicator"></i>}
              </button>
            ))}
          </div>
        </div>

        <div className="chapter-content-panel">
          <div className="chapter-content-header">
            <h2>{currentChapter}</h2>
            <button 
              className={`notes-toggle-btn ${showNotesPanel ? 'active' : ''}`} 
              onClick={toggleNotesPanel}
            >
              <i className={`bi ${showNotesPanel ? 'bi-x-lg' : 'bi-pencil-square'}`}></i>
              {showNotesPanel ? 'Hide Notes' : 'Course Notes'}
            </button>
          </div>
          
          <div className="chapter-content-wrapper">
            <div className={`chapter-content-body ${showNotesPanel ? 'with-notes' : ''}`}>
              {/* This is where the actual chapter content would go. */}
              {/* For now, we'll display a placeholder */}
              <div className="chapter-info-section">
                <h3>Chapter Information</h3>
                <p>This is chapter {activeChapterIndex + 1} of the course "{course.title}".</p>
                <p>Additional chapter content would be displayed here, including text, images, videos, etc.</p>
              </div>

              <div className="chapter-navigation">
                {activeChapterIndex > 0 && (
                  <button 
                    className="btn btn-outline-primary"
                    onClick={() => handleChapterClick(activeChapterIndex - 1)}
                  >
                    <i className="bi bi-arrow-left me-2"></i>
                    Previous Chapter
                  </button>
                )}
                
                {activeChapterIndex < chapters.length - 1 && (
                  <button 
                    className="btn btn-primary"
                    onClick={() => handleChapterClick(activeChapterIndex + 1)}
                  >
                    Next Chapter
                    <i className="bi bi-arrow-right ms-2"></i>
                  </button>
                )}
              </div>
            </div>
            
            {showNotesPanel && (
              <div className="chapter-notes-panel">
                <div className="notes-panel-header">
                  <h3>
                    <i className="bi bi-pencil-square me-2"></i>
                    Course Notes
                  </h3>
                  <p className="text-muted mb-0">
                    <small><i className="bi bi-info-circle me-1"></i> These notes are shared across all chapters in this course</small>
                  </p>
                </div>
                
                <div className="notes-panel-content">
                  {notesError && (
                    <div className="alert alert-danger">
                      <i className="bi bi-exclamation-circle-fill me-2"></i>
                      {notesError}
                    </div>
                  )}
                  
                  {notesSaved && (
                    <div className="alert alert-success">
                      <i className="bi bi-check-circle-fill me-2"></i>
                      Notes saved successfully!
                    </div>
                  )}
                  
                  <textarea
                    className="notes-textarea"
                    placeholder="Take notes for this course here..."
                    value={notes}
                    onChange={handleNotesChange}
                  ></textarea>
                  
                  <div className="notes-actions">
                    <button 
                      className="btn btn-primary"
                      onClick={handleSaveNotes}
                      disabled={savingNotes}
                    >
                      {savingNotes ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-save me-2"></i>
                          Save Notes
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChapterView; 