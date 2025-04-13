import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';
const assignQuestionsToCourse = async (req, res) => {
    const { courseId, questionIds, allQuestions } = req.body;
  
  
    if (!courseId || !Array.isArray(questionIds)) {
      return res.status(400).json({ error: 'Missing courseId or questionIds' });
    }
  
  
    try {
      const batch = db.batch();
  
  
      for (const id of questionIds) {
        const questionRef = db.collection('questionbank').doc(id);
        const doc = await questionRef.get();
  
  
        if (!doc.exists) continue;
  
  
        const data = doc.data();
        const assignedTo = Array.isArray(data.assignedTo) ? data.assignedTo : [];
  
  
        // Add only if not already assigned
        if (!assignedTo.includes(courseId)) {
          assignedTo.push(courseId);
          batch.update(questionRef, { assignedTo });
        }
      }
  
  
      await batch.commit();
      res.status(200).json({ updated: questionIds.length });
    } catch (err) {
      console.log(allQuestions);
      console.error('Error assigning questions to course:', err);
      res.status(500).json({ error: 'Failed to assign questions' });
    }
  };
  
export default assignQuestionsToCourse;  