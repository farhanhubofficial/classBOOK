import React, { useEffect, useState, useCallback } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase-config";
import {
  collection,
  getDocs,
  query,
  orderBy,
  doc,
} from "firebase/firestore";

const StudentExamView = () => {
  const { curriculum, grade, subject } = useParams();

  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);

  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  // ---------- Fetch all exams ----------
  useEffect(() => {
    const fetchExams = async () => {
      try {
        setLoadingExams(true);
        const examsRef = collection(
          db,
          curriculum,
          grade,
          "subjects",
          subject,
          "exams"
        );
        const snapshot = await getDocs(examsRef);
        const examList = snapshot.docs.map((d) => ({
          id: d.id,
          ...d.data(),
        }));
        setExams(examList);
      } catch (err) {
        console.error("Error fetching exams:", err);
      } finally {
        setLoadingExams(false);
      }
    };

    fetchExams();
  }, [curriculum, grade, subject]);

  // ---------- Fetch questions of one exam ----------
  const openExam = useCallback(
    async (exam) => {
      setSelectedExam(exam);
      setLoadingQuestions(true);
      setQuestions([]);
      setCurrentIdx(0);
      setShowAnswer(false);

      try {
        const questionsRef = collection(
          db,
          curriculum,
          grade,
          "subjects",
          subject,
          "exams",
          exam.id,
          "questions"
        );
        const qRef = query(questionsRef, orderBy("order", "asc"));
        const snap = await getDocs(qRef);
        const qs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        setQuestions(qs);
      } catch (e) {
        console.error("Failed to fetch exam questions:", e);
      } finally {
        setLoadingQuestions(false);
      }
    },
    [curriculum, grade, subject]
  );

  const backToList = () => {
    setSelectedExam(null);
    setQuestions([]);
    setCurrentIdx(0);
    setShowAnswer(false);
  };

  const goNext = () => {
    if (currentIdx < questions.length - 1) {
      setCurrentIdx((i) => i + 1);
      setShowAnswer(false);
    }
  };

  const goPrev = () => {
    if (currentIdx > 0) {
      setCurrentIdx((i) => i - 1);
      setShowAnswer(false);
    }
  };

  const toggleAnswer = () => setShowAnswer((s) => !s);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* --- Exams list --- */}
      {!selectedExam && (
        <div>
          <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
            Exams
          </h2>

          {loadingExams ? (
            <p className="text-gray-500 text-center">Loading exams…</p>
          ) : exams.length === 0 ? (
            <p className="text-gray-500 text-center">No exams found.</p>
          ) : (
            <div className="space-y-3">
              {exams.map((exam) => (
                <button
                  key={exam.id}
                  onClick={() => openExam(exam)}
                  className="w-full text-left p-4 rounded border shadow-sm bg-white hover:bg-blue-50 transition"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-lg text-blue-700">
                      {exam.title || exam.id}
                    </span>
                    <span className="text-xs text-gray-500">
                      {exam.createdAt?.toDate?.().toLocaleString?.() || ""}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* --- Exam questions carousel --- */}
      {selectedExam && (
        <div className="mt-6">
          <div className="flex items-center justify-between mb-4">
          <button
              onClick={backToList}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
            >
              ← Back to Exams
            </button>

            <h2 className="text-xl font-bold text-gray-900">
              {selectedExam.title || selectedExam.id}
            </h2>

            <div className="w-[110px]" /> {/* spacer */}
          </div>

          {loadingQuestions ? (
            <p className="text-gray-500">Loading questions…</p>
          ) : questions.length === 0 ? (
            <p className="text-gray-500">
              No questions found for this exam.
            </p>
          ) : (
            <div className="bg-white border shadow-md rounded-lg p-6">
              {/* Progress */}
              <div className="mb-4 flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  Question {currentIdx + 1} of {questions.length}
                </span>

                <div className="flex gap-2">
                  <button
                    onClick={goPrev}
                    disabled={currentIdx === 0}
                    className="px-3 py-1 rounded disabled:opacity-50 bg-gray-100 hover:bg-gray-200"
                  >
                    ← Prev
                  </button>
                  <button
                    onClick={goNext}
                    disabled={currentIdx === questions.length - 1}
                    className="px-3 py-1 rounded disabled:opacity-50 bg-blue-600 text-white hover:bg-blue-700"
                  >
                    Next →
                  </button>
                </div>
              </div>

              {/* Question Card */}
              <div className="border rounded p-4 bg-blue-50">
                <h3 className="font-semibold text-blue-700 mb-3">
                  Question
                </h3>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{
                    __html: questions[currentIdx].questionHTML || "",
                  }}
                />
              </div>

              {/* Answer toggle */}
              <div className="mt-4">
                <button
                  onClick={toggleAnswer}
                  className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
                >
                  {showAnswer ? "Hide answer" : "View answer"}
                </button>

                {showAnswer && (
                  <div className="mt-3 p-4 border rounded bg-green-50">
                    <h4 className="font-semibold text-green-700 mb-2">
                      Answer
                    </h4>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: questions[currentIdx].answerHTML || "<em>No answer provided.</em>",
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default StudentExamView;
