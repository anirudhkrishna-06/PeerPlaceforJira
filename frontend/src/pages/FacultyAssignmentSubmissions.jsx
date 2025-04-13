import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom';
import '../styles/FacultyAssignmentSubmissions.css';

const API_URL = 'http://localhost:5000';

function FacultyAssignmentSubmissions() {
  const { assignmentId } = useParams();
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/api/submissions/byAssignment/${assignmentId}`, {
          headers: {
            Authorization: `Bearer ${authToken}`
          }
        });
        setSubmissions(response.data.submissions);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching submissions by assignment:', err);
        setError('Failed to load submissions.');
        setLoading(false);
      }
    };
    fetchSubmissions();
  }, [assignmentId]);

  const handleScoreChange = (index, value) => {
    const updated = [...submissions];
    updated[index].score = value;
    setSubmissions(updated);
  };

  const handleRemarksChange = (index, value) => {
    const updated = [...submissions];
    updated[index].remarks = value;
    setSubmissions(updated);
  };

  const saveScore = async (index) => {
    const { studentEmail, score, remarks } = submissions[index];
    const payload = {
      assignmentId,
      studentEmail,
      score,
      remarks
    };
  
    console.log("Sending score update payload:", payload);
  
    try {
      const authToken = localStorage.getItem('authToken');
      const response = await axios.post(`${API_URL}/api/updateScore`, payload, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      console.log("Score update success:", response.data);
      alert('Score saved successfully!');
      
    } catch (err) {
      console.error('Error saving score:', err.response?.data || err.message);
      alert('Failed to save score.');
    }
  };
  
  if (loading) return <div>Loading submissions...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div className="faculty-submissions">
      <h2>Assignment Submissions</h2>
      <table>
        <thead>
          <tr>
            <th>Student Name</th>
            <th>Email</th>
            <th>Submission</th>
            <th>Submitted At</th>
            <th>Score</th>
            <th>Remarks</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
  {submissions.map((submission, index) => (
    <tr key={index}>
      
      {/*<td data-label="Student Name">{submission.name || 'N/A'}</td>*/}
      <td data-label="Name">{submission.studentEmail.split('@')[0]}</td>

      <td data-label="Email">{submission.studentEmail}</td>
      <td data-label="Submission">{submission.answer}</td>
      {/*<td data-label="Submitted At">{new Date(submission.submittedAt).toLocaleString()}</td>*/}
      <td data-label="Score">
        <input
          type="number"
          value={submission.score || ''}
          onChange={(e) => handleScoreChange(index, e.target.value)}
        />
      </td>
      <td data-label="Remarks">
        <textarea
          value={submission.remarks || ''}
          onChange={(e) => handleRemarksChange(index, e.target.value)}
        />
      </td>
      <td data-label="Actions">
        <button onClick={() => saveScore(index)}>Save Score</button>
      </td>
    </tr>
  ))}
</tbody>

      </table>
    </div>
  );
}

export default FacultyAssignmentSubmissions;