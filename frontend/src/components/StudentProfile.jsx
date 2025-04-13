import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const API_URL = 'http://localhost:5000';

const styles = {
  container: {
    maxWidth: '900px',
    margin: '40px auto',
    padding: '30px',
    backgroundColor: '#fff',
    borderRadius: '16px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
    color: '#2c3e50'
  },
  heading: {
    fontSize: '2rem',
    marginBottom: '10px'
  },
  info: {
    fontSize: '1rem',
    margin: '6px 0',
    color: '#555'
  },
  sectionTitle: {
    marginTop: '30px',
    marginBottom: '10px',
    fontSize: '1.5rem',
    color: '#34495e'
  },
  table: {
    width: '100%',
    borderCollapse: 'collapse',
    marginTop: '15px'
  },
  th: {
    backgroundColor: '#f5f5f5',
    fontWeight: 'bold',
    padding: '12px 15px',
    textAlign: 'left',
    color: '#2c3e50',
    border: '1px solid #ddd'
  },
  td: {
    padding: '12px 15px',
    border: '1px solid #ddd',
    fontSize: '0.95rem'
  },
  rowAlt: {
    backgroundColor: '#fafafa'
  }
};

function StudentProfile() {
  const { studentEmail } = useParams();
  const [studentData, setStudentData] = useState(null);
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/api/student/${studentEmail}/profile`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });

        setStudentData(response.data.studentData);
        setSubmissions(response.data.assignmentSubmissions);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch student profile:', error);
        setLoading(false);
      }
    };

    fetchStudentProfile();
  }, [studentEmail]);

  if (loading) return <div style={styles.container}>Loading profile...</div>;
  if (!studentData) return <div style={styles.container}>Student not found.</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.heading}>{studentData.name}'s Profile</h2>
      <p style={styles.info}><strong>Email:</strong> {studentData.email}</p>
      <p style={styles.info}><strong>Year:</strong> {studentData.year || 'N/A'}</p>
      <p style={styles.info}><strong>Department:</strong> {studentData.department || 'N/A'}</p>

      <h3 style={styles.sectionTitle}>Assignment Submissions</h3>
      {submissions.length > 0 ? (
        <table style={styles.table}>
          <thead>
            <tr>
              <th style={styles.th}>Assignment Title</th>
              <th style={styles.th}>Score</th>
              <th style={styles.th}>Remarks</th>
              <th style={styles.th}>Submitted At</th>
            </tr>
          </thead>
          <tbody>
            {submissions.map((item, index) => (
              <tr key={index} style={index % 2 === 0 ? styles.rowAlt : {}}>
                <td style={styles.td}>Title: {item.assignmentTitle}</td>
                <td style={styles.td}>Score: {item.score ?? 'Not Scored'}</td>
                <td style={styles.td}>Remarks: {item.remarks || '—'}</td>
                <td style={styles.td}>
  Date: {
    item.submittedAt && item.submittedAt.toDate
      ? item.submittedAt.toDate().toLocaleString()
      : item.submittedAt
        ? new Date(item.submittedAt).toLocaleString()
        : 'Not submitted'
  }
</td>

              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p style={styles.info}>No assignments submitted yet.</p>
      )}
    </div>
  );
}

export default StudentProfile;
