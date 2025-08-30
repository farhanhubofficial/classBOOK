import React, { useState, useEffect, useRef } from "react";
import { FaSearch, FaUserCircle, FaBolt } from "react-icons/fa";
import { FiSettings } from "react-icons/fi";
import { MdSubject, MdExitToApp, MdAssessment, MdDescription, MdClose } from "react-icons/md";
import { GiSpellBook } from "react-icons/gi";
import { IoMdMenu } from "react-icons/io";
import { RiFileList3Line } from "react-icons/ri";
import { getAuth, signOut, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { useNavigate, Outlet } from "react-router-dom";
import LoadingScreen from "./LoadingScreen";
import AccountSettingsModal from "./AccountSettingsModal";

const StudentDashboard = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const sidebarRef = useRef(null);
  const navigate = useNavigate();
  const auth = getAuth();

  const toggleSidebar = () => setIsSidebarOpen((prev) => !prev);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate("/login");
    } catch (error) {
      console.error("Error signing out: ", error);
    }
  };

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
        await refreshUser();
        setLoading(false);
      } else {
        setLoading(false);
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isSidebarOpen && sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSidebarOpen]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <LoadingScreen />
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-white text-gray-900 overflow-hidden">
      <aside
        ref={sidebarRef}
        className={`fixed top-0 left-0 z-40 w-64 h-screen bg-gray-100 p-5 flex flex-col shadow-lg transform transition-transform duration-300 overflow-y-auto scrollbar-thin ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-full"
        } lg:translate-x-0`}
      >
        <div className="lg:hidden flex justify-end p-4">
          <MdClose className="text-3xl cursor-pointer text-green-600" onClick={toggleSidebar} />
        </div>
        <div className="flex items-center gap-2 text-green-600 text-2xl font-bold">
          <GiSpellBook /> classBOOK
        </div>
        <div className="mt-5 text-center">
          {userData?.photoURL ? (
            <img src={userData.photoURL} alt="Profile" className="w-20 h-20 rounded-full mx-auto object-cover cursor-pointer" onClick={() => setIsSettingsModalOpen(true)}
/>
          ) : (
            <FaUserCircle className="text-5xl mx-auto text-gray-500" />
          )}
          <h2 className="text-lg font-semibold mt-2">
            {userData ? `${userData.firstName} ${userData.lastName}` : "Loading..."}
          </h2>
          <p className="text-sm text-gray-600">{userData?.category || "Loading..."}</p>
          <p className="text-sm text-gray-600 uppercase font-bold">{userData?.curriculum}</p>
          <p className="text-sm text-gray-600 lowercase font-semibold">{userData?.classroom}</p>
        </div>
        <nav className="mt-10 space-y-3 pb-10">
          <button className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100" onClick={() => navigate("/students/dashboard")}> <FaUserCircle /> Dashboard </button>
          <button className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100" onClick={() => navigate("/student/settings")}> <FiSettings /> Settings </button>

          {["english", "Kiswahili Course", "Somali Course", "Arabic Course"].includes(userData?.curriculum) ? (
            <>
              <button className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100" onClick={() => navigate("/students/lessons")}> <GiSpellBook /> Lessons </button>
              <button className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100" onClick={() => navigate("/students/practical-quizzes")}> <MdDescription /> Practical Quizzes </button>
              <button className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100" onClick={() => navigate("/studentdashboard/crash-courses")}> <FaBolt /> Crash Courses </button>
              <button className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100" onClick={() => navigate("/students/assignments")}> <RiFileList3Line /> Assignments </button>
            </>
          ) : (
            <button className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100" onClick={() => navigate("/students/subjects")}> <MdSubject /> Subjects </button>
          )}

          <button className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100"> <MdAssessment /> Exam Reports </button>
          <button className="flex items-center gap-2 p-2 rounded-md hover:bg-green-100"> <MdAssessment /> Exams </button>
          <button onClick={handleLogout} className="flex items-center gap-2 p-2 text-red-600 rounded-md hover:bg-red-100"> <MdExitToApp /> Log out </button>
        </nav>
      </aside>

      <main className="flex-1 lg:ml-64 overflow-y-auto h-screen">
        <div className="sticky top-0 z-30 bg-gray-50 p-3 rounded-md shadow-sm flex flex-col gap-2">
          <div className="flex flex-wrap justify-between items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-3 flex-shrink">
              <IoMdMenu className="text-2xl text-green-600 cursor-pointer lg:hidden" onClick={toggleSidebar} />
              <div className="hidden lg:flex items-center bg-white p-2 rounded-md shadow-sm w-full lg:w-2/3">
                <FaSearch className="text-gray-500 mr-2" />
                <input type="text" placeholder="Search" className="w-full outline-none bg-transparent" />
              </div>
              <FaSearch className="text-2xl text-gray-500 cursor-pointer lg:hidden" onClick={() => setIsSearchOpen((prev) => !prev)} />
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
                <FaUserCircle className="text-5xl text-gray-500 cursor-pointer" onClick={() => setIsSettingsModalOpen(true)} />
              )}
              <div>
                <p className="text-sm text-gray-700">{userData?.firstName || "Loading..."} {userData?.lastName || ""}</p>
                <p className="text-xs text-gray-500">{userData?.grade}</p>
              </div>
            </div>
          </div>

          {isSearchOpen && (
            <div className="lg:hidden flex items-center bg-white p-2 rounded-md shadow-sm w-full">
              <FaSearch className="text-gray-500 mr-2" />
              <input type="text" placeholder="Search" className="w-full outline-none bg-transparent" autoFocus />
            </div>
          )}
        </div>

        <div className="mt-5 p-5 rounded-lg shadow-md w-full max-w-full">
          <Outlet />
        </div>
      </main>

      {isSettingsModalOpen && (
        <AccountSettingsModal
          onClose={() => setIsSettingsModalOpen(false)}
          userData={userData}
          refreshUser={refreshUser} // ✅ Fix: Now passed correctly
        />
      )}
    </div>
  );
};

export default StudentDashboard;
