import React, { useState } from 'react';
import axios from 'axios';
import '../styles/AdminDashboard.css';
const API_URL = 'http://localhost:5000';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('addStudent');
  const [formData, setFormData] = useState({});
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleJsonChange = (e) => {
    try {
      const json = JSON.parse(e.target.value);
      setFormData(json);
      setMessage('');
    } catch (err) {
      setMessage('Invalid JSON');
    }
  };

  const handleSubmit = async () => {
    try {
      let endpoint = '';
      let payload = {};

      switch (activeTab) {
        case 'addStudent':
          endpoint = '/api/admin/addstudent';
          payload = {
            classId: formData.classId,
            courses: formData.courses || ['UIT0000'],
            email: formData.email,
            name: formData.name,
            role: 'student',
            year: formData.year
          };
          break;
        case 'addFaculty':
          endpoint = '/api/admin/addfaculty';
          payload = {
            classes: formData.classes || [],
            courses: formData.courses || ['UIT0000'],
            email: formData.email,
            name: formData.name,
            role: 'faculty'
          };
          break;
        case 'addCourse':
          endpoint = '/api/admin/addcourse';
          payload = {
            assignments: [],
            courseID: formData.courseID,
            courseName: formData.courseName
          };
          break;
        default:
          return;
      }
      console.log(`${API_URL}${endpoint}`);
      const res = await axios.post(`${API_URL}${endpoint}`, payload);

      setMessage(`Success: ${JSON.stringify(res.data)}`);
    } catch (err) {
      console.error(err);
      setMessage(`Error: ${err.response?.data?.message || err.message}`);
    }
  };

  return (
    <div className="admin-dashboard">
      <h2>Admin Dashboard</h2>
      <div className="tabs">
        <button onClick={() => setActiveTab('addStudent')}>Add Student</button>
        <button onClick={() => setActiveTab('addFaculty')}>Add Faculty</button>
        <button onClick={() => setActiveTab('addCourse')}>Add Course</button>
      </div>

      <div className="form-section">
        {['addStudent', 'addFaculty'].includes(activeTab) ? (
          <>
            <textarea
              placeholder="Enter JSON data here"
              rows={10}
              cols={50}
              onChange={handleJsonChange}
            />
            <br />
            <button onClick={handleSubmit}>Submit</button>
          </>
        ) : activeTab === 'addCourse' ? (
          <>
            <input
              name="courseID"
              placeholder="Course ID"
              onChange={handleChange}
            /><br />
            <input
              name="courseName"
              placeholder="Course Name"
              onChange={handleChange}
            /><br />
            <button onClick={handleSubmit}>Submit</button>
          </>
        ) : null}

        {message && <p>{message}</p>}
      </div>
    </div>
  );
};

export default AdminDashboard;
