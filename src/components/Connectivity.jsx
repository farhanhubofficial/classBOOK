import React from 'react';
import { Routes, Route } from 'react-router-dom';

import Header from './Header';
import StudentDashboard from './StudentDashboard';
import Home from './Home';
import Login from './Login';
import SignUp from './Signup'

function Connectivity() {
  return (
    <>
      <Header />
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
