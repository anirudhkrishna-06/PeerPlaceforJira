import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import "../styles/FacultyDashboard.css";

const API_URL = "http://localhost:5000"; 

function FacultyDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [courses, setCourses] = useState([]);
  const [pendingSubmissions, setPendingSubmissions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem('email');
    const authToken = localStorage.getItem('authToken');

    if (!email || !authToken) {
      navigate('/login');
      return;
    }

    const fetchFacultyData = async () => {
      try {
        const userResponse = await axios.get(`${API_URL}/api/userByMail/email`, {
          params: { email },
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        setUserData(userResponse.data);

        const coursesResponse = await axios.get(`${API_URL}/api/courses`, {
          params: { facultyId: userResponse.data.id },
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        setCourses(coursesResponse.data);

        const submissionsResponse = await axios.get(`${API_URL}/api/submissions/pending`, {
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });
        setPendingSubmissions(submissionsResponse.data);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching faculty data:', err);
        setError(err.response?.data?.message || 'Failed to fetch faculty data');
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('uid');
    localStorage.removeItem('email');
    navigate('/login');
  };

  const handleCreateAssignment = () => {
    navigate('/create-assignment');
  };

  const handleEvaluateSubmission = (submissionId) => {
    navigate(`/evaluate-submission/${submissionId}`);
  };

  if (loading) {
    return <div className="loading-container">Loading faculty dashboard...</div>;
  }

  if (error) {
    return (
      <div className="error-container">
        <p>Error: {error}</p>
        <button onClick={handleLogout} className="logout-btn">Return to Login</button>
      </div>
    );
  }

  return (
    <div className="faculty-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, Professor {userData.name || 'Faculty'}!</h1>
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>

      <div className="section profile-section">
        <h2>Your Profile</h2>
        <div className="detail-grid">
          <div className="detail-item"><strong>Name:</strong> {userData.name}</div>
          <div className="detail-item"><strong>Email:</strong> {userData.email}</div>
          <div className="detail-item"><strong>Role:</strong> {userData.role}</div>
          {userData.department && (
            <div className="detail-item"><strong>Department:</strong> {userData.department}</div>
          )}
        </div>
      </div>

      <div className="section action-section">
        <h2>Quick Actions</h2>
        <div className="card-grid">
          <div className="action-card clickable" onClick={handleCreateAssignment}>
            <h3>Create New Assignment</h3>
          </div>
          <div className="action-card clickable" onClick={() => navigate('/question-bank')}>
            <h3>View Question Bank</h3>
          </div>
        </div>
      </div>

      <div className="section courses-section">
        <h2>Your Courses</h2>
        {courses.length > 0 ? (
          <div className="faculty-course-grid">
            {courses.map(course => (
              <div key={course.courseID} className="faculty-course-card">
                <h4>{course.courseName}</h4>
                <p><strong>Course ID:</strong> {course.courseID}</p>
                <p><strong>Department:</strong> {course.department || 'Information Technology'}</p>
                <p><strong>Enrolled Students:</strong> {course.studentCount || 0}</p>
                <div className="faculty-course-actions">
                  <button
                    onClick={() => navigate(`/faculty-course-assignments/${course.courseID}`, {
                      state: {
                        courseName: course.courseName,
                        assignments: course.assignments || [],
                      },
                    })}
                  >
                    View Assignments
                  </button>
                  <button onClick={() => navigate(`/faculty/course/${course.courseID}/students`)}>
                    View Students
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p>No courses assigned</p>
        )}
      </div>
    </div>
  );
}

export default FacultyDashboard;
