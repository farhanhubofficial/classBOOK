import React, { useEffect, useState } from "react";
import { db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";

function StudentAssignments({ studentId, classroomName }) {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAssignments = async () => {
      try {
        // Fetch the specific student document by studentId
        const studentRef = doc(db, "users", studentId);
        const studentSnap = await getDoc(studentRef);

        if (studentSnap.exists()) {
          const studentData = studentSnap.data();

          // Check if student has assignments
          if (studentData.assignments) {
            // Filter assignments based on the classroom name
            const classroomAssignments = studentData.assignments.filter(
              assignment => assignment.classroom === classroomName
            );
            setAssignments(classroomAssignments);
          } else {
            setError("No assignments found for this student.");
          }
        } else {
          setError("Student not found");
        }
      } catch (err) {
        setError("Failed to fetch assignments");
        console.error("Error fetching assignments:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignments();
  }, [studentId, classroomName]);

  if (loading) return <p className="text-center text-gray-500">Loading assignments...</p>;
  if (error) return <p className="text-center text-gray-500">{error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
      <h2 className="text-3xl font-bold mb-6 text-gray-800 text-center">
        My Assignments
      </h2>

      {assignments.length === 0 ? (
        <p className="text-center text-gray-500">No assignments found for this classroom.</p>
      ) : (
        <div className="space-y-6">
          {assignments.map((assignment, idx) => (
            <div
              key={idx}
              className="border border-gray-200 rounded-md p-5 hover:shadow-md transition duration-200"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {assignment.title}
              </h3>

              {assignment.content && (
                <p className="text-gray-700 mb-3 whitespace-pre-line">
                  {assignment.content}
                </p>
              )}

              {assignment.files && assignment.files.length > 0 && (
                <div className="mb-3">
                  <h4 className="font-semibold text-gray-800 mb-1">
                    Attached Files:
                  </h4>
                  <ul className="list-disc list-inside text-blue-600">
                    {assignment.files.map((fileName, index) => (
                      <li key={index}>{fileName}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="text-sm text-gray-500">
                Assigned on:{" "}
                {new Date(assignment.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentAssignments;
