import React, { useState, useEffect } from 'react';
import axios from 'axios';
import authHeader from '../../services/auth-header';

const EnrolledStudents = ({ courseId }) => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchEnrolledStudents = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8080/api/instructor/courses/${courseId}/students`,
          { headers: authHeader() }
        );
        setStudents(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to load enrolled students. Please try again later.');
        console.error(err);
        setLoading(false);
      }
    };

    if (courseId) {
      fetchEnrolledStudents();
    }
  }, [courseId]);

  if (loading) {
    return <div>Loading enrolled students...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>;
  }

  if (students.length === 0) {
    return (
      <div className="alert alert-info">
        No students have enrolled in this course yet.
      </div>
    );
  }

  return (
    <div className="enrolled-students">
      <h3>Enrolled Students</h3>
      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Enrolled On</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => (
              <tr key={student.id}>
                <td>{student.fullName}</td>
                <td>
                  <a href={`mailto:${student.email}`}>{student.email}</a>
                </td>
                <td>
                  {student.phoneNumber ? (
                    <a href={`tel:${student.phoneNumber}`}>{student.phoneNumber}</a>
                  ) : (
                    'Not provided'
                  )}
                </td>
                <td>
                  {new Date(student.enrolledAt).toLocaleDateString(undefined, {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric'
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default EnrolledStudents; 