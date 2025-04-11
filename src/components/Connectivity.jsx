import React from 'react';
import Header from './Header';
import StudentDashboard from './StudentDashboard'
import Home from  './Home'
import Login from './Login'

function Connectivity() {
  return (
    <div >
      <Header/>
        <Home />
        <Login/>
    </div>
  );
}

export default Connectivity;
