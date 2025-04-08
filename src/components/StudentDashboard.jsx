import React from "react";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { MdSubject, MdExitToApp, MdAssessment } from "react-icons/md";
import { GiSpellBook } from "react-icons/gi";

const StudentDashboard = () => {
  return (
    <div className="flex h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-100 p-5 flex flex-col shadow-lg">
        <div className="flex items-center gap-2 text-green-600 text-2xl font-bold">
          <GiSpellBook /> classBOOK
        </div>
        <div className="mt-5 text-center">
          <FaUserCircle className="text-5xl mx-auto text-gray-500" />
          <h2 className="text-lg font-semibold mt-2">John Doe</h2>
          <p className="text-sm text-gray-600">Student</p>
        </div>
        <nav className="mt-10 space-y-3">
          <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100">
            <FaUserCircle /> Student
          </a>
          <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100">
            <FiSettings /> Setting
          </a>
          <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100">
            <MdSubject /> Subjects
          </a>
          <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100">
            <MdAssessment /> Exam Reports
          </a>
          <a href="#" className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100">
            <MdAssessment /> Exams
          </a>
          <a href="#" className="flex items-center gap-2 p-2 text-red-600 rounded-md hover:bg-red-100">
            <MdExitToApp /> Log out
          </a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-5">
        {/* Top Bar */}
        <div className="flex justify-between items-center bg-gray-50 p-3 rounded-md shadow-sm">
          <div className="flex items-center bg-white p-2 rounded-md shadow-sm w-1/3">
            <FaSearch className="text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search"
              className="w-full outline-none bg-transparent"
            />
          </div>
          <div className="flex items-center gap-4">
            <p className="text-gray-700">Grade 3</p>
            <FaUserCircle className="text-3xl text-gray-500" />
          </div>
        </div>

        {/* Placeholder for dynamic content */}
        <div className="mt-5 p-5 bg-gray-50 rounded-lg shadow-md h-full">
          {/* Dynamic content will be added here */}
        </div>
      </main>
    </div>
  );
};

export default StudentDashboard;
