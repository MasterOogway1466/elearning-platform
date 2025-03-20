import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../../services/auth-header';

const EditCourse = ({ course, onSuccess, onCancel }) => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: ''
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
        category: course.category || ''
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Update course data
      const response = await axios.put(
        `http://localhost:8080/api/instructor/courses/${course.id}`,
        courseData,
        { headers: authHeader() }
      );
      
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
      setError(err.response?.data?.message || 'Failed to update course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-course-container">
      <h2>Edit Course</h2>
      
      {success && (
        <div className="alert alert-success">
          Course updated successfully!
        </div>
      )}
      
      {error && (
        <div className="alert alert-danger">
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
        
        <div className="form-group d-flex justify-content-between mt-4">
          <button 
            type="button" 
            className="btn btn-secondary"
            onClick={onCancel}
          >
            Cancel
          </button>
          <button 
            type="submit" 
            className="btn btn-primary"
            disabled={loading}
          >
            {loading ? 'Updating...' : 'Update Course'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditCourse; 