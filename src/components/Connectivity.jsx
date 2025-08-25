import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import IgcseHome from './IgcseHome';
import CurriculumHome from './CurriculumHome';
import SettingsPanel from './SettingPanel';
import CbcHome from './CbcHome';
import TeacherDashboard from './TeacherDashboard'; // adjust path if needed
import AccountManagement from './AccountManagement';

import GradeView from './GradeView';
import SubjectView from './SubjectView';
import TopicView from './TopicView';


import StudentGradeView from './StudentGradeView';
import StudentSubjectView from './StudentSubjectView';
import StudentTopicView from './StudentTopicView';


import Header from './Header';
import Home from './Home';
import Login from './Login';
import SignUp from './Signup';

import Elementary from './Elementary';
import Advanced from './Advanced';
import Proficiency from './Proficiency';
import SomaliBeginner from './Somali-beginner';
import SomaliIntermediate from './SomaliIntermediate';
import SomaliElementary from './SomaliElementary';
import SomaliAdvanced from './SomaliAdvanced';
import Intermediate from './Intermediate';
import UpperIntermediate from './UpperIntermediate';

import StudentDashboard from './StudentDashboard';
import LearnersDashboard from './LearnerDashboard';

import AdminDashboard from './AdminDashboard';
import DashboardHome from './DashboardHome';
import Somali from './Somali';
import Arabic from './Arabic';
import Kiswahili from './Kiswahili';
import Students from './Students';
import PaymentStatus from './PaymentStatus';

import StudentSubjects from './StudentSubjects';
import SubjectVideos from './SubjectVideos';
import Lessons from './Lessons';
import EnglishClass from './EnglishClass';
import Beginner from './Beginner';
import StudentAssignments from './StudentAssignments';
import ViewSubmittedAssignment from './ViewSubmittedAssignment';
import UploadAssignment from './UploadAssignment';
import UploadLesson from './UploadLesson';
import { useAuth } from './AuthContext';
import LoadingScreen from './LoadingScreen'; // ✅ custom loading component
import UsersPanel from './UsersPanel';
import StaffManagement from './StaffManagement'; 

import TeacherCbc from './TeacherCbc';


import TrDashboard from './TrDashboard';

function Connectivity() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();

const isAdminRoute = location.pathname.startsWith('/admin');
const isStudentRoute = location.pathname.startsWith('/students');
const isTeacherRoute = location.pathname.startsWith('/teacher');

// Hide header for any teacher routes
const showHeader = !isAdminRoute && !isStudentRoute && !isTeacherRoute;


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


  // ✅ Use new spinner loading screen
  if (loading) return <LoadingScreen />;

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />

        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="settingspanel" element={<SettingsPanel />} />
                    <Route path="accountmanagement" element={<AccountManagement />} />
                                        <Route path="users" element={<UsersPanel />} />
                       <Route path="staffs" element={<StaffManagement />} />

          
<Route path="curriculum/:curriculum">
  <Route index element={<CurriculumHome />} />
  <Route path=":grade" element={<GradeView />} />
  <Route path=":grade/:subject" element={<SubjectView />} />
  <Route path=":grade/:subject/:topicId" element={<TopicView />} />
</Route>


          <Route path="curriculum/english-course" element={<EnglishClass />} />
          <Route path="curriculum/english-course/beginner" element={<Beginner />} />
          <Route path="curriculum/english-course/elementary" element={<Elementary />} />
          <Route path="curriculum/english-course/intermediate" element={<Intermediate />} />
          <Route path="curriculum/english-course/advanced" element={<Advanced />} />
          <Route path="curriculum/english-course/proficiency" element={<Proficiency />} />
          <Route path="curriculum/english-course/upper-intermediate" element={<UpperIntermediate />} />
          <Route path="curriculum/somali-course" element={<Somali />} />
          <Route path="curriculum/somali-course/beginner" element={<SomaliBeginner />} />
          <Route path="curriculum/somali-course/intermediate" element={<SomaliIntermediate />} />
          <Route path="curriculum/somali-course/elementary" element={<SomaliElementary />} />
          <Route path="curriculum/somali-course/advanced" element={<SomaliAdvanced />} />
          <Route path="curriculum/arabic-course" element={<Arabic />} />
          <Route path="curriculum/kiswahili-course" element={<Kiswahili />} />
          <Route path="students" element={<Students />} />
          <Route path="payments" element={<PaymentStatus />} />
  <Route path="view-assignments/:classroomName" element={<ViewSubmittedAssignment />} />
    <Route path="upload-assignments/:classroomName" element={<UploadAssignment />} />
    <Route path="upload-lesson/:classroomName" element={<UploadLesson />} />





{/* teachers route  */}
        </Route>

 <Route path='/teacher' element = {<TeacherDashboard/>}> 
  <Route path='dashboard' element = {<TrDashboard/>}/>
  <Route path='curriculum/cbc' element = {<TeacherCbc/>}/>
 </Route>






        {/* Student Routes */}
        <Route path="/students" element={<StudentDashboard />}>
          <Route path="dashboard" element={<LearnersDashboard />} />
          <Route path="subjects" element={<StudentGradeView />} />
          <Route path="curriculum/:curriculum/:grade/:subject" element={<StudentSubjectView />} />
<Route path="curriculum/:curriculum/:grade/:subject/:topicId" element={<StudentTopicView />} />

          <Route path="subjects/:subject" element={<SubjectVideos />} />
          <Route path="assignments" element={<StudentAssignments />} />
          <Route path="settings" element={<div>Student Settings Page</div>} />
          <Route path="lessons" element={<Lessons />} />
        </Route>
      </Routes>
    </>
  );
}

export default Connectivity;
