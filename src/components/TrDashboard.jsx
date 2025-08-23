import React, { useEffect, useState } from "react";
import { getAuth } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { FaChartBar, FaUsers } from "react-icons/fa"; // ✅ react-icons for buttons

function TrDashboard() {
  const [userData, setUserData] = useState(null);
  const [selectedChart, setSelectedChart] = useState("activity");
  const auth = getAuth();

  useEffect(() => {
    const fetchUser = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const userRef = doc(db, "users", currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
    };
    fetchUser();
  }, [auth]);

  // ✅ Format Dates
  const today = new Date();
  const formattedToday = today.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  const registeredDate = userData?.dateRegistered?.toDate
    ? userData.dateRegistered.toDate().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      })
    : "Loading...";

  // ✅ Mock Graph Data
  const studentData = [
    { curriculum: "CBC", students: 45 },
    { curriculum: "IGCSE", students: 30 },
    { curriculum: "English", students: 25 },
    { curriculum: "Arabic", students: 20 },
    { curriculum: "Somali", students: 15 },
  ];

  const activityData = [
    { name: "Jan", performance: 60 },
    { name: "Feb", performance: 80 },
    { name: "Mar", performance: 70 },
    { name: "Apr", performance: 90 },
  ];

  return (
    <div className="p-6 space-y-6 bg-gray-50 min-h-screen">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-green-700">
          Welcome back, Teacher {userData?.firstName || "Loading..."} 👋
        </h1>
      </div>

      {/* Dates Row */}
      <div className="flex justify-between items-center bg-white shadow p-4 rounded-lg">
        <p className="text-gray-700 font-medium">{formattedToday}</p>
        <p className="text-gray-500 text-sm">
          Registered on: <span className="font-semibold">{registeredDate}</span>
        </p>
      </div>

      {/* Buttons to Switch Charts */}
      <div className="flex gap-4">
        <button
          onClick={() => setSelectedChart("activity")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
            selectedChart === "activity"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          <FaChartBar /> Activity Performance
        </button>
        <button
          onClick={() => setSelectedChart("students")}
          className={`flex items-center gap-2 px-4 py-2 rounded-md transition ${
            selectedChart === "students"
              ? "bg-green-600 text-white"
              : "bg-gray-200 text-gray-800 hover:bg-gray-300"
          }`}
        >
          <FaUsers /> Students by Curriculum
        </button>
      </div>

      {/* Chart */}
      <div className="bg-white p-6 rounded-lg shadow-md h-96">
        <ResponsiveContainer width="100%" height="100%">
          {selectedChart === "activity" ? (
            <BarChart data={activityData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="performance" fill="#16a34a" />
            </BarChart>
          ) : (
            <BarChart data={studentData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="curriculum" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="students" fill="#2563eb" />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>

      {/* Extra Dashboard Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold text-green-700">Attendance</h2>
          <p className="text-gray-600 mt-2">
            Present Days: {userData?.daysPresent || 0}
          </p>
          <p className="text-gray-600">
            Absent Days: {userData?.daysAbsent || 0}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold text-green-700">Courses</h2>
          <p className="text-gray-600 mt-2">
            {userData?.curriculum?.join(", ") || "Loading..."}
          </p>
        </div>

        <div className="bg-white shadow-md rounded-lg p-4">
          <h2 className="text-lg font-semibold text-green-700">Role</h2>
          <p className="text-gray-600 mt-2">{userData?.role || "Teacher"}</p>
        </div>
      </div>
    </div>
  );
}

export default TrDashboard;
