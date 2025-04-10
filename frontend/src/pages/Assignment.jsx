import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Assignment.css';

const API_URL = 'http://localhost:5000';

const Assignment = () => {
  const { assignmentId } = useParams();
  const [assignment, setAssignment] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submissionText, setSubmissionText] = useState('');
  const [message, setMessage] = useState('');

  const email = localStorage.getItem('email');
  const authToken = localStorage.getItem('authToken');

  useEffect(() => {
    const fetchAssignmentAndSubmission = async () => {
      try {
        const res = await axios.get(`${API_URL}/api/assignments/${assignmentId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        const data = res.data;
        const formatted = {
          ...data,
          dueDate: data.dueDate?.seconds
            ? new Date(data.dueDate.seconds * 1000)
            : new Date(data.dueDate),
          createdAt: data.createdAt?.seconds
            ? new Date(data.createdAt.seconds * 1000)
            : new Date(data.createdAt),
        };
        setAssignment(formatted);

        const subRes = await axios.get(`${API_URL}/api/submissions/student`, {
          params: {
            assignmentId,
            studentEmail: email,
          },
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (subRes.status === 200) {
          setSubmission(subRes.data.submission);
        }
      } catch (err) {
        if (err.response?.status === 404) {
          // No submission found — okay
        } else {
          console.error('Error loading assignment or submission:', err);
          setMessage('Failed to load assignment.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentAndSubmission();
  }, [assignmentId, email, authToken]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!submissionText.trim()) return setMessage('Please enter your answer.');

    try {
      await axios.post(`${API_URL}/api/submitAssignment`, {
        assignmentId,
        studentEmail: email,
        answer: submissionText,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      setMessage('Submitted successfully!');
      setSubmission({ answer: submissionText, score: 0, submittedAt: new Date() });
      setSubmissionText('');
    } catch (error) {
      console.error('Submission error:', error);
      setMessage('Submission failed.');
    }
  };

  if (loading) return <div>Loading assignment...</div>;
  if (!assignment) return <div>{message || 'Assignment not found'}</div>;

  return (
    <div className="assignment-detail">
      <h1>{assignment.title}</h1>
      <p><strong>Course:</strong> {assignment.courseName || 'N/A'}</p>
      <p><strong>Instructor:</strong> {assignment.facultyName}</p>
      <p><strong>Due:</strong> {assignment.dueDate.toLocaleString()}</p>
      <p><strong>Status:</strong> {assignment.status}</p>
      <hr />
      <h3>Description</h3>
      <pre className="assignment-description">{assignment.description}</pre>

      {assignment.attachments?.length > 0 && (
        <div>
          <h4>Attachments:</h4>
          <ul>
            {assignment.attachments.map((url, idx) => (
              <li key={idx}>
                <a href={url} target="_blank" rel="noopener noreferrer">
                  Attachment {idx + 1}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      <hr />

      {submission ? (
        <div className="submission-box">
          <h4>Your Submission:</h4>
          <pre>{submission.answer}</pre>
          <p><strong>Submitted At:</strong> {new Date(submission.submittedAt?.seconds ? submission.submittedAt.seconds * 1000 : submission.submittedAt).toLocaleString()}</p>
          <p><strong>Score:</strong> {submission.score}</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="submission-form">
          <label htmlFor="answer">Your Answer:</label>
          <textarea
            id="answer"
            value={submissionText}
            onChange={(e) => setSubmissionText(e.target.value)}
            rows="6"
            placeholder="Type your answer here..."
            required
          />
          <button type="submit">Submit</button>
        </form>
      )}

      {message && <p className="status-message">{message}</p>}
    </div>
  );
};

export default Assignment;
