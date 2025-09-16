import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { useParams } from "react-router-dom";

function ClassroomLessons() {
  const { classroomName } = useParams();
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    const fetchLessons = async () => {
      const q = collection(
        db,
        "english",
        "A2 (Elementary)",
        "subClassrooms",
        classroomName,
        "lessons"
      );
      const snap = await getDocs(q);
      const data = [];
      snap.forEach((doc) => data.push({ id: doc.id, ...doc.data() }));
      setLessons(data);
    };
    fetchLessons();
  }, [classroomName]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">
        Lessons for {classroomName}
      </h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="border rounded-lg shadow-md p-4 hover:shadow-lg"
          >
            <h2 className="font-semibold text-lg">{lesson.title}</h2>
            <p className="text-gray-600">{lesson.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export default ClassroomLessons;
