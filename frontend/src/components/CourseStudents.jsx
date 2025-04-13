import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import "../styles/CourseStudents.css";

function CourseStudents() {
  const { courseId } = useParams();
  const [students, setStudents] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const res = await axios.get(`http://localhost:5000/api/course/${courseId}/students`, {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        setStudents(res.data.students);
      } catch (err) {
        console.error('Failed to fetch students:', err);
      }
    };
    fetchStudents();
  }, [courseId]);

  return (
    <div>
      <h2>Enrolled Students in {courseId}</h2>
      <div className="student-list">
        {students.map(student => (
          <div
            key={student.email}
            className="student-card"
            onClick={() => navigate(`/faculty/student/${student.email}`)}
          >
            <h4>{student.name}</h4>
            <p><strong>Roll Number:</strong> {student.id || 'N/A'}</p>
            <p>{student.email}</p>
            <p>{student.department}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default CourseStudents;
