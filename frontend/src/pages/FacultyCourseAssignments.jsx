import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CourseAssignments.css';


const API_URL = 'http://localhost:5000';

const FacultyCourseAssignments = () => {
  const { courseID } = useParams();
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const authToken = localStorage.getItem('authToken');

        const res = await axios.get(`${API_URL}/api/course_assignments/${courseID}`, {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });

        const data = res.data.assignments || [];

        const formattedAssignments = data.map((assignment) => {
          const dueDate = assignment.dueDate?.seconds
            ? new Date(assignment.dueDate.seconds * 1000)
            : new Date(assignment.dueDate);

          const formattedDueDate = !isNaN(dueDate.getTime()) ? dueDate.toLocaleString() : 'No due date';

          return {
            ...assignment,
            dueDate: formattedDueDate,
            submissionsCount: assignment.submissions ? Object.keys(assignment.submissions).length : 0,
          };
        });

        setAssignments(formattedAssignments);
        setLoading(false);
      } catch (err) {
        console.error('Error loading assignments:', err);
        setError('Failed to load assignments');
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [courseID]);

  

  const handleAssignmentClick = (assignmentId) => {
    navigate(`/faculty-assignment/${assignmentId}`);
  };
  

  if (loading) return <div>Loading assignments...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="faculty-course-assignments">
      <h2>Assignments for Course ID: {courseID}</h2>
      <div className="assignment-list">
        {assignments.map((assignment) => (
          <div
            key={assignment.assignmentId}
            className="assignment-card"
            onClick={() => handleAssignmentClick(assignment.assignmentId)}>
          >
            <h3>{assignment.title}</h3>
            <p><strong>Due:</strong> {assignment.dueDate}</p>
            <p><strong>Submissions:</strong> {assignment.submissionsCount}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FacultyCourseAssignments;
