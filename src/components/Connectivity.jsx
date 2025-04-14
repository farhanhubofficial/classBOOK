import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Header from './Header';
import Home from './Home';
import Login from './Login';
import SignUp from './Signup';

// Dashboards
import StudentDashboard from './StudentDashboard';
import LearnersDashboard from './LearnerDashboard';
import Cbc from './Cbc';
import AdminDashboard from './AdminDashboard';
import DashboardHome from './DashboardHome';

// New pages for nested student routes
import StudentSubjects from './StudentSubjects';
import SubjectVideos from './SubjectVideos';

function Connectivity() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');
  const isStudentRoute = location.pathname.startsWith('/student');
  const showHeader = !isAdminRoute && !isStudentRoute && location.pathname !== '/learners-dashboard';

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/learners-dashboard" element={<LearnersDashboard />} />

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="curriculum/cbc" element={<Cbc />} />
        </Route>

        {/* Student Routes */}
        <Route path="/studentdashboard" element={<StudentDashboard />}>
          <Route path="dashboard" element={<div>Welcome to your dashboard!</div>} />
          <Route path="subjects" element={<StudentSubjects />} />
          <Route path="subjects/:subject" element={<SubjectVideos />} />
          <Route path="settings" element={<div>Student Settings Page</div>} />
        </Route>
      </Routes>
    </>
  );
}

export default Connectivity;
