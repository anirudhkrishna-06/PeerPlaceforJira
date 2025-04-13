import { admin, db, bucket } from '../firebase.js';

const getStudentProfile = async (req, res) => {
  const { studentEmail } = req.params;

  try {
    // Sanitize email input
    const emailToQuery = studentEmail.trim();

    // Step 1: Get student data
    const userSnap = await db.collection('users')
      .where('email', '==', emailToQuery)
      .get();

    if (userSnap.empty) {
      console.log(`No user found with email: ${emailToQuery}`);
      return res.status(404).json({ message: 'Student not found' });
    }

    const studentData = userSnap.docs[0].data();
    const studentCourses = studentData.courses || [];

    const allSubmissions = [];

    // Exit early if no courses
    if (studentCourses.length === 0) {
      return res.status(200).json({ student: studentData, submissions: [] });
    }

    // Step 2: Get all courses that match courseIDs
    const coursesSnap = await db.collection('courses')
      .where('courseID', 'in', studentCourses)
      .get();

    for (const courseDoc of coursesSnap.docs) {
      const course = courseDoc.data();
      const assignments = course.assignments || [];

      for (const assignment of assignments) {
        const submissions = assignment.submissions || {};

        if (submissions.hasOwnProperty(emailToQuery)) {
          const submission = submissions[emailToQuery];
          allSubmissions.push({
            assignmentTitle: assignment.title || assignment.name || 'Untitled',
            score: submission.score ?? null,
            submittedAt: submission.submittedAt?.toDate?.().toISOString() || null,
            remarks: submission.remarks || '',
          });
        }
      }
    }

    return res.status(200).json({
      studentData,
      assignmentSubmissions: allSubmissions
    });
  } catch (error) {
    console.error('Error fetching student profile:', error);
    return res.status(500).json({ message: 'Failed to fetch student profile' });
  }
};

export default getStudentProfile;
