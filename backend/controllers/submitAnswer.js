import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';
const submitAnswer = async (req, res) => {
    try {
      const { assignmentId, studentEmail, answer } = req.body;
  
  
      if (!assignmentId || !studentEmail || !answer) {
        return res.status(400).json({ error: 'Missing fields in submission' });
      }
  
  
      // Find the course containing the assignment
      const courseSnapshot = await db.collection('courses').get();
      let targetDoc = null;
      let matchedAssignment = null;
  
  
      courseSnapshot.forEach((doc) => {
        const courseData = doc.data();
        const assignment = courseData.assignments?.find(a => a.assignmentId === assignmentId);
        if (assignment) {
          targetDoc = doc;
          matchedAssignment = assignment;
        }
      });
  
  
      if (!targetDoc || !matchedAssignment) {
        return res.status(404).json({ error: 'Assignment not found in any course' });
      }
  
  
      const submission = {
        answer,
        submittedAt: new Date(),
        score: 0
      };
  
  
      // Update or create submissions map
      const courseRef = db.collection('courses').doc(targetDoc.id);
      const courseDoc = await courseRef.get();
      const courseData = courseDoc.data();
  
  
      const updatedAssignments = courseData.assignments.map(a => {
        if (a.assignmentId === assignmentId) {
          if (!a.submissions) a.submissions = {};
          a.submissions[studentEmail] = submission;
        }
        return a;
      });
  
  
      await courseRef.update({ assignments: updatedAssignments });
  
  
      return res.status(200).json({ success: true, message: 'Submission saved' });
    } catch (error) {
      console.error('Error submitting answer:', error);
      return res.status(500).json({ error: 'Failed to submit answer' });
    }
  };
  
export default submitAnswer;  