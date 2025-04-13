// const { admin, db, bucket } = require('../firebase');
import {admin, db, bucket} from '../firebase.js';
const addCourse = async (req, res) => {
    try {
      const { courseID, courseName } = req.body;
      if (!courseID || !courseName) {
        return res.status(400).json({ error: 'Missing courseID or courseName' });
      }
  
  
      await db.collection('courses').add({ courseID, courseName, assignments: [] });
      res.status(200).json({ message: 'Course added successfully' });
    } catch (err) {
      console.error('Error adding course:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
  
export default addCourse;  