import React, { useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { db } from "../firebase-config";
import { collection, getDocs } from "firebase/firestore";
import StudentExamView from "./StudentExamView"; // 🆕 Import the exam view

const StudentSubjectView = () => {
  const { curriculum, grade, subject } = useParams();
  const [topics, setTopics] = useState([]);
  const [view, setView] = useState("topics"); // 🆕 state to toggle view
  const navigate = useNavigate();
  const location = useLocation();

  const isStudent = location.pathname.startsWith("/students");

  useEffect(() => {
    const fetchTopics = async () => {
      try {
        const topicsRef = collection(
          db,
          curriculum,
          grade,
          "subjects",
          subject,
          "topics"
        );
        const snapshot = await getDocs(topicsRef);
        const topicList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setTopics(topicList);
      } catch (error) {
        console.error("Error fetching topics:", error);
      }
    };

    if (view === "topics") {
      fetchTopics();
    }
  }, [curriculum, grade, subject, view]);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="mb-6 flex justify-between items-center">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          ← Go Back
        </button>

        {/* 🆕 View toggle buttons */}
        <div className="flex gap-3">
          <button
            onClick={() => setView("topics")}
            className={`px-4 py-2 rounded font-semibold ${
              view === "topics"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {subject.toUpperCase()} Topics
          </button>
          <button
            onClick={() => setView("exams")}
            className={`px-4 py-2 rounded font-semibold ${
              view === "exams"
                ? "bg-blue-600 text-white"
                : "bg-gray-200 text-gray-800"
            }`}
          >
            {subject.toUpperCase()} Exams
          </button>
        </div>
      </div>

      {/* 🧠 Render Topics or Exams */}
      {view === "topics" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {topics.map((topic) => (
              <div
                key={topic.id}
                className="border p-4 rounded-lg hover:bg-blue-50 cursor-pointer"
                onClick={() =>
                  navigate(
                    `${isStudent ? "/students" : "/admin"}/curriculum/${curriculum}/${grade}/${subject}/${topic.id}`
                  )
                }
              >
                <h4 className="font-semibold text-lg">{topic.title}</h4>
                <p className="text-sm text-gray-600">{topic.description}</p>
                {topic.videoUrl && (
                  <div className="mt-2 aspect-video overflow-hidden rounded">
                    <video className="w-full h-full object-cover" controls>
                      <source src={topic.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {view === "exams" && (
        <div className="mt-4">
          <StudentExamView />
        </div>
      )}
    </div>
  );
};

export default StudentSubjectView;
