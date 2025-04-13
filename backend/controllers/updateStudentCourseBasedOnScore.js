import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';
const updateStudentCourseBasedOnScore = async (studentId, score) => {
    let newCourseId = '';
    if (score < 50) newCourseId = 'UIT0001';
    else if (score <= 75) newCourseId = 'UIT0002';
    else newCourseId = 'UIT0003';
  
  
    const studentRef = db.collection('users').doc(studentId);
    await studentRef.update({
      courses: admin.firestore.FieldValue.arrayUnion(newCourseId)
    });
  };
  
  
export default updateStudentCourseBasedOnScore;  