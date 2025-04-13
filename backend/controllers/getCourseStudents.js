import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';

// GET /api/course/:courseId/students
const getCourseStudents = async (req, res) => {
  const { courseId } = req.params;

  try {
    const usersSnapshot = await db.collection('users')
  .where('courses', 'array-contains', courseId)
  .where('role', '==', 'student')
  .get();

    const students = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

    return res.status(200).json({ students });
  } catch (error) {
    console.error('Error fetching course students:', error);
    return res.status(500).json({ message: 'Failed to fetch students' });
  }
};

export default getCourseStudents;