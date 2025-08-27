import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

//CORE PAGES
import Home from './Home';
import Header from './Header';
import Footer from './footer';
import LoadingScreen from './LoadingScreen';

//AUTH PAGES 
import Login from './Login';
import SignUp from './Signup';

//ADMIN COMPONENTS 
import AdminDashboard from './AdminDashboard';
import DashboardHome from './DashboardHome';
import SettingsPanel from './SettingPanel';
import Students from './Students';
import PaymentStatus from './PaymentStatus';
import ViewSubmittedAssignment from './ViewSubmittedAssignment';
import UploadAssignment from './UploadAssignment';

//STUDENT COMPONENTS
import StudentDashboard from './StudentDashboard';
import LearnersDashboard from './LearnerDashboard';
import StudentGradeView from './StudentGradeView';
import StudentSubjectView from './StudentSubjectView';
import StudentTopicView from './StudentTopicView';
import StudentSubjects from './StudentSubjects';
import SubjectVideos from './SubjectVideos';
import StudentAssignments from './StudentAssignments';
import Lessons from './Lessons';

//TEACHER COMPONENTS
import TeacherDashboard from './TeacherDashboard';

//CURRICULUM COMPONENTS
import CurriculumHome from './CurriculumHome';
import GradeView from './GradeView';
import SubjectView from './SubjectView';
import TopicView from './TopicView';

//English Course
import EnglishClass from './EnglishClass';
import Beginner from './Beginner';
import Elementary from './Elementary';
import Intermediate from './Intermediate';
import UpperIntermediate from './UpperIntermediate';
import Advanced from './Advanced';
import Proficiency from './Proficiency';

//Somali Course
import Somali from './Somali';
import SomaliBeginner from './Somali-beginner';
import SomaliIntermediate from './SomaliIntermediate';
import SomaliElementary from './SomaliElementary';
import SomaliAdvanced from './SomaliAdvanced';

//Other Languages
import Arabic from './Arabic';
import Kiswahili from './Kiswahili';

//CONTEXT / HOOKS
import { useAuth } from './AuthContext';

function Connectivity() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStudentRoute = location.pathname.startsWith('/students');
  const showHeader = !isAdminRoute && !isStudentRoute && location.pathname !== '/learners-dashboard';
  const showFooter = !isAdminRoute && !isStudentRoute && location.pathname !== '/learners-dashboard';

  useEffect(() => {
    if (!loading && user && userData) {
      if (location.pathname === '/' || location.pathname === '/login') {
        if (userData.role === 'learner') {
          navigate('/students/dashboard');
        } else if (userData.role === 'admin') {
          navigate('/admin/dashboard');
        } else if (userData.role === 'operator') {
          navigate('/users');
        }
      }
    }
  }, [loading, user, userData, navigate, location.pathname]);

  if (loading) return <LoadingScreen />;

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        {/* Core & Auth */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Teacher */}
        <Route path="/teacherdashboard" element={<TeacherDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="settingspanel" element={<SettingsPanel />} />
          <Route path="students" element={<Students />} />
          <Route path="payments" element={<PaymentStatus />} />
          <Route path="view-assignments/:classroomName" element={<ViewSubmittedAssignment />} />
          <Route path="upload-assignments/:classroomName" element={<UploadAssignment />} />

          {/* Curriculum Management */}
          <Route path="curriculum/:curriculum">
            <Route index element={<CurriculumHome />} />
            <Route path=":grade" element={<GradeView />} />
            <Route path=":grade/:subject" element={<SubjectView />} />
            <Route path=":grade/:subject/:topicId" element={<TopicView />} />
          </Route>

          {/* English Course */}
          <Route path="curriculum/english-course" element={<EnglishClass />} />
          <Route path="curriculum/english-course/beginner" element={<Beginner />} />
          <Route path="curriculum/english-course/elementary" element={<Elementary />} />
          <Route path="curriculum/english-course/intermediate" element={<Intermediate />} />
          <Route path="curriculum/english-course/upper-intermediate" element={<UpperIntermediate />} />
          <Route path="curriculum/english-course/advanced" element={<Advanced />} />
          <Route path="curriculum/english-course/proficiency" element={<Proficiency />} />

          {/* Somali Course */}
          <Route path="curriculum/somali-course" element={<Somali />} />
          <Route path="curriculum/somali-course/beginner" element={<SomaliBeginner />} />
          <Route path="curriculum/somali-course/intermediate" element={<SomaliIntermediate />} />
          <Route path="curriculum/somali-course/elementary" element={<SomaliElementary />} />
          <Route path="curriculum/somali-course/advanced" element={<SomaliAdvanced />} />

          {/* Other Languages */}
          <Route path="curriculum/arabic-course" element={<Arabic />} />
          <Route path="curriculum/kiswahili-course" element={<Kiswahili />} />
        </Route>

        {/* Student Routes */}
        <Route path="/students" element={<StudentDashboard />}>
          <Route path="dashboard" element={<LearnersDashboard />} />
          <Route path="subjects" element={<StudentGradeView />} />
          <Route path="curriculum/:curriculum/:grade/:subject" element={<StudentSubjectView />} />
          <Route path="curriculum/:curriculum/:grade/:subject/:topicId" element={<StudentTopicView />} />
          <Route path="subjects/:subject" element={<SubjectVideos />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="lessons" element={<Lessons />} />
          <Route path="settings" element={<div>Student Settings Page</div>} />
        </Route>
      </Routes>
      {showFooter && <Footer />}
    </>
  );
}

export default Connectivity;
