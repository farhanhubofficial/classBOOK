import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Header from './Header';
import StudentDashboard from './StudentDashboard';
import Home from './Home';
import Login from './Login';
import SignUp from './Signup';

function Connectivity() {
  const location = useLocation();

  // Check if current route is NOT /studentdashboard
  const showHeader = location.pathname !== '/studentdashboard';

  return (
    <>
      {showHeader && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/studentdashboard" element={<StudentDashboard />} />
      </Routes>
    </>
  );
}

export default Connectivity;
