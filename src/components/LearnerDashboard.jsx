import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";

function LearnerDashboard() {
  const [userData, setUserData] = useState(null);
  const [date, setDate] = useState(new Date());
  const [present, setPresent] = useState(false);

  const [attendance, setAttendance] = useState({
    presentDays: 18,
    absentDays: 2,
    totalDuration: 30,
  });

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setUserData(docSnap.data());
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const daysLeft = attendance.totalDuration - (attendance.presentDays + attendance.absentDays);

  const attendanceData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
    datasets: [
      {
        label: "Attendance",
        data: [4, 5, 4, 5],
        fill: false,
        borderColor: "green",
        tension: 0.4,
      },
    ],
  };

  const assignmentsData = {
    labels: ["Submitted", "Not Submitted"],
    datasets: [
      {
        label: "Assignments",
        data: [6, 2],
        backgroundColor: ["#34d399", "#f87171"],
      },
    ],
  };

  return (
    <div className="p-4 sm:p-6 bg-gray-100 min-h-screen font-sans overflow-x-hidden">
      <div className="container mx-auto">
        <h1 className="text-2xl font-bold mb-4">
          {getGreeting()}, <span className="text-green-600">{userData?.firstName || "Learner"}</span> 👋
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Calendar and Attendance */}
          <div className="bg-white p-6 rounded shadow overflow-auto">
            <h2 className="text-xl font-semibold mb-4">📅 Calendar</h2>
            <Calendar onChange={setDate} value={date} />

            <div className="mt-6 grid grid-cols-2 gap-4">
              <div className="bg-gray-50 p-4 rounded shadow-sm">
                <p className="font-medium text-gray-700">Days Present</p>
                <p className="text-green-600 text-xl">{attendance.presentDays}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded shadow-sm">
                <p className="font-medium text-gray-700">Days Absent</p>
                <p className="text-red-500 text-xl">{attendance.absentDays}</p>
              </div>
              <div className="bg-gray-50 p-4 rounded shadow-sm col-span-2">
                <p className="font-medium text-gray-700">Course Duration</p>
                <p className="text-gray-800 text-lg">{attendance.totalDuration} days</p>
                <p className="text-blue-600 text-sm">Days Left: {daysLeft}</p>
              </div>
            </div>

            <div className="text-center mt-6">
              <button
                onClick={() => setPresent(!present)}
                className={`px-6 py-2 text-white font-medium rounded transition-colors ${
                  present ? "bg-green-600" : "bg-gray-700"
                }`}
              >
                {present ? "Marked as Present ✅" : "Mark Present"}
              </button>
            </div>
          </div>

          {/* Attendance Chart */}
          <div className="bg-white p-6 rounded shadow overflow-auto">
            <h2 className="text-xl font-semibold mb-4">📈 Attendance Trend</h2>
            <div className="w-full max-w-full">
              <Line data={attendanceData} />
            </div>
          </div>
        </div>

        {/* Assignment Submission Chart */}
        <div className="mt-6 bg-white p-6 rounded shadow overflow-auto">
          <h2 className="text-xl font-semibold mb-4">📚 Assignment Submissions</h2>
          <div className="w-full max-w-full">
            <Bar data={assignmentsData} />
          </div>
        </div>
      </div>
    </div>
  );
}

export default LearnerDashboard;
