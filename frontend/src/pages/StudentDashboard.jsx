import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/StudentDashboard.css';

const API_URL = 'http://localhost:5000';

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState(null);
  const [studentYear, setStudentYear] = useState(1); // default to 1
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const email = localStorage.getItem('email');
        const authToken = localStorage.getItem('authToken');

        if (!email || !authToken) {
          navigate('/login');
          return;
        }

        setLoading(true);

        const userResponse = await axios.get(`${API_URL}/api/userByMail/email`, {
          params: { email },
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        if (!userResponse.data) throw new Error('No user data received');
        setUserData(userResponse.data);
        setStudentYear(userResponse.data.year || 1); // Update year

        const coursesResponse = await axios.get(`${API_URL}/api/courses`, {
          params: { facultyId: userResponse.data.id },
          headers: {
            'Authorization': `Bearer ${authToken}`
          }
        });

        const rawCourses = coursesResponse.data || [];

        const coursesWithAssignments = await Promise.all(
          rawCourses.map(async (course) => {
            try {
              const assignmentResponse = await axios.get(`${API_URL}/api/course_assignments/${course.courseID}`, {
                headers: {
                  'Authorization': `Bearer ${authToken}`
                }
              });

              const assignmentList = assignmentResponse.data.assignments || [];

              return {
                ...course,
                assignments: assignmentList.map(a => ({
                  ...a,
                  courseID: course.courseID,
                  courseName: course.courseName || course.title || 'Unknown Course'
                }))
              };
            } catch (err) {
              console.error(`Error fetching assignments for course ${course.courseID}:`, err);
              return {
                ...course,
                assignments: []
              };
            }
          })
        );

        setCourses(coursesWithAssignments);

        setLoading(false);
      } catch (err) {
        console.error('Error fetching data:', err);
        setError(err.response?.data?.message || err.message || 'Failed to load data');
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const formatDate = (date) => {
    try {
      const d = typeof date === 'string' ? new Date(date) : date.toDate();
      return d.toLocaleDateString() + ' ' + d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return 'Invalid date';
    }
  };

  const getTimeRemaining = (dueDate) => {
    const now = new Date();
    const due = new Date(dueDate?.toDate ? dueDate.toDate() : dueDate);
    const diffMs = due - now;

    if (diffMs <= 0) return 'Past due';

    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMin = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${diffHrs} hr ${diffMin} min left`;
  };

  const handleAssignmentClick = (assignment) => {
    console.log(assignment.assignmentId);
    navigate(`/assignment/${assignment.assignmentId}`);
  };

  const handleAddQuestion = () => {
    navigate('/add-question');
  };

  if (loading) return <div className="loading">Loading dashboard...</div>;
  if (error) return <div className="error">{error}</div>;

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Welcome back, {userData?.name || 'Student'}!</h1>
        <div className="student-profile">
          <p><strong>Email:</strong> {userData?.email}</p>
          <p><strong>Year:</strong> {studentYear}</p>
        </div>

        {studentYear >= 4 && (
          <button className="add-question-btn" onClick={handleAddQuestion}>
            <i className="fas fa-plus-circle"></i> Add Question
          </button>
        )}
      </div>

      <div className="assignments-section">
        <div className="section-header">
          <h2><i className="fas fa-tasks"></i> Assignments</h2>
        </div>

        {courses.length === 0 ? (
          <div className="empty-state">
            <i className="fas fa-book-open"></i>
            <p>No courses found.</p>
          </div>
        ) : (
          <>
            <div className="courses-grid">
              {courses.map(course => (
                <div
                  key={course.courseID}
                  className={`course-card ${selectedCourseId === course.courseID ? 'selected' : ''}`}
                  onClick={() => setSelectedCourseId(course.courseID)}
                >
                  <div className="course-icon">
                    <i className="fas fa-book-reader"></i>
                  </div>
                  <h3>{course.courseName || course.title}</h3>
                  <div className="course-meta">
                    <span><i className="fas fa-id-card"></i> {course.courseID}</span>
                    {course.instructor && (
                      <span><i className="fas fa-chalkboard-teacher"></i> {course.instructor}</span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {selectedCourseId && (
              <div className="assignments-grid">
                {(courses.find(c => c.courseID === selectedCourseId)?.assignments || []).length === 0 ? (
                  <div className="empty-state">
                    <i className="fas fa-check-circle"></i>
                    <p>No active assignments for this course.</p>
                  </div>
                ) : (
                  courses
                    .find(c => c.courseID === selectedCourseId)
                    .assignments
                    .filter(a => !a.status || a.status === 'active')
                    .sort((a, b) => {
                      const dateA = a.dueDate?.toDate ? a.dueDate.toDate() : new Date(a.dueDate);
                      const dateB = b.dueDate?.toDate ? b.dueDate.toDate() : new Date(b.dueDate);
                      return dateA - dateB;
                    })
                    .map(assignment => {
                      const timeRemaining = getTimeRemaining(assignment.dueDate);
                      const isPastDue = timeRemaining === 'Past due';
                      const isDueSoon = !isPastDue && timeRemaining.includes('hr');

                      return (
                        <div
                          key={assignment.assignmentId}
                          className={`assignment-card ${isPastDue ? 'past-due' : ''} ${isDueSoon ? 'due-soon' : ''}`}
                          onClick={() => handleAssignmentClick(assignment)}
                        >
                          <div className="assignment-badge">
                            <i className={`fas ${isPastDue ? 'fa-exclamation-circle' : 'fa-clipboard-list'}`}></i>
                          </div>
                          <div className="assignment-content">
                            <h3>{assignment.title}</h3>
                            <div className="assignment-meta">
                              <span className="course-name">
                                <i className="fas fa-book"></i> {assignment.courseName}
                              </span>
                              <span className="due-date">
                                <i className="fas fa-calendar-day"></i> {formatDate(assignment.dueDate)}
                              </span>
                            </div>
                            <div className={`time-remaining ${isPastDue ? 'past-due-text' : ''}`}>
                              <i className={`fas ${isPastDue ? 'fa-clock' : 'fa-hourglass-half'}`}></i>
                              {timeRemaining}
                            </div>
                            {assignment.facultyName && (
                              <div className="faculty-info">
                                <i className="fas fa-user-tie"></i> {assignment.facultyName}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
