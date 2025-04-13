import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';

const getCourseAssignments = async (req, res) => {
    try {
      const { courseID } = req.params;
  
  
      // Validate courseId parameter
      if (!courseID) {
        return res.status(400).json({
          error: "Course ID is required",
          message: "Please provide a valid course ID"
        });
      }
  
  
      // Query courses where courseId field matches
      const snapshot = await db.collection('courses')
        .where('courseID', '==', courseID)
        .limit(1)
        .get();
  
  
      // Check if course exists
      if (snapshot.empty) {
        return res.status(404).json({
          error: "Course not found",
          message: `No course found with courseId: ${courseID}`
        });
      }
  
  
      // Get the first matching course (should be only one)
      const courseDoc = snapshot.docs[0];
      const courseData = courseDoc.data();
  
  
      // Get assignments from the course document
      const assignments = courseData.assignments || [];
      console.log(assignments)
      // Format assignments with additional information
      const formattedAssignments = assignments.map(assignment => ({
        ...assignment,
        courseID: courseData.courseID,
        courseName: courseData.courseName || 'Unnamed Course',
        // Convert Firestore Timestamps to JavaScript Date objects
        dueDate: assignment.dueDate?.toDate ? assignment.dueDate.toDate() : assignment.dueDate,
        createdAt: assignment.createdAt?.toDate ? assignment.createdAt.toDate() : assignment.createdAt,
        // Include the document ID for reference
        courseDocId: courseDoc.id
      }));
  
  
      res.status(200).json({
        success: true,
        courseID: courseData.courseID,
        courseName: courseData.courseName,
        assignments: formattedAssignments,
        count: formattedAssignments.length
      });
  
  
    } catch (error) {
      console.error("Error fetching course assignments:", error);
      res.status(500).json({
        error: error.message,
        message: "Failed to retrieve course assignments"
      });
    }
  };
    
export default getCourseAssignments;  