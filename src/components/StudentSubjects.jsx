import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

const StudentSubjects = () => {
  const [gradePath, setGradePath] = useState(""); // e.g., "grade_5"
  const [displayGrade, setDisplayGrade] = useState(""); // e.g., "Grade 5"
  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topics, setTopics] = useState([]);
  const [viewHistory, setViewHistory] = useState([]); // Navigation stack

  // ✅ Fetch current user's grade
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userGrade = userData.grade; // e.g., "Grade 5"

            const parts = userGrade.split(" ");
            if (parts.length === 2) {
              const formattedGrade = `grade_${parts[1]}`;
              setGradePath(formattedGrade);
              setDisplayGrade(userGrade);
            }
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // ✅ Fetch subjects once gradePath is known
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!gradePath) return;
      try {
        const subjectsRef = collection(db, "cbc", gradePath, "subjects");
        const snapshot = await getDocs(subjectsRef);
        const subjectList = snapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
        }));
        setSubjects(subjectList);
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };

    fetchSubjects();
  }, [gradePath]);

  // ✅ Fetch topics for a selected subject
  const handleSubjectClick = async (subjectId, subjectName) => {
    try {
      const topicsRef = collection(db, "cbc", gradePath, "subjects", subjectId, "topics");
      const snapshot = await getDocs(topicsRef);
      const topicList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTopics(topicList);
      setSelectedSubject(subjectName);
      setViewHistory((prev) => [...prev, "subjects"]);
    } catch (err) {
      console.error("Error fetching topics:", err);
    }
  };

  // ✅ Go Back functionality
  const handleGoBack = () => {
    if (viewHistory.length === 0) return;
    const historyCopy = [...viewHistory];
    const lastView = historyCopy.pop();
    setViewHistory(historyCopy);

    switch (lastView) {
      case "subjects":
        setSelectedSubject("");
        setTopics([]);
        break;
      default:
        break;
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      {viewHistory.length > 0 && (
        <button
          onClick={handleGoBack}
          className="mb-4 bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
        >
          ← Go Back
        </button>
      )}

      {!selectedSubject && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center">
            Subjects for {displayGrade || "your grade"}
          </h2>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {subjects.length > 0 ? (
              subjects.map((subject) => (
                <div
                  key={subject.id}
                  onClick={() => handleSubjectClick(subject.id, subject.name)}
                  className="bg-blue-100 p-4 rounded text-center font-semibold text-lg cursor-pointer hover:bg-blue-200"
                >
                  {subject.name.toUpperCase()}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full">
                No subjects available.
              </p>
            )}
          </div>
        </>
      )}

      {selectedSubject && (
        <>
          <h2 className="text-2xl font-bold mb-4 text-center">
            Topics for {selectedSubject.toUpperCase()}
          </h2>

          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
            {topics.length > 0 ? (
              topics.map((topic) => (
                <div
                  key={topic.id}
                  className="bg-green-100 p-4 rounded shadow"
                >
                  <h3 className="font-bold text-lg">{topic.title}</h3>
                  <p className="text-sm text-gray-700 mt-1">{topic.description}</p>
                  {topic.videoUrl && (
                    <video
                      controls
                      className="w-full mt-2 rounded"
                      controlsList="nodownload"
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <source src={topic.videoUrl} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  )}
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full">
                No topics available for this subject.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default StudentSubjects;
