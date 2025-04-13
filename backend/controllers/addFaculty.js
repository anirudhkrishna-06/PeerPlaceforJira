import {admin, db, bucket} from '../firebase.js';
const addFaculty = async (req, res) => {
    try {
      const { classes = [], courses = ['UIT0000'], email, name, role = 'faculty' } = req.body;
      if (!email || !name) {
        return res.status(400).json({ error: 'Missing required faculty fields' });
      }
  
  
      await db.collection('users').add({ classes, courses, email, name, role });
      res.status(200).json({ message: 'Faculty added successfully' });
    } catch (err) {
      console.error('Error adding faculty:', err);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
export default addFaculty;  