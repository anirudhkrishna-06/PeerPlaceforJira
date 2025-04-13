import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';
const getSubmissionsByAssignment = async (req, res) => {
    try {
      const { assignmentId } = req.params;
  
  
      const coursesSnapshot = await db.collection('courses').get();
  
  
      let foundAssignment = null;
  
  
      for (const courseDoc of coursesSnapshot.docs) {
        const courseData = courseDoc.data();
        const assignments = courseData.assignments || [];
  
  
        const assignment = assignments.find(a => a.assignmentId === assignmentId);
        if (assignment) {
          foundAssignment = assignment;
          break;
        }
      }
  
  
      if (!foundAssignment) {
        return res.status(404).json({ message: 'Assignment not found' });
      }
  
  
      const submissionsObj = foundAssignment.submissions || {}; // submissions as a map
      const formattedSubmissions = Object.entries(submissionsObj).map(
        ([studentEmail, submissionData]) => ({
          studentEmail,
          answer: submissionData.answer,
          submittedAt: submissionData.submittedAt,
          score: submissionData.score || 0,
          remarks: submissionData.remarks || '',
        })
      );
  
  
      return res.status(200).json({ submissions: formattedSubmissions });
  
  
    } catch (err) {
      console.error('Error fetching submissions by assignment:', err);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
export default getSubmissionsByAssignment;  