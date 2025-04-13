import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';
const updateScore = async (req, res) => {
    const { assignmentId, studentEmail, score, remarks } = req.body;
  
  
    console.log("Incoming POST to updateScore");
    console.log("assignmentId:", assignmentId);
    console.log("studentEmail:", studentEmail);
    console.log("score:", score);
    console.log("remarks:", remarks);
  
  
    try {
      const snapshot = await db.collection('courses').get();
      const courseDocs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  
  
      for (const course of courseDocs) {
        const assignments = course.assignments || [];
  
  
        const assignmentIndex = assignments.findIndex(a => a.assignmentId === assignmentId);
        if (assignmentIndex !== -1) {
          const assignment = assignments[assignmentIndex];
          const submissions = assignment.submissions || {};
  
  
          if (submissions.hasOwnProperty(studentEmail)) {
            console.log(`✅ Found submission for ${studentEmail}`);
  
  
            submissions[studentEmail].score = score;
  
  
            if (remarks !== undefined) {
              submissions[studentEmail].remarks = remarks;
            }
  
  
            assignment.submissions = submissions;
            assignments[assignmentIndex] = assignment;
  
  
            await db.collection('courses').doc(course.id).update({
              assignments: assignments
            });
  
  
            // ⬇️ Handle automatic enrollment if courseID is UIT0000 and title is "First Exam"
            if (course.courseID === 'UIT0000' && assignment.title === 'First Exam') {
              let newCourseId = null;
              const numericScore = parseFloat(score);
  
  
              if (numericScore < 50) newCourseId = 'UIT0001';
              else if (numericScore <= 75) newCourseId = 'UIT0002';
              else if (numericScore > 75) newCourseId = 'UIT0003';
  
  
              if (newCourseId) {
                const userRef = db.collection('users').where('email', '==', studentEmail).limit(1);
                const userSnapshot = await userRef.get();
  
  
                if (!userSnapshot.empty) {
                  const userDoc = userSnapshot.docs[0];
                  const userData = userDoc.data();
                  const updatedCourses = Array.from(new Set([...(userData.courses || []), newCourseId]));
  
  
                  await db.collection('users').doc(userDoc.id).update({
                    courses: updatedCourses
                  });
  
  
                  console.log(`📘 Enrolled ${studentEmail} into ${newCourseId}`);
                }
              }
            }
  
  
            return res.status(200).json({ message: 'Score updated and enrollment handled (if applicable)' });
          } else {
            console.warn(`⚠️ No submission found for ${studentEmail}`);
          }
        }
      }
  
  
      return res.status(404).json({ message: 'Assignment or submission not found' });
    } catch (err) {
      console.error('❌ Error updating score:', err);
      return res.status(500).json({ message: 'Internal server error' });
    }
  };
  
  
export default updateScore;  