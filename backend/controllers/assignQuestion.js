import {admin, db, bucket} from '../firebase.js';
import { v4 } from 'uuid';

const assignQuestion = async (req, res) => {
    try {
      const { title, courseId, dueDate, facultyId, facultyName, description } = req.body;
      console.log("Received assignment data:", {
        title,
        courseId: courseId ? `"${courseId}"` : undefined,
        dueDate,
        facultyId
      });
  
  
      // Validate required fields
      if (!title || !courseId || !dueDate || !facultyId) {
        console.log("Missing fields:", { title, courseId, dueDate, facultyId });
        return res.status(400).json({
          error: "Missing required fields",
          message: "Please provide title, courseId, dueDate, and facultyId"
        });
      }
  
  
      // Trim courseId
      const trimmedCourseId = courseId.trim();
      console.log(`Checking for course with ID: "${trimmedCourseId}"`);
  
  
      // Try both methods of finding the course
      const courseQuery = db.collection("courses").where("courseID", "==", trimmedCourseId);
      const courseSnapshot = await courseQuery.get();
      console.log(`Query by field found ${courseSnapshot.size} matching courses`);
  
  
      const directCourseRef = db.collection("courses").doc(trimmedCourseId);
      const directCourseDoc = await directCourseRef.get();
      console.log(`Direct doc lookup exists: ${directCourseDoc.exists}`);
  
  
      // Check if course exists using either method
      let courseDocToUse;
     
      if (!courseSnapshot.empty) {
        courseDocToUse = courseSnapshot.docs[0];
        console.log("Course found by field query:", courseDocToUse.id);
      } else if (directCourseDoc.exists) {
        courseDocToUse = directCourseDoc;
        console.log("Course found by direct doc ID:", courseDocToUse.id);
      } else {
        // List all courses for debugging
        const allCoursesSnapshot = await db.collection("courses").get();
        console.log("All available courses:");
        allCoursesSnapshot.forEach(doc => {
          const data = doc.data();
          console.log(`- Doc ID: ${doc.id}, CourseId field: ${data.courseId || 'N/A'}`);
        });
       
        return res.status(404).json({
          error: "Course not found",
          message: `Course with ID "${trimmedCourseId}" does not exist`
        });
      }
  
  
      // Generate a unique assignment ID
      const assignmentId = `assign-${Date.now()}`;
     
      // Prepare assignment data (without file attachments)
      const assignmentData = {
        assignmentId,
        title,
        description: description || '',
        dueDate: admin.firestore.Timestamp.fromDate(new Date(dueDate)),
        attachments: [], // Empty array since we're skipping file uploads
        createdAt: admin.firestore.Timestamp.now(),
        status: 'active',
        facultyId,
        facultyName: facultyName || 'Unknown Faculty'
      };
  
  
      // Transaction to ensure atomic update
      await db.runTransaction(async (transaction) => {
        // Re-fetch the course data inside the transaction
        const courseRef = courseDocToUse.ref;
        const courseSnapshot = await transaction.get(courseRef);
        const courseData = courseSnapshot.data();
        const currentAssignments = courseData.assignments || [];
       
        transaction.update(courseRef, {
          assignments: [...currentAssignments, assignmentData]
        });
      });
  
  
      res.status(200).json({
        success: true,
        message: "Assignment created and added to course successfully!",
        assignmentId,
        courseId: trimmedCourseId
      });
  
  
    } catch (error) {
      console.error("Error creating assignment:", error);
      res.status(500).json({
        error: error.message,
        message: "Failed to create assignment"
      });
    }
  };
  
  
export default assignQuestion;  