import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Header from './Header';
import Home from './Home';
import Login from './Login';
import SignUp from './Signup';
import StudentDashboard from './StudentDashboard';
import LearnersDashboard from './LearnerDashboard';
import Cbc from './Cbc'

// Admin components
import AdminDashboard from './AdminDashboard';
import DashboardHome from './DashboardHome';
// import StudentsPage from './components/admin/StudentsPage';
// import ParentsPage from './components/admin/ParentsPage';

function Connectivity() {
  const location = useLocation();

  const isAdminRoute = location.pathname.startsWith('/admin');
  const showHeader =
    location.pathname !== '/studentdashboard' &&
    location.pathname !== '/learners-dashboard' &&
    !isAdminRoute;

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        {/* General Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/studentdashboard" element={<StudentDashboard />} />
        <Route path="/learners-dashboard" element={<LearnersDashboard />} />

        {/* Admin Nested Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path = "curriculum/cbc" element = {<Cbc/>}/>
          {/* <Route path="students" element={<StudentsPage />} />
          <Route path="parents" element={<ParentsPage />} /> */}
          {/* Add more nested routes like staffs, payments, etc */}
        </Route>
      </Routes>
    </>
  );
}

export default Connectivity;
