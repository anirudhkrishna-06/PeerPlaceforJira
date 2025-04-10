import React, { useEffect, useState } from 'react';
import axios from 'axios';
import "../styles/QuestionBank.css";

const API_URL = "http://localhost:5000";

const QuestionBank = () => {
  const [questions, setQuestions] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const authToken = localStorage.getItem('authToken');

    axios.get(`${API_URL}/api/questionbank`, {
      headers: {
        'Authorization': `Bearer ${authToken}`
      }
    })
    .then(res => setQuestions(res.data))
    .catch(err => setError(err.response?.data?.message || 'Error fetching questions'));
  }, []);

  const grouped = {
    Easy: questions.filter(q => q.level?.toLowerCase() === "easy"),
    Medium: questions.filter(q => q.level?.toLowerCase() === "medium"),
    Hard: questions.filter(q => q.level?.toLowerCase() === "hard"),
  };

  return (
    <div className="question-bank-page">
      <h2>Question Bank</h2>
      {error ? (
        <p className="error-text">{error}</p>
      ) : (
        ["Easy", "Medium", "Hard"].map(level => (
          <div key={level} className="difficulty-group">
            <h3>{level} Questions</h3>
            <ul>
              {grouped[level].map(q => (
                <li key={q.id || q._id} className="question-item">
                  <p><strong>Question: </strong> {q.name || "N/A"}</p>
                  <p><strong>Created By:</strong> {q.createdBy || "N/A"}</p>
                  <p><strong>Description:</strong> {q.description || "No description provided"}</p>
                  <p><strong>Level:</strong> {q.level}</p>
                  {q.company && <p><strong>Company:</strong> {q.company}</p>}
                  {q.reference && <p><strong>Reference:</strong> {q.reference}</p>}
                  {q.approach && <p><strong>Approach:</strong> {q.approach}</p>}
                  {q.remarks && <p><strong>Remarks:</strong> {q.remarks}</p>}
                </li>
              ))}
            </ul>
          </div>
        ))
      )}
    </div>
  );
};

export default QuestionBank;
