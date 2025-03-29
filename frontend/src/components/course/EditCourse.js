import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../../services/auth-header';
import '../../pages/Dashboard.css';

const EditCourse = ({ course, onSuccess, onCancel }) => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    pdfUrl: '',
    chapters: [''],
    category: '',
    courseType: 'STUDENT' // Default course type
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [imagePreview, setImagePreview] = useState('');

  // Load course data when component mounts or course changes
  useEffect(() => {
    if (course) {
      setCourseData({
        title: course.title || '',
        description: course.description || '',
        imageUrl: course.imageUrl || '',
        pdfUrl: course.pdfUrl || '',
        chapters: course.chapters && course.chapters.length > 0 ? [...course.chapters] : [''],
        category: course.category || '',
        courseType: course.courseType || 'STUDENT'
      });
      
      if (course.imageUrl) {
        setImagePreview(course.imageUrl);
      }
    }
  }, [course]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // Update image preview when imageUrl changes
    if (name === 'imageUrl' && value) {
      setImagePreview(value);
    }
    
    setCourseData({
      ...courseData,
      [name]: value
    });
  };

  const handleChapterChange = (index, value) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters[index] = value;
    setCourseData({
      ...courseData,
      chapters: updatedChapters
    });
  };

  const addChapter = () => {
    setCourseData({
      ...courseData,
      chapters: [...courseData.chapters, '']
    });
  };

  const removeChapter = (index) => {
    const updatedChapters = [...courseData.chapters];
    updatedChapters.splice(index, 1);
    setCourseData({
      ...courseData,
      chapters: updatedChapters.length ? updatedChapters : ['']  // Always keep at least one chapter field
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Filter out empty chapters
    const filteredChapters = courseData.chapters.filter(chapter => chapter.trim() !== '');
    
    // Ensure there's at least one chapter
    if (filteredChapters.length === 0) {
      filteredChapters.push("Chapter 1"); // Add a default chapter if all are empty
    }
    
    // Validate required fields before sending
    if (!courseData.title || courseData.title.trim().length < 3) {
      setError('Title is required and must be at least 3 characters');
      setLoading(false);
      return;
    }
    
    if (!courseData.description || courseData.description.trim().length < 10) {
      setError('Description is required and must be at least 10 characters');
      setLoading(false);
      return;
    }
    
    if (!courseData.category || courseData.category.trim() === '') {
      setError('Category is required');
      setLoading(false);
      return;
    }
    
    if (!courseData.courseType) {
      setError('Course type is required');
      setLoading(false);
      return;
    }
    
    const dataToSend = {
      ...courseData,
      chapters: filteredChapters
    };
    
    // Debug logging
    console.log('Course being edited:', course);
    console.log('Course ID:', course.id);
    console.log('Course data being sent:', dataToSend);
    console.log('Title:', dataToSend.title, 'Length:', dataToSend.title?.length);
    console.log('Description:', dataToSend.description, 'Length:', dataToSend.description?.length);
    console.log('Category:', dataToSend.category);
    console.log('Course Type:', dataToSend.courseType);
    console.log('Chapters:', dataToSend.chapters);
    
    try {
      // Use the simpler update endpoint to avoid validation issues
      const response = await axios.post(
        `http://localhost:8080/api/instructor/courses/${course.id}/simple-update`,
        dataToSend,
        { headers: authHeader() }
      );
      
      console.log('Response from server:', response.data);
      
      setSuccess(true);
      
      // Call the onSuccess callback with the updated course
      if (onSuccess) {
        onSuccess(response.data);
      }
      
      // Show success message for 2 seconds, then call onCancel
      setTimeout(() => {
        if (onCancel) {
          onCancel();
        }
      }, 2000);
      
    } catch (err) {
      console.error('Error updating course:', err);
      console.error('Error response:', err.response?.data);
      
      // Extract detailed error message
      let errorMessage = 'Failed to update course';
      if (err.response?.data) {
        if (typeof err.response.data === 'string') {
          errorMessage = err.response.data;
        } else if (err.response.data.message) {
          errorMessage = err.response.data.message;
        } else if (err.response.data.error) {
          // If we have detailed validation errors
          if (err.response.data.details) {
            const details = err.response.data.details;
            errorMessage = 'Validation errors: ' + 
              Object.keys(details).map(key => `${key}: ${details[key]}`).join(', ');
          } else {
            errorMessage = err.response.data.error;
          }
        }
      }
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course-container">
      <h2>Edit Course</h2>
      
      {success && (
        <div className="alert alert-success">
          Course updated successfully!
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger">
          <i className="bi bi-exclamation-circle-fill me-2"></i>
          {error}
        </div>
      )}
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Course Title</label>
          <input
            type="text"
            className="form-control"
            id="title"
            name="title"
            value={courseData.title}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            className="form-control"
            id="description"
            name="description"
            rows="4"
            value={courseData.description}
            onChange={handleChange}
            required
          />
        </div>
        
        <div className="form-group">
          <label htmlFor="category">Category</label>
          <select
            className="form-control"
            id="category"
            name="category"
            value={courseData.category}
            onChange={handleChange}
            required
          >
            <option value="">Select a category</option>
            <option value="Programming">Programming</option>
            <option value="Data Science">Data Science</option>
            <option value="Web Development">Web Development</option>
            <option value="Design">Design</option>
            <option value="Business">Business</option>
            <option value="Marketing">Marketing</option>
            <option value="Finance">Finance</option>
            <option value="Other">Other</option>
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="courseType">Course Type</label>
          <select
            className="form-control"
            id="courseType"
            name="courseType"
            value={courseData.courseType}
            onChange={handleChange}
            required
          >
            <option value="STUDENT">Student</option>
            <option value="PROFESSIONAL">Professional</option>
            <option value="PLACEMENT_TRAINING">Placement Training</option>
          </select>
        </div>
        
        <div className="form-group">
          <label htmlFor="imageUrl">Image URL</label>
          <input
            type="text"
            className="form-control"
            id="imageUrl"
            name="imageUrl"
            value={courseData.imageUrl}
            onChange={handleChange}
            placeholder="Enter image URL"
          />
          
          {/* Image preview */}
          {imagePreview && (
            <div className="image-preview mt-3">
              <label>Image Preview:</label>
              <img 
                src={imagePreview} 
                alt="Course preview" 
                style={{ maxWidth: '100%', maxHeight: '200px', display: 'block', marginTop: '10px', border: '1px solid #ddd', borderRadius: '4px', padding: '5px' }} 
              />
            </div>
          )}
        </div>
        
        <div className="form-group">
          <label htmlFor="pdfUrl">Course PDF URL (Optional)</label>
          <input
            type="text"
            className="form-control"
            id="pdfUrl"
            name="pdfUrl"
            value={courseData.pdfUrl}
            onChange={handleChange}
            placeholder="Link to PDF file"
          />
        </div>
        
        <div className="form-group">
          <label>Chapter Names</label>
          {courseData.chapters.map((chapter, index) => (
            <div key={index} className="chapter-input-group">
              <input
                type="text"
                className="form-control"
                placeholder={`Chapter ${index + 1}`}
                value={chapter}
                onChange={(e) => handleChapterChange(index, e.target.value)}
              />
              <button
                type="button"
                className="btn btn-danger"
                onClick={() => removeChapter(index)}
                disabled={courseData.chapters.length === 1}
              >
                <i className="bi bi-trash me-1"></i>
                Delete
              </button>
            </div>
          ))}
          <button
            type="button"
            className="btn-add-chapter"
            onClick={addChapter}
          >
            <i className="bi bi-plus-circle me-2"></i>
            Add Another Chapter
          </button>
        </div>
        
        <div className="form-group d-flex justify-content-between mt-4">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
          >
            <i className="bi bi-x-circle me-2"></i>
            Cancel
          </button>
          <button 
            type="submit" 
            className="submit-button"
            disabled={loading}
          >
            {loading ? (
              <>
                <i className="bi bi-hourglass-split me-2"></i>
                Updating Course...
              </>
            ) : (
              <>
                <i className="bi bi-check-circle me-2"></i>
                Update Course
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourse; 