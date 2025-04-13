import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';
const getFacultyCourses = async (req, res) => {
    try {
      const { facultyId } = req.query;
  
  
      if (!facultyId) {
        return res.status(400).json({ error: "Faculty ID is required" });
      }
  
  
      // Step 1: Get the user document
      const userDoc = await db.collection('users').doc(facultyId).get();
  
  
      if (!userDoc.exists) {
        return res.status(404).json({ error: "Faculty not found" });
      }
  
  
      const userData = userDoc.data();
      const courseIDs = userData.courses || [];
  
  
      if (!Array.isArray(courseIDs) || courseIDs.length === 0) {
        return res.status(200).json([]); // Return empty array if no courses
      }
  
  
      // Step 2: Fetch matching courses by 'courseID' field (not doc ID)
      const coursesRef = db.collection('courses');
      const coursesSnapshot = await coursesRef
        .where('courseID', 'in', courseIDs)
        .get();
  
  
      const courses = coursesSnapshot.docs.map(doc => ({
        id: doc.id, // Firebase doc ID (in case you still want it)
        ...doc.data()
      }));
  
  
      res.status(200).json(courses);
    } catch (error) {
      console.error("Error fetching courses:", error);
      res.status(500).json({
        error: error.message,
        message: "Failed to fetch courses"
      });
    }
  };  
  
  
export default getFacultyCourses;  