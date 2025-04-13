import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';

const getAssignmentWithDocument = async (req, res) => {
    try {
      const { assignmentId } = req.params;
  
  
      if (!assignmentId) {
        return res.status(400).json({ error: 'Assignment ID is required' });
      }
  
  
      const snapshot = await db.collection('courses').get();
  
  
      let foundAssignment = null;
  
  
      snapshot.forEach((doc) => {
        const courseData = doc.data();
        const assignments = courseData.assignments || [];
  
  
        const match = assignments.find(a => a.assignmentId === assignmentId);
        if (match) {
          foundAssignment = {
            ...match,
            courseID: courseData.courseID,
            courseName: courseData.courseName || 'Unnamed Course',
            courseDocId: doc.id,
          };
        }
      });
  
  
      if (!foundAssignment) {
        return res.status(404).json({ error: 'Assignment not found' });
      }
  
  
      // Convert Timestamps
      if (foundAssignment.dueDate?.toDate) {
        foundAssignment.dueDate = foundAssignment.dueDate.toDate();
      }
      if (foundAssignment.createdAt?.toDate) {
        foundAssignment.createdAt = foundAssignment.createdAt.toDate();
      }
  
  
      return res.status(200).json(foundAssignment);
    } catch (err) {
      console.error('Error getting assignment:', err);
      return res.status(500).json({ error: 'Server error' });
    }
  };
  
export default getAssignmentWithDocument;  