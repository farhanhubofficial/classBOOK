import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase-config";
import {
  collection,
  getDoc,
  getDocs,
  doc,
  query,
  where,
} from "firebase/firestore";

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentInfo, setStudentInfo] = useState(null);

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        const user = auth.currentUser;
        if (!user) {
          console.warn("User not logged in");
          return;
        }

        // 1. Get student's classroom
        const userRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userRef);

        if (!userSnap.exists()) {
          console.error("User document not found");
          return;
        }

        const userData = userSnap.data();
        const { classroom, firstName, lastName } = userData;

        setStudentInfo({ firstName, lastName, classroom });

        if (!classroom) {
          console.warn("No classroom assigned to this user.");
          return;
        }

        // 2. Fetch assignments that match classroom
        const assignmentQuery = query(
          collection(db, "assignments"),
          where("classroom", "==", classroom)
        );

        const snapshot = await getDocs(assignmentQuery);
        const assignmentsList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setAssignments(assignmentsList);
      } catch (error) {
        console.error("Error fetching assignments:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, []);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">
        {studentInfo
          ? `Assignments for ${studentInfo.classroom}`
          : "Your Assignments"}
      </h2>

      {loading ? (
        <p className="text-gray-500">Loading assignments...</p>
      ) : assignments.length === 0 ? (
        <p className="text-gray-500">No assignments available.</p>
      ) : (
        <div className="grid gap-4">
          {assignments.map((assignment) => (
            <div
              key={assignment.id}
              className="border p-4 rounded-lg shadow-sm bg-white"
            >
              <h3 className="text-lg font-semibold">
                {assignment.title}
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Posted on: {new Date(assignment.date).toLocaleDateString()}
              </p>
              {assignment.content && (
                <p className="text-gray-800 mb-2">{assignment.content}</p>
              )}
              {assignment.files.length > 0 && (
                <div>
                  <p className="font-medium">Files:</p>
                  <ul className="list-disc ml-6 text-sm text-blue-600">
                    {assignment.files.map((filename, index) => (
                      <li key={index}>{filename}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentAssignments;
