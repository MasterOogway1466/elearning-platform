import React, { useState } from 'react';
import axios from 'axios';
import authHeader from '../../services/auth-header';

const CreateCourse = ({ onSuccess }) => {
  const [courseData, setCourseData] = useState({
    title: '',
    description: '',
    imageUrl: '',
    category: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
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
      const response = await axios.post(
        'http://localhost:8080/api/instructor/courses',
        courseData,
        { headers: authHeader() }
      );
      
      setSuccess(true);
      setCourseData({
        title: '',
        description: '',
        imageUrl: '',
        category: ''
      });
      
      if (onSuccess) {
        onSuccess(response.data);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create course');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-course-container">
      <h2>Create New Course</h2>
      
      {success && (
        <div className="alert alert-success">
          Course created successfully!
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
          <label htmlFor="imageUrl">Image URL</label>
          <input
            type="text"
            className="form-control"
            id="imageUrl"
            name="imageUrl"
            value={courseData.imageUrl}
            onChange={handleChange}
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
        
        <button 
          type="submit" 
          className="btn btn-primary"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Course'}
        </button>
      </form>
    </div>
  );
};

export default CreateCourse; 