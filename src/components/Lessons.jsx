import React, { useEffect, useState, useRef } from "react";
import { collection, getDocs, query, where, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { getAuth } from "firebase/auth";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function Lessons() {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentClassroom, setStudentClassroom] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);

  const scrollRef = useRef(null);

  // ✅ Helper to strip HTML tags (for title only)
  const stripHtml = (html) => {
    if (!html) return "";
    const doc = new DOMParser().parseFromString(html, "text/html");
    return doc.body.textContent || "";
  };

  useEffect(() => {
    const fetchLessonsForStudent = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) throw new Error("User not authenticated");

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) throw new Error("User data not found");

        const userData = userDocSnap.data();
        const classroomName = userData.classroom;

        if (!classroomName) throw new Error("No classroom assigned to student");

        setStudentClassroom(classroomName);

        const lessonsRef = collection(db, "lessons");
        const q = query(lessonsRef, where("classroom", "==", classroomName));
        const snapshot = await getDocs(q);

        const fetchedLessons = snapshot.docs.map((doc) => {
          const data = doc.data();
          return {
            id: doc.id,
            ...data,
            createdAt: data.createdAt?.toDate?.() || new Date(),
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

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? lessons.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) => (prev === lessons.length - 1 ? 0 : prev + 1));
  };

  if (loading) return <p className="text-center mt-10">Loading lessons...</p>;
  if (!studentClassroom) return <p className="text-center text-red-600">No classroom assigned or user not authenticated.</p>;
  if (lessons.length === 0) return <p className="text-center mt-6">No lessons available for your classroom.</p>;

  const lesson = lessons[currentIndex];

  return (
    <div className="p-6 max-w-4xl mx-auto relative min-h-[110vh] md:min-h-0">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800 drop-shadow">
        Lessons for {studentClassroom}
      </h1>

      {/* ✅ Desktop / Tablet View (buttons + one lesson) */}
      <div className="relative hidden md:flex items-center justify-center">
        {/* Prev button */}
        <button
          onClick={goPrev}
          className="absolute -left-12 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-gray-100 shadow hover:bg-gray-200 transition"
        >
          <FaChevronLeft className="text-2xl text-blue-600" />
        </button>

        {/* Single lesson card */}
        <div className="border-2 border-blue-300 rounded-2xl p-6 w-full shadow-lg bg-gradient-to-br from-white to-blue-50 transition duration-300 h-[600px] flex flex-col mx-8">
          <h3 className="text-2xl font-semibold text-blue-700 mb-3 text-center">
            {stripHtml(lesson.title || lesson.writtenTitle || lesson.fileTitle) || "Untitled Lesson"}
          </h3>

          <div className="flex-1 overflow-y-auto pr-2">
            {lesson.content && (
              <div
                className="lesson-content mb-4 text-gray-700 text-justify"
                dangerouslySetInnerHTML={{ __html: lesson.content }}
              />
            )}

            {lesson.files?.length > 0 && (
              <div className="mb-4">
                <strong className="block text-gray-800 mb-1">📂 Attached Files:</strong>
                <ul className="list-disc list-inside text-gray-600">
                  {lesson.files.map((file, i) => (
                    <li key={i}>
                      <a
                        href={file.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-500 underline"
                      >
                        {file.name || `File ${i + 1}`}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <p className="text-sm text-gray-500 text-right italic mt-2">
            📅 Posted on: {lesson.createdAt.toLocaleString()}
          </p>
        </div>

        {/* Next button */}
        <button
          onClick={goNext}
          className="absolute -right-12 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-gray-100 shadow hover:bg-gray-200 transition"
        >
          <FaChevronRight className="text-2xl text-blue-600" />
        </button>
      </div>

      {/* ✅ Mobile View (swipe horizontally) */}
     <div
  ref={scrollRef}
  className="md:hidden flex overflow-x-auto space-x-2 snap-x snap-mandatory scrollbar-hide"
>
  {lessons.map((l, i) => (
    <div
      key={l.id}
      className="flex-none w-[95%] mx-auto snap-center border-2 border-blue-300 rounded-2xl p-4 shadow-lg bg-gradient-to-br from-white to-blue-50 h-[700px] flex flex-col"
    >
      <h3 className="text-2xl font-semibold text-blue-700 mb-3 text-center">
        {stripHtml(l.title || l.writtenTitle || l.fileTitle) || "Untitled Lesson"}
      </h3>

      <div className="flex-1 overflow-y-auto pr-2">
        {l.content && (
          <div
            className="lesson-content mb-4 text-gray-700 text-justify"
            dangerouslySetInnerHTML={{ __html: l.content }}
          />
        )}

        {l.files?.length > 0 && (
          <div className="mb-4">
            <strong className="block text-gray-800 mb-1">📂 Attached Files:</strong>
            <ul className="list-disc list-inside text-gray-600">
              {l.files.map((file, i) => (
                <li key={i}>
                  <a
                    href={file.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-500 underline"
                  >
                    {file.name || `File ${i + 1}`}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <p className="text-sm text-gray-500 text-right italic mt-2">
        📅 Posted on: {l.createdAt.toLocaleString()}
      </p>
    </div>
  ))}
</div>


      {/* Dots indicator (desktop only) */}
      <div className="hidden md:flex justify-center mt-4 space-x-2">
        {lessons.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${i === currentIndex ? "bg-blue-600" : "bg-gray-300"}`}
          ></div>
        ))}
      </div>

      {/* Extra CSS to fix lists inside content */}
      <style>
        {`
          .lesson-content ul { list-style-type: disc; padding-left: 1.5rem; }
          .lesson-content ol { list-style-type: decimal; padding-left: 1.5rem; }
          .lesson-content li { margin-bottom: 0.25rem; }
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
    </div>
  );
}

export default Lessons;
