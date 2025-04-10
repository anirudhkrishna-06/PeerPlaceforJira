import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AddQuestion.css';
const AddQuestion = () => {
  const [formData, setFormData] = useState({
    name: '',
    level: 'easy',
    description: '',
    reference: '',
    company: '',
    approach: '',
    remarks: '',
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const email = localStorage.getItem('email');
    const authToken = localStorage.getItem('authToken');

    try {
      await axios.post('http://localhost:5000/api/questionbank', {
        ...formData,
        createdBy: email,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });

      alert('Question submitted successfully!');
      navigate('/studentdashboard');
    } catch (err) {
      console.error('Submission failed:', err);
      alert('Error submitting question.');
    }
  };

  return (
    <div className="add-question-container">
      <h2>Add a New Question</h2>
      <form onSubmit={handleSubmit}>
        <label>Question Name:</label>
        <input name="name" value={formData.name} onChange={handleChange} required />

        <label>Level:</label>
        <select name="level" value={formData.level} onChange={handleChange}>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>

        <label>Description:</label>
        <textarea name="description" value={formData.description} onChange={handleChange} required />

        <label>Reference:</label>
        <input name="reference" value={formData.reference} onChange={handleChange} />

        <label>Company:</label>
        <input name="company" value={formData.company} onChange={handleChange} />

        <label>Approach:</label>
        <textarea name="approach" value={formData.approach} onChange={handleChange} />

        <label>Remarks:</label>
        <textarea name="remarks" value={formData.remarks} onChange={handleChange} />

        <button type="submit">Submit Question</button>
      </form>
    </div>
  );
};

export default AddQuestion;
