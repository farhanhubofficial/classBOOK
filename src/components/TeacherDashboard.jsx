import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

import {
  FaTachometerAlt,
  FaRegUser,
  FaSignOutAlt,
  FaBook,
  FaCog,
  FaUserGraduate,
  FaUserCircle,
} from "react-icons/fa";
import { IoMdMenu } from "react-icons/io";
import { MdClose, MdExpandMore, MdExpandLess } from "react-icons/md";
import { GiSpellBook } from "react-icons/gi";
import AccountSettingsModal from "./AccountSettingsModal";

const TeacherDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [curriculumDropdownOpen, setCurriculumDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [showConfirmLogout, setShowConfirmLogout] = useState(false);

  const sidebarRef = useRef(null);
  const auth = getAuth();
  const navigate = useNavigate();

  const refreshUser = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;
    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      setUserData(userSnap.data());
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        await refreshUser();
      } else {
        setUser(null);
        setUserData(null);
      }
    });
    return () => unsubscribe();
  }, [auth]);

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);
  const toggleCurriculumDropdown = () => setCurriculumDropdownOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target)) {
        setIsSidebarOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  return (
    <div className="flex h-screen bg-white text-gray-900 relative">
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-100 p-5 shadow-lg transform transition-transform duration-300 overflow-y-auto max-h-screen ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="lg:hidden flex justify-end mb-4">
          <MdClose className="text-3xl text-green-600 cursor-pointer" onClick={toggleSidebar} />
        </div>

        <div className="flex items-center gap-2 text-green-600 text-2xl font-bold mb-4">
          <GiSpellBook /> classBOOK
        </div>

        <div className="text-center mb-6">
          {userData?.photoURL ? (
            <img
              src={userData.photoURL}
              alt="User"
              className="w-20 h-20 rounded-full mx-auto object-cover cursor-pointer"
              onClick={() => setIsSettingsModalOpen(true)}
            />
          ) : (
            <FaUserCircle
              className="text-5xl mx-auto text-gray-500 cursor-pointer"
              onClick={() => setIsSettingsModalOpen(true)}
            />
          )}
          <h2 className="text-lg font-semibold mt-2">
            {userData ? `${userData.firstName} ${userData.lastName}` : "Loading..."}
          </h2>
          <h2 className=" font-semibold mt-2">
            {userData ? `${userData.role}` : "Loading..."}
          </h2>
          <p className="text-sm text-gray-600">{userData?.category || "Loading..."}</p>
         <p className="text-sm text-black  ">
  {userData?.curriculum
    ? userData.curriculum.map(
        (cur) =>
          cur.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
      ).join(", ")
    : "Loading..."}
</p>

        </div>

        <nav className="space-y-3">
          <button onClick={() => navigate("/teacher/dashboard")} className="flex items-center gap-2 p-2 hover:bg-green-100 rounded">
            <FaTachometerAlt /> Dashboard
          </button>

       <div>
  <button
    onClick={toggleCurriculumDropdown}
    className="flex items-center gap-2 p-2 w-full hover:bg-green-100 rounded justify-between"
  >
    <span className="flex items-center gap-2">
      <FaBook /> Curriculum
    </span>
    {curriculumDropdownOpen ? <MdExpandLess /> : <MdExpandMore />}
  </button>

  {curriculumDropdownOpen && userData?.curriculum?.length > 0 && (
    <div className="pl-6 space-y-2 mt-2">
      {userData.curriculum.map((cur, index) => {
        // normalize route path
        const routePath = `/teacher/curriculum/${cur.toLowerCase().replace(/\s+/g, "-")}`;
        return (
          <button
            key={index}
            onClick={() => navigate(routePath)}
            className="block hover:text-green-600 capitalize"
          >
            {cur}
          </button>
        );
      })}
    </div>
  )}
</div>


          <button onClick={() => navigate("/teacher/students")} className="flex items-center gap-2 p-2 hover:bg-green-100 rounded">
            <FaUserGraduate /> Students
          </button>

          <button onClick={() => navigate("/teacher/account")} className="flex items-center gap-2 p-2 hover:bg-green-100 rounded">
            <FaRegUser /> Account
          </button>

          <button onClick={() => navigate("/teacher/settings")} className="flex items-center gap-2 p-2 hover:bg-green-100 rounded">
            <FaCog /> Settings
          </button>

          <button
            onClick={() => setShowConfirmLogout(true)}
            className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-100 rounded"
          >
            <FaSignOutAlt /> Log Out
          </button>
        </nav>
      </aside>

      <main className="flex-1 p-4 lg:ml-64 bg-gray-50 min-h-screen">
        <header className="sticky top-0 z-30 bg-white p-3 rounded shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3">
            <IoMdMenu className="text-2xl text-green-600 cursor-pointer lg:hidden" onClick={toggleSidebar} />
            <h1 className="text-xl font-semibold text-gray-700">Teacher Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            {userData?.photoURL ? (
              <img
                src={userData.photoURL}
                alt="User"
                className="w-12 h-12 rounded-full object-cover cursor-pointer"
                onClick={() => setIsSettingsModalOpen(true)}
              />
            ) : (
              <FaUserCircle
                className="text-5xl text-gray-500 cursor-pointer"
                onClick={() => setIsSettingsModalOpen(true)}
              />
            )}
            <div>
              <p className="text-sm">{userData?.firstName || "Teacher"} {userData?.lastName || ""}</p>
              <p className="text-xs text-gray-500">Teacher</p>
            </div>
          </div>
        </header>

        <div className="mt-5 p-5 rounded-lg shadow-md w-full max-w-full">
          <Outlet />
        </div>
      </main>

      {isSettingsModalOpen && (
        <AccountSettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          userData={userData}
          refreshUser={refreshUser}
        />
      )}

      {showConfirmLogout && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
          <div className="bg-white p-6 rounded shadow-lg w-96 text-center animate-fade-in">
            <h2 className="text-lg font-semibold mb-4 text-red-600">Confirm Logout</h2>
            <p className="mb-4">Are you sure you want to log out?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={handleLogout}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-transform transform hover:scale-105"
              >
                Yes, Log Out
              </button>
              <button
                onClick={() => setShowConfirmLogout(false)}
                className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400 transition-transform transform hover:scale-105"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherDashboard;
