import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase-config";

const UsersPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [showPopup, setShowPopup] = useState(false);
  const [showRecentPopup, setShowRecentPopup] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [recentUsers, setRecentUsers] = useState({ today: [], yesterday: [], week: [], older: [] });
  const [searchTerm, setSearchTerm] = useState("");
  const [userToDelete, setUserToDelete] = useState(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  const [showStudentsPopup, setShowStudentsPopup] = useState(false);
  const [studentUsers, setStudentUsers] = useState([]);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);

  // ✅ new states for teacher/parent/staff
  const [teacherUsers, setTeacherUsers] = useState([]);
  const [parentUsers, setParentUsers] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const usersCollection = collection(db, "users");
      const snapshot = await getDocs(usersCollection);
      const usersData = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      const sortedUsers = usersData.sort((a, b) => {
        const dateA = typeof a.dateRegistered === "object" && a.dateRegistered?.seconds
          ? a.dateRegistered.seconds
          : new Date(a.dateRegistered || 0).getTime() / 1000;
        const dateB = typeof b.dateRegistered === "object" && b.dateRegistered?.seconds
          ? b.dateRegistered.seconds
          : new Date(b.dateRegistered || 0).getTime() / 1000;
        return dateB - dateA;
      });

      setUsers(sortedUsers);
      setFilteredUsers(sortedUsers);

      const learners = sortedUsers.filter((u) => u.category === "learner");
      setStudentUsers(learners);

      // ✅ added teacher/parent/staff filters
      setTeacherUsers(sortedUsers.filter((u) => u.category === "teacher"));
      setParentUsers(sortedUsers.filter((u) => u.category === "parent"));
      setStaffUsers(sortedUsers.filter((u) => u.category === "staff"));

      const now = new Date();
      const today = [], yesterday = [], week = [], older = [];

      usersData.forEach((user) => {
        if (!user.lastLogin) return;

        const timestamp = typeof user.lastLogin === "object" && user.lastLogin?.seconds
          ? new Date(user.lastLogin.seconds * 1000)
          : new Date(user.lastLogin);

        const loginDate = new Date(timestamp);
        const nowDate = new Date();
        const startOfToday = new Date(nowDate.setHours(0, 0, 0, 0));
        const startOfYesterday = new Date(startOfToday);
        startOfYesterday.setDate(startOfToday.getDate() - 1);
        const startOfWeek = new Date(startOfToday);
        startOfWeek.setDate(startOfToday.getDate() - startOfToday.getDay());

        if (loginDate >= startOfToday) {
          today.push(user);
        } else if (loginDate >= startOfYesterday && loginDate < startOfToday) {
          yesterday.push(user);
        } else if (loginDate >= startOfWeek) {
          week.push(user);
        } else {
          older.push(user);
        }
      });

      setRecentUsers({ today, yesterday, week, older });
    } catch (error) {
      console.error("Error fetching users:", error);
    }
  };

  const handleTabClick = (tab) => {
    setActiveTab(tab);
    if (tab === "all") {
      setShowPopup(true);
      fetchUsers();
    } else if (tab === "students") {
      setShowStudentsPopup(true);
      fetchUsers();
    }
    // ✅ later you can do the same for teachers/parents/staff popups
  };

  const curriculumLabels = [
    "CBC",
    "IGCSE",
    "English Course",
    "Arabic Course",
    "Somali Course",
    "Kiswahili Course",
  ];

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter((user) =>
      `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase().includes(term) ||
      (user.email || "").toLowerCase().includes(term) ||
      (user.grade || "").toLowerCase().includes(term) ||
      (user.curriculum || "").toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
  };

  const handleDeleteUser = async () => {
    try {
      if (userToDelete) {
        await deleteDoc(doc(db, "users", userToDelete.id));
        setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        setFilteredUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
        setShowConfirmDelete(false);
        setUserToDelete(null);
      }
    } catch (error) {
      console.error("Failed to delete user:", error);
    }
  };

  const renderTable = (data) => (
    <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border border-gray-200 rounded mt-2">
      <table className="table-auto w-full">
        <thead className="bg-green-600 text-white sticky top-0 z-10">
          <tr>
            <th className="px-4 py-2 text-left">Name</th>
            <th className="px-4 py-2 text-left">Phone</th>
            <th className="px-4 py-2 text-left">Email</th>
            <th className="px-4 py-2 text-left">Role</th>
            <th className="px-4 py-2 text-left">Country</th>
            <th className="px-4 py-2 text-left">Date Registered</th>
            <th className="px-4 py-2 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {data.map((user) => (
            <tr key={user.id} className="border-t">
              <td className="px-4 py-2">{`${user.firstName || ""} ${user.lastName || ""}`}</td>
              <td className="px-4 py-2">{user.phone || "-"}</td>
              <td className="px-4 py-2">{user.email || "-"}</td>
              <td className="px-4 py-2">{user.role || "-"}</td>
              <td className="px-4 py-2">{user.country || "-"}</td>
              <td className="px-4 py-2">
                {user.dateRegistered
                  ? typeof user.dateRegistered === "string"
                    ? new Date(user.dateRegistered).toLocaleString()
                    : user.dateRegistered.seconds
                    ? new Date(user.dateRegistered.seconds * 1000).toLocaleString()
                    : "-"
                  : "-"}
              </td>
              <td className="px-4 py-2">
                <button
                  onClick={() => {
                    setUserToDelete(user);
                    setShowConfirmDelete(true);
                  }}
                  className="bg-red-100 text-red-700 font-medium px-3 py-1 rounded shadow-sm transition-all transform hover:scale-105 hover:bg-red-600 hover:text-white duration-200"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="7" className="text-center py-4 text-gray-500">
                No users found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );

  // (student table and rest of your code remain unchanged...)
  const renderStudentTable = (data) => (
  <div className="overflow-x-auto max-h-[60vh] overflow-y-auto border border-gray-200 rounded mt-2">
    <table className="table-auto w-full">
      <thead className="bg-green-600 text-white sticky top-0 z-10">
        <tr>
          <th className="px-4 py-2 text-left">Name</th>
          <th className="px-4 py-2 text-left">Phone</th>
          <th className="px-4 py-2 text-left">Email</th>
          <th className="px-4 py-2 text-left">Curriculum</th>
          <th className="px-4 py-2 text-left">Grade/Level</th>
          <th className="px-4 py-2 text-left">Country</th>
          <th className="px-4 py-2 text-left ">Date Registered</th>
          <th className="px-4 py-2 text-left">Actions</th>
        </tr>
      </thead>
      <tbody>
        {data.map((user) => (
          <tr key={user.id} className="border-t">
            <td className="px-4 py-2">{`${user.firstName || ""} ${user.lastName || ""}`}</td>
            <td className="px-4 py-2">{user.phone || "-"}</td>
            <td className="px-4 py-2">{user.email || "-"}</td>
            <td className="px-4 py-2">{user.curriculum || "-"}</td>
            <td className="px-4 py-2">{user.grade || "-"}</td>
            <td className="px-4 py-2">{user.country || "-"}</td>
            <td className="px-4 py-2 text-sm text-gray-700">
              {user.dateRegistered
                ? typeof user.dateRegistered === "string"
                  ? new Date(user.dateRegistered).toLocaleString()
                  : user.dateRegistered.seconds
                  ? new Date(user.dateRegistered.seconds * 1000).toLocaleString()
                  : "-"
                : "-"}
            </td>
            <td className="px-4 py-2">
              <button
                onClick={() => {
                  setUserToDelete(user);
                  setShowConfirmDelete(true);
                }}
                className="bg-red-100 text-red-700 font-medium px-3 py-1 rounded shadow-sm transition-all transform hover:scale-105 hover:bg-red-600 hover:text-white duration-200"
              >
                Delete
              </button>
            </td>
          </tr>
        ))}
        {data.length === 0 && (
          <tr>
            <td colSpan="8" className="text-center py-4 text-gray-500">
              No students found.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);


  return (
   <div className="relative bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-green-700">Users Management</h2>
         
        </div>
  
        <div className="flex flex-wrap gap-4 mb-6">
          {["all", "students", "teachers", "parents", "staff"].map((type) => (
            <button
              key={type}
              onClick={() => handleTabClick(type)}
              className={`px-4 py-2 rounded font-medium border ${
                activeTab === type ? "bg-green-600 text-white" : "bg-gray-100"
              }`}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
          <button
            onClick={() => {
              setShowRecentPopup(true);
              fetchUsers();
            }}
            className="px-4 py-2 rounded font-medium border bg-blue-100 text-blue-800"
          >
            Recently Logged In
          </button>
        </div>
  
        {showPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] p-6 relative">
              <button
                onClick={() => setShowPopup(false)}
                className="absolute top-3 right-3 text-red-500 text-lg"
              >
                <FaTimes />
              </button>
              <h3 className="text-lg font-bold mb-4 text-green-700">All Users Data</h3>
  
              <div className="flex justify-between items-center mb-4">
                <div className="bg-green-100 text-green-800 px-4 py-2 rounded font-medium shadow-sm">
                  Total Users: {filteredUsers.length}
                </div>
                <input
                  type="text"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={handleSearch}
                  className="border border-gray-300 px-4 py-2 rounded w-1/2 focus:outline-none focus:ring-2 focus:ring-green-400"
                />
              </div>
  
              {renderTable(filteredUsers)}
            </div>
          </div>
        )}
  {showStudentsPopup && (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] p-6 relative flex flex-col">
        <button
          onClick={() => setShowStudentsPopup(false)}
          className="absolute top-3 right-3 text-red-500 text-lg"
        >
          <FaTimes />
        </button>
        <h3 className="text-lg font-bold mb-4 text-green-700">Students Data</h3>
  
        <div className="flex justify-between items-center mb-4">
          <div className="bg-green-100 text-green-800 px-4 py-2 rounded font-medium shadow-sm">
            Total Students: {studentUsers.length}
          </div>
          <input
            type="text"
            placeholder="Search by name, email, grade, curriculum..."
            value={searchTerm}
            onChange={handleSearch}
            className="border border-gray-300 px-4 py-2 rounded w-1/2 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
        </div>
  
        {/* Scrollable content starts here */}
        <div className="overflow-y-auto flex-grow pr-2">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            {curriculumLabels.map((label) => {
              const count = studentUsers.filter(
                (s) => s.curriculum?.toLowerCase() === label.toLowerCase()
              ).length;
  
              return (
                <div
                  key={label}
                  onClick={() => setSelectedCurriculum(label)}
                  className={`cursor-pointer ${
                    selectedCurriculum === label ? "bg-indigo-300" : "bg-indigo-100"
                  } hover:bg-indigo-200 text-indigo-900 p-4 rounded-lg shadow-md text-center`}
                >
                  <h2 className="font-semibold text-lg">{label}</h2>
                  <p className="text-2xl">{count}</p>
                </div>
              );
            })}
          </div>
  
          {selectedCurriculum && (
            <div className="mb-4 flex justify-end">
              <button
                onClick={() => setSelectedCurriculum(null)}
                className="inline-flex items-center gap-2 bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-md text-sm font-medium shadow-sm transform transition-all duration-200 hover:scale-105 active:scale-95"
              >
                ✕ Clear Filter
              </button>
            </div>
          )}
  
          {/* Student table rendered here */}
          <div className="border border-gray-200 rounded">
            <table className="table-auto w-full">
              <thead className="bg-green-600 text-white sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-2 text-left">Name</th>
                  <th className="px-4 py-2 text-left">Phone</th>
                  <th className="px-4 py-2 text-left">Email</th>
                  <th className="px-4 py-2 text-left">Curriculum</th>
                  <th className="px-4 py-2 text-left">Grade/Level</th>
                  <th className="px-4 py-2 text-left">Country</th>
                  <th className="px-4 py-2 text-left">Date Registered</th>
                  <th className="px-4 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {studentUsers
                  .filter((user) => {
    const matchesSearch =
      `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase().includes(searchTerm) ||
      (user.email || "").toLowerCase().includes(searchTerm) ||
      (user.grade || "").toLowerCase().includes(searchTerm) ||
      (user.curriculum || "").toLowerCase().includes(searchTerm);
  
    const matchesCurriculum =
      !selectedCurriculum ||
      user.curriculum?.toLowerCase() === selectedCurriculum.toLowerCase();
  
    return matchesSearch && matchesCurriculum;
  })
  
                  .map((user) => (
                    <tr key={user.id} className="border-t">
                      <td className="px-4 py-2">{`${user.firstName || ""} ${
                        user.lastName || ""
                      }`}</td>
                      <td className="px-4 py-2">{user.phone || "-"}</td>
                      <td className="px-4 py-2">{user.email || "-"}</td>
                      <td className="px-4 py-2">{user.curriculum || "-"}</td>
                      <td className="px-4 py-2">{user.grade || "-"}</td>
                      <td className="px-4 py-2">{user.country || "-"}</td>
                      <td className="px-4 py-2 text-sm text-gray-700">
                        {user.dateRegistered
                          ? typeof user.dateRegistered === "string"
                            ? new Date(user.dateRegistered).toLocaleString()
                            : user.dateRegistered.seconds
                            ? new Date(user.dateRegistered.seconds * 1000).toLocaleString()
                            : "-"
                          : "-"}
                      </td>
                      <td className="px-4 py-2">
                        <button
                          onClick={() => {
                            setUserToDelete(user);
                            setShowConfirmDelete(true);
                          }}
                          className="bg-red-100 text-red-700 font-medium px-3 py-1 rounded shadow-sm transition-all transform hover:scale-105 hover:bg-red-600 hover:text-white duration-200"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                {studentUsers.length === 0 && (
                  <tr>
                    <td colSpan="8" className="text-center py-4 text-gray-500">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )}
  
  
  
        {showRecentPopup && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-5xl max-h-[90vh] p-6 overflow-y-auto relative">
              <button
                onClick={() => setShowRecentPopup(false)}
                className="absolute top-3 right-3 text-red-500 text-lg"
              >
                <FaTimes />
              </button>
              <h3 className="text-xl font-bold text-green-700 mb-2">Users Access History</h3>
  
              <h4 className="text-md font-semibold text-gray-700 mt-4">Today</h4>
              {renderTable(recentUsers.today)}
  
              <h4 className="text-md font-semibold text-gray-700 mt-4">Yesterday</h4>
              {renderTable(recentUsers.yesterday)}
  
              <h4 className="text-md font-semibold text-gray-700 mt-4">Earlier This Week</h4>
              {renderTable(recentUsers.week)}
  
              <h4 className="text-md font-semibold text-gray-700 mt-4">Long Ago</h4>
              {renderTable(recentUsers.older)}
            </div>
          </div>
        )}
  
        {showConfirmDelete && (
          <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded shadow-lg w-96 text-center">
              <h2 className="text-lg font-semibold mb-4 text-red-600">Confirm Deletion</h2>
              <p className="mb-4">
                Are you sure you want to delete{" "}
                <strong>{`${userToDelete?.firstName || ""} ${userToDelete?.lastName || ""}`}</strong>?
              </p>
              <div className="flex justify-center gap-4">
                <button
                  onClick={handleDeleteUser}
                  className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
                >
                  Yes, Delete
                </button>
                <button
                  onClick={() => {
                    setShowConfirmDelete(false);
                    setUserToDelete(null);
                  }}
                  className="bg-gray-300 text-gray-800 px-4 py-2 rounded hover:bg-gray-400"
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

export default UsersPanel;
