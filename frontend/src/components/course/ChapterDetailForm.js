import React, { useState } from 'react';
import './CourseStyles.css';

const ChapterDetailForm = ({ chapterName, initialData, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || chapterName || '',
    content: initialData?.content || '',
    objectives: initialData?.objectives || '',
    resources: initialData?.resources || ''
  });
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };
  
  return (
    <div className="chapter-detail-form-container">
      <div className="form-header">
        <h3>
          <i className="bi bi-book me-2"></i>
          Chapter Details: {chapterName}
        </h3>
        <button 
          type="button" 
          className="btn btn-outline-secondary"
          onClick={onCancel}
        >
          <i className="bi bi-x-circle me-1"></i>
          Cancel
        </button>
      </div>
      
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="content">Chapter Content</label>
          <textarea
            className="form-control"
            id="content"
            name="content"
            rows="8"
            value={formData.content}
            onChange={handleChange}
            placeholder="Enter the main content for this chapter. You can use HTML tags for formatting."
          />
          <small className="form-text text-muted">
            You can use basic HTML tags for formatting: &lt;h1&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;a&gt;, etc.
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="objectives">Learning Objectives</label>
          <textarea
            className="form-control"
            id="objectives"
            name="objectives"
            rows="4"
            value={formData.objectives}
            onChange={handleChange}
            placeholder="List the learning objectives for this chapter. What should students learn?"
          />
          <small className="form-text text-muted">
            Consider using bullet points with &lt;ul&gt; and &lt;li&gt; tags to list objectives.
          </small>
        </div>
        
        <div className="form-group">
          <label htmlFor="resources">Additional Resources</label>
          <textarea
            className="form-control"
            id="resources"
            name="resources"
            rows="4"
            value={formData.resources}
            onChange={handleChange}
            placeholder="List additional resources like links, books, or references for this chapter."
          />
          <small className="form-text text-muted">
            Include links using &lt;a href="url"&gt;link text&lt;/a&gt; tags.
          </small>
        </div>
        
        <div className="form-actions">
          <button type="submit" className="btn btn-primary">
            <i className="bi bi-save me-1"></i>
            Save Chapter Details
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChapterDetailForm; 