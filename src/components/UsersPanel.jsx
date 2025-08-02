import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";

const UsersPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("all");
  const [showPopup, setShowPopup] = useState(false);
  const [showRecentPopup, setShowRecentPopup] = useState(false);
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [recentUsers, setRecentUsers] = useState({ today: [], yesterday: [], week: [], older: [] });
  const [searchTerm, setSearchTerm] = useState("");

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

      const now = new Date();
      const today = [], yesterday = [], week = [], older = [];

      usersData.forEach((user) => {
        if (!user.lastLogin) return;

        const timestamp = typeof user.lastLogin === "object" && user.lastLogin.seconds
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
    }
  };

  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    const filtered = users.filter((user) =>
      `${user.firstName || ""} ${user.lastName || ""}`.toLowerCase().includes(term) ||
      (user.email || "").toLowerCase().includes(term)
    );
    setFilteredUsers(filtered);
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
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td colSpan="6" className="text-center py-4 text-gray-500">
                No users found.
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
        <button onClick={onClose} className="text-red-500 text-xl">
          <FaTimes />
        </button>
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
    </div>
  );
};

export default UsersPanel;
