import React, { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  orderBy,
} from "firebase/firestore";

const StudentTopicView = () => {
  const { curriculum, grade, subject, topicId } = useParams();
  const navigate = useNavigate();

  // Topic (video)
  const [topic, setTopic] = useState(null);

  // Tabs: "video" | "exam"
  const [tab, setTab] = useState("video");

  // Exams (for this topic only)
  const [exams, setExams] = useState([]);
  const [loadingExams, setLoadingExams] = useState(true);

  // Selected exam + questions
  const [selectedExam, setSelectedExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Carousel state
  const [currentIdx, setCurrentIdx] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);

  /* ----------------- fetch topic (video) ----------------- */
  useEffect(() => {
    const fetchTopic = async () => {
      const topicRef = doc(
        db,
        curriculum,
        grade,
        "subjects",
        subject,
        "topics",
        topicId
      );
      const topicSnap = await getDoc(topicRef);
      if (topicSnap.exists()) {
        setTopic(topicSnap.data());
      }
    };
    fetchTopic();
  }, [curriculum, grade, subject, topicId]);

  /* ----------------- fetch exams for this topic ----------------- */
  useEffect(() => {
    if (tab !== "exam") return;

    const fetchExams = async () => {
      try {
        setLoadingExams(true);
        const examsRef = collection(
          db,
          curriculum,
          grade,
          "subjects",
          subject,
          "topics",
          topicId,
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
  }, [tab, curriculum, grade, subject, topicId]);

  /* ----------------- open one exam (load questions) ----------------- */
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
          "topics",
          topicId,
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
    [curriculum, grade, subject, topicId]
  );

  /* ----------------- helpers ----------------- */
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

  if (!topic) return <p className="text-center mt-10">Loading topic...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Back + Tabs */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="text-sm text-gray-600 hover:text-blue-600"
        >
          ← Go Back
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("video")}
            className={`px-3 py-1 rounded text-sm font-semibold transition
              ${tab === "video" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
          >
            Video
          </button>
          <button
            onClick={() => setTab("exam")}
            className={`px-3 py-1 rounded text-sm font-semibold transition
              ${tab === "exam" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
          >
            Topical Exams
          </button>
        </div>
      </div>

      {/* ----------------- VIDEO TAB ----------------- */}
      {tab === "video" && (
        <>
          <h3 className="text-xl font-semibold mb-4">
            Now Watching: {topic.title}
          </h3>

          <video
            controls
            controlsList="nodownload"
            onContextMenu={(e) => e.preventDefault()}
            className="w-full h-64 sm:h-96 rounded-lg"
          >
            <source src={topic.videoUrl} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        </>
      )}

      {/* ----------------- EXAM TAB ----------------- */}
      {tab === "exam" && (
        <div className="mt-6">
          {/* Exams list */}
          {!selectedExam && (
            <div>
              <h2 className="text-2xl font-bold text-center mb-6 text-gray-900">
                Topical Exams for: {topic.title}
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

          {/* Exam questions carousel */}
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
                <p className="text-gray-500">No questions found for this exam.</p>
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

                  {/* Question */}
                  <div className="border rounded p-4 bg-blue-50">
                    <h3 className="font-semibold text-blue-700 mb-3">Question</h3>
                    <div
                      className="prose max-w-none"
                      dangerouslySetInnerHTML={{
                        __html: questions[currentIdx].questionHTML || "",
                      }}
                    />
                  </div>

                  {/* Answer */}
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
                            __html:
                              questions[currentIdx].answerHTML ||
                              "<em>No answer provided.</em>",
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
      )}
    </div>
  );
};

export default StudentTopicView;
