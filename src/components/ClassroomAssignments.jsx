import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { useParams } from "react-router-dom";

function ClassroomAssignments() {
  const { classroomName } = useParams();
  const [assignments, setAssignments] = useState([]);

  useEffect(() => {
    const fetchAssignments = async () => {
      const q = collection(
        db,
        "englishLevels",
        "A2 (Elementary)",
        "subClassrooms",
        classroomName,
        "assignments"
      );
      const snap = await getDocs(q);
      const data = [];
      snap.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setAssignments(data);
    };
    fetchAssignments();
  }, [classroomName]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Assignments for {classroomName}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {assignments.map((assignment) => (
          <div
            key={assignment.id}
            className="border rounded-lg shadow-md p-4 hover:shadow-lg"
          >
            <h2 className="font-semibold text-lg">{assignment.title}</h2>
            <p className="text-gray-600">{assignment.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClassroomAssignments;
 