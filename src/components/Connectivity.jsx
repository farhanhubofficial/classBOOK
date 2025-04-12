import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Header from './Header';
import StudentDashboard from './StudentDashboard';
import LearnersDashboard from './LearnerDashboard'; // Make sure to import LearnersDashboard
import Home from './Home';
import Login from './Login';
import SignUp from './Signup';

function Connectivity() {
  const location = useLocation();

  // Check if current route is NOT /studentdashboard or /learners-dashboard
  const showHeader = location.pathname !== '/studentdashboard' && location.pathname !== '/learners-dashboard';

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/studentdashboard" element={<StudentDashboard />} />
        {/* Add LearnersDashboard route */}
        <Route path="/learners-dashboard" element={<LearnersDashboard />} />
      </Routes>
    </>
  );
}

export default Connectivity;
