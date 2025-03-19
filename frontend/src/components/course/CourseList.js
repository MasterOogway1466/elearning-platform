import React from 'react';
import { Link } from 'react-router-dom';

const CourseList = ({ courses, onEnroll, showEnrollButton = false }) => {
  if (!courses || courses.length === 0) {
    return (
      <div className="courses-empty">
        <h3>No courses available</h3>
        <p>There are currently no courses available to display.</p>
      </div>
    );
  }

  return (
    <div className="courses-container">
      <div className="courses-grid">
        {courses.map(course => (
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
                {showEnrollButton && (
                  <button
                    onClick={() => onEnroll(course.id)}
                    className="btn btn-success"
                  >
                    Enroll Now
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CourseList; 