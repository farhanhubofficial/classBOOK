import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';

import Header from './Header';
import Home from './Home';
import Login from './Login';
import SignUp from './Signup';
import Elementary from './Elementary'
import Advanced from './Advanced'
import Proficiency from './Proficiency'

import Intermediate from './Intermediate'

import UpperIntermediate from './UpperIntermediate'

// Dashboards
import StudentDashboard from './StudentDashboard';
import LearnersDashboard from './LearnerDashboard';
import Cbc from './Cbc';
import AdminDashboard from './AdminDashboard';
import DashboardHome from './DashboardHome';

// New pages for nested student routes
import StudentSubjects from './StudentSubjects';
import SubjectVideos from './SubjectVideos';
import Lessons from './Lessons'
import EnglishClass from './EnglishClass';
import Beginner from "./Beginner"
import StudentAssignments from "./StudentAssignments"
import ViewSubmittedAssignment from './ViewSubmittedAssignment';

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
       

        {/* Admin Routes */}
        <Route path="/admin" element={<AdminDashboard />}>
          <Route path="dashboard" element={<DashboardHome />} />
          <Route path="curriculum/cbc" element={<Cbc />} />
          <Route path="curriculum/english-course" element={<EnglishClass />} />
          <Route path ="curriculum/english-course/beginner"  element ={<Beginner />}  />
       <Route path ="curriculum/english-course/elementary"  element ={<Elementary />}  />
     <Route path ="curriculum/english-course/advanced"  element ={<Advanced />}  />
     <Route path ="curriculum/english-course/proficiency"  element ={<Proficiency />}  />

     <Route path ="curriculum/english-course/upper-intermediate"  element ={<UpperIntermediate />}  />

    <Route path ="curriculum/english-course/intermediate"  element ={<Intermediate />}  />

        </Route>

        {/* Student Routes */}
        <Route path="/students" element={<StudentDashboard />}>
          <Route path="dashboard" element={<LearnersDashboard/>} />
          <Route path="subjects" element={<StudentSubjects />} />
          <Route path="subjects/:subject" element={<SubjectVideos />} />
              <Route path="assignments" element={<StudentAssignments />} />

          <Route path="settings" element={<div>Student Settings Page</div>} />
          <Route path = "lessons"  element = {<Lessons/>}         />
        </Route>
      </Routes>
    </>
  );
}

export default Connectivity;
