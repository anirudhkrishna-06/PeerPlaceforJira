
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import LoginPage from "./pages/LoginPage";
import StudentDashBoard from "./pages/StudentDashboard";
import FacultyDashBoard from "./pages/FacultyDashboard";
import LandingPage from "./pages/LandingPage";
import CreateAssignment from "./pages/CreateAssignment";
import Assignment from "./pages/Assignment";
import CourseAssignments from './pages/CourseAssignments';
import FacultyCourseAssignments from './pages/FacultyCourseAssignments';
import FacultyAssignmentSubmissions from "./pages/FacultyAssignmentSubmissions";
import AddQuestion from './pages/AddQuestion';
import QuestionBank from './pages/QuestionBank';
import AdminDashboard from './pages/AdminDashboard';
import CourseStudents from './components/CourseStudents';
import StudentProfile from './components/StudentProfile';

const App = () => {
  return (
    <Router> {/* Wrap the entire application with Router */}
      {/* Navbar visible on all pages */}
      <Navbar />
      
      {/* Main content with routes */}
      <main>
        <Routes> {/* Define the routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/:section" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/studentdashboard" element={<StudentDashBoard />} />
          <Route path="/facultydashboard" element={<FacultyDashBoard />} />
          <Route path="/create-assignment" element={<CreateAssignment />} /> 
          <Route path="/assignment/:assignmentId" element={<Assignment />} />
          <Route path="/courses/:courseId" element={<CourseAssignments />} />
          <Route path="/faculty-course-assignments/:courseID" element={<FacultyCourseAssignments />} />
          <Route path="/faculty-assignment/:assignmentId" element={<FacultyAssignmentSubmissions />} />
          <Route path="/add-question" element={<AddQuestion />} />
          <Route path="/question-bank" element={<QuestionBank />} />
          <Route path="/admindashboard" element={<AdminDashboard />} />
          <Route path="/faculty/course/:courseId/students" element={<CourseStudents />} />
          <Route path="/faculty/student/:studentEmail" element={<StudentProfile />} />
      </Routes>
      </main>

      {/* Footer visible on all pages */}
      <Footer />
    </Router>
  );
};

export default App;
