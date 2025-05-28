import React, { useEffect } from 'react';
import { Routes, Route, useLocation, useNavigate } from 'react-router-dom';

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
import Cbc from './Cbc';
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

import { useAuth } from './AuthContext';
import LoadingScreen from './LoadingScreen'; // ✅ custom loading component

function Connectivity() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, userData, loading } = useAuth();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStudentRoute = location.pathname.startsWith('/students');
  const showHeader = !isAdminRoute && !isStudentRoute && location.pathname !== '/learners-dashboard';

  useEffect(() => {
    if (!loading && user && userData) {
      if (userData.role === 'learner') {
        navigate('/students/dashboard');
      } else if (userData.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (userData.role === 'operator') {
        navigate('/users');
      }
    }
  }, [loading, user, userData, navigate]);

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
          <Route path="curriculum/cbc" element={<Cbc />} />
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
        </Route>

        {/* Student Routes */}
        <Route path="/students" element={<StudentDashboard />}>
          <Route path="dashboard" element={<LearnersDashboard />} />
          <Route path="subjects" element={<StudentSubjects />} />
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
