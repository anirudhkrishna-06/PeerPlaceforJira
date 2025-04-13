import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';

const getPendingSubmissions = async (req, res) => {
    try {
      const snapshot = await db.collection('submissions')
        .where('evaluation', '==', null)
        .get();
  
  
      const submissions = await Promise.all(snapshot.docs.map(async doc => {
        const submissionData = doc.data();
       
        const assignmentDoc = await db.collection('assignments')
          .doc(submissionData.assignmentId)
          .get();
        const assignmentData = assignmentDoc.data();
       
        const studentDoc = await db.collection('users')
          .doc(submissionData.studentId)
          .get();
        const studentData = studentDoc.data();
  
  
        return {
          id: doc.id,
          assignmentTitle: assignmentData?.title || 'Unknown Assignment',
          studentName: studentData?.name || 'Unknown Student',
          submittedAt: submissionData.submittedAt?.toDate() || null,
          ...submissionData
        };
      }));
  
  
      res.status(200).json(submissions);
    } catch (error) {
      console.error("Error fetching pending submissions:", error);
      res.status(500).json({
        error: error.message,
        message: "Failed to fetch pending submissions"
      });
    }
  };
  
export default getPendingSubmissions;  