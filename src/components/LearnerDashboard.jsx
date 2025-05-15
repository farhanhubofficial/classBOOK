import React, { useState, useEffect } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { Line, Bar } from "react-chartjs-2";
import "chart.js/auto";

function LearnerDashboard() {
  const [userData, setUserData] = useState(null);
  const [date, setDate] = useState(new Date());
  const [present, setPresent] = useState(false);
  const [buttonDisabled, setButtonDisabled] = useState(false);
  const [googleMeetLink, setGoogleMeetLink] = useState("");

  const [attendance, setAttendance] = useState({
    presentDays: 18,
    absentDays: 2,
    totalDuration: 30,
    lastPresentTimestamp: null,
  });

  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const docRef = doc(db, "users", currentUser.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          const data = docSnap.data();
          setUserData(data);
          setAttendance({
            presentDays: data.daysPresent || 0,
            absentDays: data.daysAbsent || 0,
            totalDuration: data.courseDuration || 0,
            lastPresentTimestamp: data.lastPresentTimestamp || null,
          });
          checkAttendanceStatus(data.lastPresentTimestamp, data.daysAbsent);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  const checkAttendanceStatus = async (lastTimestamp, currentAbsent) => {
    if (!lastTimestamp) {
      setButtonDisabled(false);
      return;
    }

    const now = new Date();
    const lastPresentTime = new Date(lastTimestamp);
    const timeDiff = now - lastPresentTime;

    if (timeDiff >= 34 * 60 * 60 * 1000) {
      await markAsAbsent(currentAbsent);
      setButtonDisabled(false);
    } else if (timeDiff >= 22 * 60 * 60 * 1000) {
      setButtonDisabled(false);
    } else {
      setButtonDisabled(true);
    }
  };

  const markAsPresent = async () => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const userSnap = await getDoc(userRef);
    if (userSnap.exists()) {
      const currentPresent = userSnap.data().daysPresent || 0;
      const updatedPresent = currentPresent + 1;
      const currentTime = new Date().toISOString();

      await setDoc(
        userRef,
        { daysPresent: updatedPresent, lastPresentTimestamp: currentTime },
        { merge: true }
      );

      setAttendance((prev) => ({
        ...prev,
        presentDays: updatedPresent,
        lastPresentTimestamp: currentTime,
      }));

      setPresent(true);
      setButtonDisabled(true);
    }
  };

  const markAsAbsent = async (currentAbsent) => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const updatedAbsent = (currentAbsent || 0) + 1;

    await setDoc(userRef, { daysAbsent: updatedAbsent }, { merge: true });

    setAttendance((prev) => ({
      ...prev,
      absentDays: updatedAbsent,
    }));
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  const daysLeft =
    attendance.totalDuration - (attendance.presentDays + attendance.absentDays);

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
          {getGreeting()},{" "}
          <span className="text-green-600">{userData?.firstName || "Learner"}</span> 👋
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white p-6 rounded shadow overflow-auto">
            <h2 className="text-xl font-semibold mb-4">📅 Calendar</h2>

            <div className="md:flex gap-6">
              <div className="flex-shrink-0">
                <Calendar onChange={setDate} value={date} />
              </div>

              {/* Styled Google Meet Input Section */}
              <div className="mt-4 md:mt-0 md:ml-4 w-full">
                <label className="block text-gray-800 font-semibold text-sm mb-2 tracking-wide">
                  Google Meet Link
                </label>

                <textarea
                  rows={2}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-gray-700 placeholder-gray-400"
                  placeholder="Paste or find your Google Meet link here..."
                  value={googleMeetLink}
                  onChange={(e) => setGoogleMeetLink(e.target.value)}
                />

                {googleMeetLink.includes("https://meet.google.com") && (
                  <div className="mt-2">
                    <a
                      href={googleMeetLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block text-green-600 hover:underline font-medium text-sm transition-colors"
                    >
                      🔗 Open Meet 
                    </a>
                  </div>
                )}
              </div>
            </div>

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
                onClick={markAsPresent}
                disabled={buttonDisabled}
                className={`px-6 py-2 text-white font-medium rounded transition-colors ${
                  present || buttonDisabled ? "bg-green-600" : "bg-gray-700"
                }`}
              >
                {present || buttonDisabled
                  ? "Marked as Present ✅"
                  : "Mark Present"}
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded shadow overflow-auto">
            <h2 className="text-xl font-semibold mb-4">📈 Attendance Trend</h2>
            <div className="w-full max-w-full">
              <Line data={attendanceData} />
            </div>
          </div>
        </div>

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
