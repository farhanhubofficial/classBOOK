import React, { useEffect, useState } from "react";
import { db } from "../firebase-config";
import {
  collection,
  getDocs,
  doc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

function StudentPracticalQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentClassroom, setStudentClassroom] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [expandedAnswers, setExpandedAnswers] = useState({});
  const [modalAnswer, setModalAnswer] = useState(null);

  useEffect(() => {
    const fetchQuizzes = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;
        if (!currentUser) throw new Error("User not authenticated");

        // Get student classroom
        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);
        if (!userDocSnap.exists()) throw new Error("User data not found");

        const userData = userDocSnap.data();
        const classroomName = userData.classroom;
        setStudentClassroom(classroomName);

        // Fetch quizzes for that classroom
        const quizRef = collection(
          db,
          "englishLevels",
          "A2 (Elementary)",
          "subClassrooms",
          classroomName,
          "practicalQuizzes"
        );

        const snapshot = await getDocs(quizRef);
        const quizList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        // Order by latest first
        quizList.sort((a, b) => b.createdAt?.seconds - a.createdAt?.seconds);

        setQuizzes(quizList);
      } catch (err) {
        console.error("Error fetching quizzes:", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchQuizzes();
  }, []);

  const toggleAnswer = (quizId, qid, answer) => {
    // Always just open the modal
    setModalAnswer(answer);
  };

  const closeModal = () => setModalAnswer(null);

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % quizzes.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + quizzes.length) % quizzes.length);
  };

  if (loading) return <p>Loading quizzes...</p>;
  if (!studentClassroom) return <p>No classroom assigned or user not authenticated.</p>;
  if (quizzes.length === 0) return <p>No quizzes available for your classroom.</p>;

  const currentQuiz = quizzes[currentSlide];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-center mb-6">
        Practical Quizzes for {studentClassroom}
      </h1>

      <div className="relative max-w-3xl mx-auto">
        {/* Slider Controls */}
        <button
          onClick={prevSlide}
          className="absolute left-0 top-1/2 -translate-y-1/2 bg-gray-700 text-white px-3 py-2 rounded-full"
        >
          ‹
        </button>
        <button
          onClick={nextSlide}
          className="absolute right-0 top-1/2 -translate-y-1/2 bg-gray-700 text-white px-3 py-2 rounded-full"
        >
          ›
        </button>

        <div className="border rounded shadow-md p-6 bg-white h-[600px] overflow-y-auto">
          <h2 className="text-xl font-semibold mb-4">{currentQuiz.title}</h2>

          {currentQuiz.questions?.map((q, idx) => {
            return (
<div
  key={q.id}
  className="border h-[370px] p-4 rounded mb-4 bg-gray-50 shadow-sm flex flex-col"
>
  <p className="font-medium">
    {q.question}
  </p>

  {q.type === "image" && q.imageUrl && (
    <img
      src={q.imageUrl}
      alt="Question"
      className="mt-3 max-h-64 object-contain rounded"
    />
  )}

  <div className="mt-auto flex justify-start">
    <button
      onClick={() => toggleAnswer(currentQuiz.id, q.id, q.answer)}
      className="px-4 py-2 rounded-lg bg-green-600 text-white shadow-md animate-pulse transition-all"
    >
      View Answer
    </button>
  </div>
</div>


            );
          })}
        </div>

        {/* Slide indicator */}
        <p className="text-center mt-4 text-gray-600">
          Quiz {currentSlide + 1} of {quizzes.length}
        </p>
      </div>

      {/* Answer Modal */}
{/* Answer Modal */}
{/* Answer Modal */}
{modalAnswer && (
  <div
    className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
    onClick={closeModal} // closes when clicking outside
  >
    <div
      className="bg-white rounded-lg shadow-lg p-6 
                 w-[75%] sm:w-[75%] md:w-[70%] lg:w-[60%] 
                 max-w-md relative max-h-[70vh] overflow-y-auto"
      onClick={(e) => e.stopPropagation()} // prevent closing when clicking inside
    >
      <button
        onClick={closeModal}
        className="absolute top-2 right-2 text-gray-600 hover:text-black"
      >
        ✕
      </button>
      <h3 className="text-lg font-semibold mb-3">Answer</h3>
      <p className="text-green-700 whitespace-pre-wrap">{modalAnswer}</p>
    </div>
  </div>
)}



    </div>
  );
}

export default StudentPracticalQuizzes;
