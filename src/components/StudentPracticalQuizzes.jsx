import React, { useEffect, useState, useRef } from "react";
import { db } from "../firebase-config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function StudentPracticalQuizzes() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentClassroom, setStudentClassroom] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalAnswer, setModalAnswer] = useState(null);

  const scrollRef = useRef(null);

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

        // Fetch quizzes
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

  // Answer modal
  const toggleAnswer = (quizId, qid, answer) => {
    setModalAnswer(answer);
  };
  const closeModal = () => setModalAnswer(null);

  // Slider navigation
  const goPrev = () => {
    if (!scrollRef.current) return;
    const newIndex = currentIndex === 0 ? quizzes.length - 1 : currentIndex - 1;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: newIndex * width,
      behavior: "smooth",
    });
    setCurrentIndex(newIndex);
  };

  const goNext = () => {
    if (!scrollRef.current) return;
    const newIndex = currentIndex === quizzes.length - 1 ? 0 : currentIndex + 1;
    const width = scrollRef.current.clientWidth;
    scrollRef.current.scrollTo({
      left: newIndex * width,
      behavior: "smooth",
    });
    setCurrentIndex(newIndex);
  };

  // Sync currentIndex with scroll
  const handleScroll = () => {
    if (!scrollRef.current) return;
    const width = scrollRef.current.clientWidth;
    const newIndex = Math.round(scrollRef.current.scrollLeft / width);
    setCurrentIndex(newIndex);
  };

  if (loading) return <p className="text-center mt-10">Loading quizzes...</p>;
  if (!studentClassroom)
    return (
      <p className="text-center text-red-600">
        No classroom assigned or user not authenticated.
      </p>
    );
  if (quizzes.length === 0)
    return <p className="text-center mt-6">No quizzes available for your classroom.</p>;

  return (
    <div className="p-6 w-full md:max-w-4xl md:mx-auto relative min-h-[110vh] md:min-h-0">
      <h1 className="text-xl sm:text-3xl font-semibold mb-6 text-center text-blue-800 drop-shadow">
        Practical Quizzes for {studentClassroom}
      </h1>

      {/* ✅ Unified Slider */}
      <div className="relative flex items-center justify-center">
        {/* Prev button */}
        <button
          onClick={goPrev}
          className="absolute -left-12 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-gray-100 shadow hover:bg-gray-200 transition z-10"
        >
          <FaChevronLeft className="text-2xl text-blue-600" />
        </button>

        {/* Scrollable quizzes */}
        <div
          ref={scrollRef}
          onScroll={handleScroll}
          className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide w-full"
        >
          {quizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="flex-none w-full snap-center border-2 border-blue-300 rounded-2xl p-6 shadow-lg bg-gradient-to-br from-white to-blue-50 h-[600px] flex flex-col overflow-y-auto"
            >
              <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">
                {quiz.title}
              </h2>

              {quiz.questions?.map((q) => (
                <div
                  key={q.id}
                  className="border h-[450px] p-4 rounded mb-4 bg-gray-50 shadow-sm flex flex-col"
                >
                  <p className="font-medium">{q.question}</p>
                  {q.type === "image" && q.imageUrl && (
                    <img
                      src={q.imageUrl}
                      alt="Question"
                      className="mt-3 max-h-64 object-contain rounded"
                    />
                  )}
                  <div className="mt-auto flex justify-start">
                    <button
                      onClick={() => toggleAnswer(quiz.id, q.id, q.answer)}
                      className="px-4 py-2 rounded-lg bg-green-600 text-white shadow-md animate-pulse transition-all"
                    >
                      View Answer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={goNext}
          className="absolute -right-12 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-gray-100 shadow hover:bg-gray-200 transition z-10"
        >
          <FaChevronRight className="text-2xl text-blue-600" />
        </button>
      </div>

      {/* Dots indicator */}
      <div className="flex justify-center mt-4 space-x-2">
        {quizzes.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i === currentIndex ? "bg-blue-600" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>

      {/* Answer Modal */}
      {modalAnswer && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
          onClick={closeModal}
        >
          <div
            className="bg-white rounded-lg shadow-lg p-6 
                       w-[75%] sm:w-[75%] md:w-[70%] lg:w-[60%] 
                       max-w-md relative max-h-[70vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
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

      {/* Extra CSS to hide scrollbar */}
      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
    </div>
  );
}

export default StudentPracticalQuizzes;
