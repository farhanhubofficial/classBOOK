import React, { useState, useEffect, useRef } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

import {
  FaTachometerAlt,
  FaUsers,
  FaChalkboardTeacher,
  FaRegUser,
  FaSignOutAlt,
  FaBook,
  FaCog,
  FaWallet,
  FaUserGraduate,
  FaUserTie,
  FaUserCircle,
} from "react-icons/fa";
import { IoMdMenu } from "react-icons/io";
import { MdClose, MdExpandMore, MdExpandLess } from "react-icons/md";
import { GiSpellBook } from "react-icons/gi";
import AccountSettingsModal from "./AccountSettingsModal";

const AdminDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [curriculumDropdownOpen, setCurriculumDropdownOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [userData, setUserData] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);

  const sidebarRef = useRef(null);
  const auth = getAuth();
  const navigate = useNavigate();
  const location = useLocation();

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
    <div className="flex h-screen bg-white text-gray-900">
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-100 p-5 shadow-lg transform transition-transform duration-300 overflow-y-auto max-h-screen ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="lg:hidden flex justify-end mb-4">
          <MdClose className="text-3xl text-green-600 cursor-pointer" onClick={toggleSidebar} />
        </div>

        {/* Sidebar Header */}
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
          <p className="text-sm text-gray-600">{userData ? userData.category : "Loading..."}</p>
          <p className="text-sm text-gray-600">
            {userData ? (
              <span className="uppercase font-bold">{userData.curriculum}</span>
            ) : (
              "Loading..."
            )}
          </p>
        </div>

        {/* Sidebar Navigation */}
        <nav className="space-y-3">
          <button onClick={() => navigate("/admin/dashboard")} className="flex items-center gap-2 p-2 hover:bg-green-100 rounded">
            <FaTachometerAlt /> Dashboard
          </button>

          {/* Curriculum Dropdown */}
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
            {curriculumDropdownOpen && (
              <div className="pl-6 space-y-2 mt-2">
                <button onClick={() => navigate("/admin/curriculum/cbc")} className="block hover:text-green-600">CBC</button>
                <button onClick={() => navigate("/admin/curriculum/igcse")} className="block hover:text-green-600">IGCSE</button>
                <button onClick={() => navigate("/admin/curriculum/english-course")} className="block hover:text-green-600">English Course</button>
                <button onClick={() => navigate("/admin/curriculum/arabic-course")} className="block hover:text-green-600">Arabic Course</button>
                <button onClick={() => navigate("/admin/curriculum/kiswahili-course")} className="block hover:text-green-600">Kiswahili Course</button>
                <button onClick={() => navigate("/admin/curriculum/somali-course")} className="block hover:text-green-600">Somali Course</button>
              </div>
            )}
          </div>

          <button onClick={() => navigate("/admin/students")} className="flex items-center gap-2 p-2 hover:bg-green-100 rounded">
            <FaUserGraduate /> Students
          </button>

          <button onClick={() => navigate("/admin/parents")} className="flex items-center gap-2 p-2 hover:bg-green-100 rounded">
            <FaUsers /> Parents
          </button>

          <button onClick={() => navigate("/admin/staffs")} className="flex items-center gap-2 p-2 hover:bg-green-100 rounded">
            <FaUserTie /> Staffs
          </button>

          <button onClick={() => navigate("/admin/payments")} className="flex items-center gap-2 p-2 hover:bg-green-100 rounded">
            <FaWallet /> Payment Status
          </button>

          <button onClick={() => navigate("/admin/account")} className="flex items-center gap-2 p-2 hover:bg-green-100 rounded">
            <FaRegUser /> Account
          </button>

          <button onClick={() => navigate("/admin/settings")} className="flex items-center gap-2 p-2 hover:bg-green-100 rounded">
            <FaCog /> Settings
          </button>

          <button onClick={handleLogout} className="flex items-center gap-2 p-2 text-red-600 hover:bg-red-100 rounded">
            <FaSignOutAlt /> Log Out
          </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 lg:ml-64 bg-gray-50 min-h-screen">
        {/* Top Bar */}
        <header className="sticky top-0 z-30 bg-white p-3 rounded shadow-sm flex justify-between items-center">
          <div className="flex items-center gap-3">
            <IoMdMenu className="text-2xl text-green-600 cursor-pointer lg:hidden" onClick={toggleSidebar} />
            <h1 className="text-xl font-semibold text-gray-700">Admin Dashboard</h1>
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
              <p className="text-sm">{userData?.firstName || "Admin User"} {userData?.lastName || ""}</p>
              <p className="text-xs text-gray-500">Admin</p>
            </div>
          </div>
        </header>

        {/* Page Outlet */}
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
    </div>
  );
};

export default AdminDashboard;
