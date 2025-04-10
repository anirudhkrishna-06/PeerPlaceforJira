import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import "../styles/StudentDashboard.css";

const API_URL = "http://localhost:5000";

function CourseDetails() {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('active'); // 'active' | 'completed'

  useEffect(() => {
    const fetchCourseData = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        if (!authToken) {
          navigate('/login');
          return;
        }

        setLoading(true);
        const response = await axios.get(`${API_URL}/api/courses/${courseId}/assignments`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        setCourse(response.data.course);
        setAssignments(response.data.assignments || []);
        setLoading(false);
      } catch (err) {
        console.error('Failed to load course:', err);
        setLoading(false);
      }
    };

    fetchCourseData();
  }, [courseId, navigate]);

  const filteredAssignments = assignments.filter(assignment => 
    filter === 'active' ? !assignment.completed : assignment.completed
  );

  const formatDate = (dateValue) => {
    if (!dateValue) return 'No due date';
    try {
      const date = new Date(dateValue);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
    } catch (e) {
      return 'Invalid date';
    }
  };

  if (loading) return <div className="loading-spinner">Loading course...</div>;

  return (
    <div className="course-details">
      <button onClick={() => navigate(-1)} className="back-btn">
        <i className="fas fa-arrow-left"></i> Back to Courses
      </button>

      <h1>{course?.courseName || 'Course Details'}</h1>
      
      <div className="filter-buttons">
        <button 
          className={filter === 'active' ? 'active' : ''}
          onClick={() => setFilter('active')}
        >
          Active Assignments
        </button>
        <button 
          className={filter === 'completed' ? 'active' : ''}
          onClick={() => setFilter('completed')}
        >
          Completed Assignments
        </button>
      </div>

      {filteredAssignments.length === 0 ? (
        <div className="empty-state">
          <i className="fas fa-tasks"></i>
          <p>No {filter} assignments found.</p>
        </div>
      ) : (
        <div className="assignments-grid">
          {filteredAssignments.map(assignment => (
            <div 
              key={assignment.assignmentId} 
              className="assignment-card"
              onClick={() => navigate(`/assignments/${assignment.assignmentId}`)}
            >
              <h3>{assignment.title}</h3>
              <p>Due: {formatDate(assignment.dueDate)}</p>
              <p>{assignment.completed ? '✅ Completed' : '🟡 Pending'}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CourseDetails;