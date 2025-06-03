import React, { useEffect, useState } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { getAuth } from "firebase/auth";

function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentClassroom, setStudentClassroom] = useState(null);

  useEffect(() => {
    const fetchLessonsForStudent = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) throw new Error("User not authenticated");

        // Get student's classroom
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) throw new Error("User data not found");

        const userData = userDocSnap.data();
        const classroomName = userData.classroom;

        if (!classroomName) throw new Error("No classroom assigned to student");

        setStudentClassroom(classroomName);

        // Fetch lessons
        const lessonsRef = collection(db, "lessons");
        const q = query(lessonsRef, where("classroom", "==", classroomName));
        const snapshot = await getDocs(q);

        const fetchedLessons = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(), // fallback
          };
        });

        fetchedLessons.sort((a, b) => b.createdAt - a.createdAt);
        setLessons(fetchedLessons);
      } catch (error) {
        console.error("Error fetching lessons:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLessonsForStudent();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading lessons...</p>;
  if (!studentClassroom) return <p className="text-center text-red-600">No classroom assigned or user not authenticated.</p>;
  if (lessons.length === 0) return <p className="text-center mt-6">No lessons available for your classroom.</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-center">Lessons for {studentClassroom}</h1>

      {lessons.map((lesson) => (
        <div key={lesson.id} className="border rounded-md p-5 mb-6 shadow-sm bg-white">
          <h3 className="text-xl font-bold text-blue-700 mb-2">
            {lesson.title || lesson.writtenTitle || lesson.fileTitle || "Untitled Lesson"}
          </h3>

          {lesson.content && (
            <p className="mb-3 text-gray-700 whitespace-pre-wrap">
              <strong>Content:</strong> {lesson.content}
            </p>
          )}

          {lesson.files?.length > 0 && (
            <div className="mb-3">
              <strong>Attached Files:</strong>
              <ul className="list-disc list-inside text-gray-600">
                {lesson.files.map((file, i) => (
                  <li key={i}>
                    <a href={file.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 underline">
                      {file.name || `File ${i + 1}`}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-sm text-gray-500">
            Posted on: {lesson.createdAt.toLocaleString()}
          </p>
        </div>
      ))}
    </div>
  );
}

export default Lessons;
