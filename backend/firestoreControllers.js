// const admin = require('firebase-admin');
const { default: getCourseStudents } = require('./controllers/getCourseStudents');
const { default: getStudentProfile } = require('./controllers/getStudentProfile');
const { admin, db, bucket } = require('./firebase'); // Import the bucket
const { v4: uuidv4 } = require('uuid'); // For generating unique file names if needed


const addUser = async (req, res) => {
  try {
    const { userId, name, email, role, classId } = req.body;
    await db.collection("users").doc(userId).set({
      name,
      email,
      role,
      classId: classId || null,
    });
    res.status(200).send("User added successfully!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
const addStudent = async (req, res) => {
  try {
    const { classId, courses = ['UIT0000'], email, name, role = 'student', year } = req.body;
    if (!classId || !email || !name || !year) {
      return res.status(400).json({ error: 'Missing required student fields' });
    }


    await db.collection('users').add({ classId, courses, email, name, role, year });
    res.status(200).json({ message: 'Student added successfully' });
  } catch (err) {
    console.error('Error adding student:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Add Faculty
const addFaculty = async (req, res) => {
  try {
    const { classes = [], courses = ['UIT0000'], email, name, role = 'faculty' } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Missing required faculty fields' });
    }


    await db.collection('users').add({ classes, courses, email, name, role });
    res.status(200).json({ message: 'Faculty added successfully' });
  } catch (err) {
    console.error('Error adding faculty:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};


// Add Course
const addCourse = async (req, res) => {
  try {
    const { courseID, courseName } = req.body;
    if (!courseID || !courseName) {
      return res.status(400).json({ error: 'Missing courseID or courseName' });
    }


    await db.collection('courses').add({ courseID, courseName, assignments: [] });
    res.status(200).json({ message: 'Course added successfully' });
  } catch (err) {
    console.error('Error adding course:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
};




const uploadQuestion = async (req, res) => {
  try {
    const { questionId, title, description, createdBy, attachments } = req.body;
    await db.collection("questions").doc(questionId).set({
      title,
      description,
      attachments: attachments || [],
      createdBy,
      createdAt: admin.firestore.Timestamp.now(),
    });
    res.status(200).send("Question uploaded successfully!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


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
// Helper function to notify students (example implementation)
async function notifyStudents(courseRef, assignmentId) {
  try {
    const courseDoc = await courseRef.get();
    const courseData = courseDoc.data();
   
    if (courseData.students && courseData.students.length > 0) {
      const batch = db.batch();
     
      courseData.students.forEach(studentId => {
        const notificationRef = db.collection('notifications').doc();
        batch.set(notificationRef, {
          userId: studentId,
          type: 'new_assignment',
          assignmentId,
          courseId: courseRef.id,
          message: `New assignment: ${courseData.title}`,
          read: false,
          createdAt: admin.firestore.FieldValue.serverTimestamp()
        });
      });
     
      await batch.commit();
    }
  } catch (error) {
    console.error("Error notifying students:", error);
    // Fail silently as this shouldn't block assignment creation
  }
};
// Submit an Answer
// firestoreControllers.js
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


const getSubmissionByStudent = async (req, res) => {
  try {
    const { assignmentId, studentEmail } = req.query;


    if (!assignmentId || !studentEmail) {
      return res.status(400).json({ error: 'Missing assignmentId or studentEmail' });
    }


    const coursesSnapshot = await db.collection('courses').get();


    for (const courseDoc of coursesSnapshot.docs) {
      const courseData = courseDoc.data();
      const assignment = courseData.assignments?.find(
        (a) => a.assignmentId === assignmentId
      );


      if (assignment) {
        const submission = assignment.submissions?.[studentEmail];


        if (submission) {
          return res.status(200).json({
            submission,
            assignmentId,
            courseID: courseData.courseID,
            courseName: courseData.courseName || 'Unnamed Course',
          });
        } else {
          return res.status(404).json({ message: 'No submission found for this student.' });
        }
      }
    }


    return res.status(404).json({ message: 'Assignment not found.' });
  } catch (error) {
    console.error('Error getting student submission:', error);
    res.status(500).json({ error: 'Server error' });
  }
};




// Evaluate a Submission
const evaluateSubmission = async (req, res) => {
  try {
    const { submissionId, marks, feedback, evaluatedBy } = req.body;
    await db.collection("submissions").doc(submissionId).update({
      evaluation: {
        marks,
        feedback,
        evaluatedBy,
        evaluatedAt: admin.firestore.Timestamp.now(),
      },
    });
    res.status(200).send("Submission evaluated successfully!");
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get All Users (For Testing)
const getAllUsers = async (req, res) => {
  try {
    const snapshot = await db.collection("users").get();
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


// Get All Questions
const getAllQuestions = async (req, res) => {
  try {
    const snapshot = await db.collection("questions").get();
    const questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    res.status(200).json(questions);
  } catch (error) {
    res.status(500).json({
      error: error.message,
      message: "Failed to retrieve questions"
    });
  }
};


const getUserByEmail = async (req, res) => {
  try {
    // Extract email from query parameters
    const email = req.query.email;


    // Check if email is provided
    if (!email) {
      return res.status(400).json({
        error: "Email is required",
        message: "Please provide an email address"
      });
    }


    // Query Firestore to find user by email
    const querySnapshot = await db.collection("users")
      .where("email", "==", email)
      .limit(1)
      .get();


    // Check if user exists
    if (querySnapshot.empty) {
      return res.status(404).json({
        message: "No user found with this email"
      });
    }


    // Return the first (and should be only) matching user
    const userDoc = querySnapshot.docs[0];
    const userData = {
      id: userDoc.id,
      ...userDoc.data()
    };


    // Remove sensitive information if needed
    delete userData.password;


    res.status(200).json(userData);
  } catch (error) {
    console.error("Error retrieving user:", error);
    res.status(500).json({
      error: error.message,
      message: "Failed to retrieve user"
    });
  }
};
// Add these new functions to your existing firestoreController.js


// Get s for a faculty member
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




// Get pending submissions that need evaluation
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
        submittedAt: submissionData.submittedAt?.toDate()?.toISOString() || null,
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
      dueDate: assignment.dueDate ? assignment.dueDate.toDate().toISOString() : null,
      createdAt: assignment.createdAt ? assignment.createdAt.toDate().toISOString() : null,
      
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
      foundAssignment.dueDate = foundAssignment.dueDate.toDate().toISOString();
    }
    
    if (foundAssignment.createdAt?.toDate) {
      foundAssignment.createdAt = foundAssignment.createdAt.toDate().toISOString();
    }
    


    return res.status(200).json(foundAssignment);
  } catch (err) {
    console.error('Error getting assignment:', err);
    return res.status(500).json({ error: 'Server error' });
  }
};


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






// POST /api/questionbank
const addQuestionToBank = async (req, res) => {
  try {
    const {
      name,
      level,
      description,
      reference,
      company,
      approach,
      remarks,
      createdBy
    } = req.body;


    if (!name || !description || !createdBy) {
      return res.status(400).json({ message: 'Missing required fields' });
    }


    const questionData = {
      name,
      level: level || 'easy',
      description,
      reference: reference || '',
      company: company || '',
      approach: approach || '',
      remarks: remarks || '',
      createdBy,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    };


    await db.collection('questionbank').add(questionData);


    return res.status(200).json({ message: 'Question added to question bank' });
  } catch (err) {
    console.error('Error adding question to bank:', err);
    return res.status(500).json({ message: 'Failed to add question' });
  }
};




const getQuestionBank = async (req, res) => {
  try {
    const snapshot = await db.collection('questionbank').get();
    const questions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));


    res.status(200).json(questions);
  } catch (error) {
    console.error('Error fetching question bank:', error);
    res.status(500).json({ message: 'Failed to retrieve question bank' });
  }
};




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




module.exports = {
  addUser,
  uploadQuestion,
  assignQuestion,
  submitAnswer,
  evaluateSubmission,
  getAllUsers,
  getAllQuestions,
  getUserByEmail,
  getFacultyCourses,
  getPendingSubmissions,
  getCourseAssignments,
  getAssignmentWithDocument,
  getSubmissionByStudent,
  getSubmissionsByAssignment,
  updateScore,
  addQuestionToBank,
  getQuestionBank,
  assignQuestionsToCourse,
  addStudent,
  addFaculty,
  addCourse,
  updateStudentCourseBasedOnScore,
  getCourseStudents,
  getStudentProfile
};



