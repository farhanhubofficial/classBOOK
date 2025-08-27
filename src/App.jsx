// App.jsx
import React from 'react';
import Connectivity from './components/Connectivity';
import PronunciationPractice from './components/PronunciationPractice'
import AdminContentManager from './components/AdminContentManager';
import GradeSelection from './components/GradeSelection';
import AdminDashBoard from './components/AdminDashboard'


const App = () => {
  return (
    <div>
      {/* Navbar placed at the top of the app */}
    {/* <GradeSelection/>
    <AdminContentManager/> */}
    <Connectivity/>
    </div>
  );
};

export default App;
