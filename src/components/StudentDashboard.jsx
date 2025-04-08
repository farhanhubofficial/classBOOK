import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaUserCircle } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { MdSubject, MdExitToApp, MdAssessment } from "react-icons/md";
import { GiSpellBook } from "react-icons/gi";
import { IoMdMenu } from "react-icons/io";
import { MdClose } from "react-icons/md";

const StudentDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => {
    setIsSidebarOpen((prev) => !prev);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-100 p-5 flex flex-col shadow-lg transform transition-transform duration-300 ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        {/* Close Button */}
        <div className="lg:hidden flex justify-end p-4">
          <MdClose className="text-3xl cursor-pointer text-green-600" onClick={toggleSidebar} />
        </div>
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
      <main className="flex-1 p-5 lg:ml-64">
        {/* Top Bar (Sticky) */}
        <div className="sticky top-0 z-30 bg-gray-50 p-3 rounded-md shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3">
            {/* Sidebar Toggle Button */}
            <IoMdMenu className="text-2xl text-green-600 text-green- cursor-pointer lg:hidden" onClick={toggleSidebar} />
            <div className="flex items-center bg-white p-2 rounded-md shadow-sm w-2/3 lg:w-1/3">
              <FaSearch className="text-gray-500 mr-2" />
              <input type="text" placeholder="Search" className="w-full outline-none bg-transparent" />
            </div>
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