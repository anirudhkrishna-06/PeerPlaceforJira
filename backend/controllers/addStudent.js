import {admin, db, bucket} from '../firebase.js';
const addStudent = async (req, res) => {
    try {
      const { classId, courses = ['UIT0000'], email, name, role = 'student', year } = req.body;
      if (!classId || !email || !name || !year) {
        return res.status(400).json({ error: 'Missing required student fields' });
      }
  
  
      await db.collection('users').add({ classId, courses, email, name, role, year });
      res.status(200).json({ message: 'Student added successfully' });
    } catch (err) {
      console.error('Error adding student:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
export default addStudent;  
