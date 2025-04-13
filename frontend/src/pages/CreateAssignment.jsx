import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/CreateAssignment.css';
import { selectQuestionsWithPriority } from '../utils/priorityQueue'; // Adjust path as needed

const API_URL = "http://localhost:5000";

function CreateAssignment() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    courseId: '',
    dueDate: '',
    dueTime: '',
    attachments: []
  });
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [facultyInfo, setFacultyInfo] = useState(null);
  const [questionCounts, setQuestionCounts] = useState({ easy: 0, medium: 0, hard: 0 });
  const [allQuestions, setAllQuestions] = useState([]);
  const [finalSelectedQuestionIds, setFinalSelectedQuestionIds] = useState([]);

  useEffect(() => {
    const loadFacultyInfo = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const facultyId = localStorage.getItem('uid');

        if (!authToken || !facultyId) {
          throw new Error('Authentication required');
        }

        const response = await axios.get(`${API_URL}/api/userByMail/email`, {
          params: { email: localStorage.getItem('email') },
          headers: { 'Authorization': `Bearer ${authToken}` }
        });

        setFacultyInfo(response.data);
      } catch (err) {
        console.error('Error loading faculty info:', err);
      }
    };

    const fetchAllQuestions = async () => {
      try {
        const authToken = localStorage.getItem('authToken');
        const response = await axios.get(`${API_URL}/api/questionbank`, {
          headers: { 'Authorization': `Bearer ${authToken}` }
        });
        setAllQuestions(response.data);
      } catch (err) {
        console.error('Error fetching question bank:', err);
      }
    };

    loadFacultyInfo();
    fetchAllQuestions();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({
      ...prev,
      attachments: Array.from(e.target.files)
    }));
  };

  const generateRandomTest = () => {
    const grouped = {
      easy: allQuestions.filter(q => q.level === 'easy'),
      medium: allQuestions.filter(q => q.level === 'medium'),
      hard: allQuestions.filter(q => q.level === 'hard')
    };

    const selectedQuestions = [];
    let anyError = false;

    ['easy', 'medium', 'hard'].forEach(level => {
      const available = grouped[level];
      const count = questionCounts[level];

      if (count > available.length) {
        setError(`Maximum possible number of ${level} questions is ${available.length}`);
        anyError = true;
        return;
      }
      const levelSelected = selectQuestionsWithPriority(formData.courseId, available, count);

      // Mark selected questions locally as assigned to this course
      /*levelSelected.forEach(q => {
        if (!q.assignedTo) q.assignedTo = [];
        if (!q.assignedTo.includes(formData.courseId)) {
          q.assignedTo.push(formData.courseId);
        }
      });*/
    
      selectedQuestions.push(...levelSelected);
    });
    
    if (anyError) return;

    const newDescription = selectedQuestions
  .map((q, idx) =>
    `${idx + 1}. ${q.name} (${q.level}, ${q.company})\n${q.description}\nReference: ${q.reference || 'N/A'}`
  )
  .join('\n\n');
    setFormData(prev => ({ ...prev, description: newDescription }));
    setFinalSelectedQuestionIds(selectedQuestions.map(q => q.id));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    try {
      const authToken = localStorage.getItem('authToken');
      const facultyId = localStorage.getItem('uid');

      if (!authToken || !facultyId || !facultyInfo) {
        throw new Error('Authentication required');
      }

      const dueDateTime = new Date(`${formData.dueDate}T${formData.dueTime}`);

      const formPayload = new FormData();
      formPayload.append('title', formData.title);
      formPayload.append('courseId', formData.courseId.trim());
      formPayload.append('dueDate', dueDateTime.toISOString());
      formPayload.append('facultyId', facultyId);
      formPayload.append('facultyName', facultyInfo.name);
      formPayload.append('description', formData.description || '');

      formData.attachments.forEach(file => {
        formPayload.append('attachments', file);
      });
  //     const questionIds = allQuestions
  // .filter(q => q.assignedTo?.includes(formData.courseId))
  // .map(q => q.id);

  if (finalSelectedQuestionIds.length > 0) {
    try {
      await axios.post(`${API_URL}/api/questionbank/assign`, {
        courseId: formData.courseId,
        questionIds: finalSelectedQuestionIds,
        allQuestions
      }, {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
    } catch (assignErr) {
      console.error("Warning: Couldn't update assignedTo field:", assignErr);
    }
  }
      const response = await axios.post(`${API_URL}/api/assignments`, formPayload, {
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'multipart/form-data'
        },
        timeout: 10000
      });

      if (response.data) {
        navigate('/facultydashboard', {
          state: {
            success: 'Assignment created successfully!',
            assignmentId: response.data.assignmentId
          }
        });
      }
    } catch (err) {
      console.error('Error creating assignment:', err);
      if (err.response?.data?.error === "Course not found") {
        setError(`Course "${formData.courseId}" does not exist`);
      } else if (err.code === 'ECONNABORTED') {
        setError('Request timed out. Please try again.');
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to create assignment');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="create-assignment-container">
      <h1>Create New Assignment</h1>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} className="assignment-form">
        <div className="form-group">
          <label htmlFor="title">Assignment Title*</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
          />
        </div>

        <div className="form-group">
  <label htmlFor="courseId">Course ID*</label>
  <select
    id="courseId"
    name="courseId"
    value={formData.courseId}
    onChange={handleChange}
    required
  >
    <option value="">-- Select Course --</option>
    {facultyInfo?.courses?.map((course, idx) => (
      <option key={idx} value={course}>{course}</option>
    ))}
  </select>
</div>


        <div className="form-row">
          <div className="form-group">
            <label htmlFor="dueDate">Due Date*</label>
            <input
              type="date"
              id="dueDate"
              name="dueDate"
              value={formData.dueDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
            />
          </div>

          <div className="form-group">
            <label htmlFor="dueTime">Due Time*</label>
            <input
              type="time"
              id="dueTime"
              name="dueTime"
              value={formData.dueTime}
              onChange={handleChange}
              required
            />
          </div>
        </div>
{/*        <div className="form-group">
          <label htmlFor="attachments">Attachments</label>
          <input
            type="file"
            id="attachments"
            name="attachments"
            onChange={handleFileChange}
            multiple
          />
        </div>*/}

        <div className="form-group">
          <label>Generate Random Test</label>
          <div className="form-row">
            <input
              type="number"
              placeholder="Easy"
              value={questionCounts.easy}
              onChange={e => setQuestionCounts(prev => ({ ...prev, easy: parseInt(e.target.value || 0) }))}
            />
            <input
              type="number"
              placeholder="Medium"
              value={questionCounts.medium}
              onChange={e => setQuestionCounts(prev => ({ ...prev, medium: parseInt(e.target.value || 0) }))}
            />
            <input
              type="number"
              placeholder="Hard"
              value={questionCounts.hard}
              onChange={e => setQuestionCounts(prev => ({ ...prev, hard: parseInt(e.target.value || 0) }))}
            />
            <button type="button" onClick={generateRandomTest}>
              Generate
            </button>
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="cancel-btn"
            onClick={() => navigate('/facultydashboard')}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Creating...' : 'Create Assignment'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAssignment;
