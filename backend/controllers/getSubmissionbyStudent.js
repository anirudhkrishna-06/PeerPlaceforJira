import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';

const getSubmissionByStudent = async (req, res) => {
    try {
      const { assignmentId, studentEmail } = req.query;
  
  
      if (!assignmentId || !studentEmail) {
        return res.status(400).json({ error: 'Missing assignmentId or studentEmail' });
      }
  
  
      const coursesSnapshot = await db.collection('courses').get();
  
  
      for (const courseDoc of coursesSnapshot.docs) {
        const courseData = courseDoc.data();
        const assignment = courseData.assignments?.find(
          (a) => a.assignmentId === assignmentId
        );
  
  
        if (assignment) {
          const submission = assignment.submissions?.[studentEmail];
  
  
          if (submission) {
            return res.status(200).json({
              submission,
              assignmentId,
              courseID: courseData.courseID,
              courseName: courseData.courseName || 'Unnamed Course',
            });
          } else {
            return res.status(404).json({ message: 'No submission found for this student.' });
          }
        }
      }
  
  
      return res.status(404).json({ message: 'Assignment not found.' });
    } catch (error) {
      console.error('Error getting student submission:', error);
      res.status(500).json({ error: 'Server error' });
    }
  };
  
  
  
  
export default getSubmissionByStudent;  