import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  writeBatch,
} from "firebase/firestore";
import TopicExamEditor from "./TopicExamEditor";

const TopicView = () => {
  const { grade, subject, topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const [tab, setTab] = useState("video");

  // Exams state
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState(null);
  const [examQuestions, setExamQuestions] = useState([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);

  // Editor states
  const [showExamEditor, setShowExamEditor] = useState(false);
  const [editorExam, setEditorExam] = useState(null); // { id, title, questions }

  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopic = async () => {
      const topicRef = doc(db, "cbc", grade, "subjects", subject, "topics", topicId);
      const topicSnap = await getDoc(topicRef);
      if (topicSnap.exists()) setTopic(topicSnap.data());
    };
    fetchTopic();
  }, [grade, subject, topicId]);

  useEffect(() => {
    if (tab === "exam") fetchExams();
  }, [tab]); // eslint-disable-line react-hooks/exhaustive-deps

  const fetchExams = async () => {
    try {
      const examsRef = collection(
        db,
        "cbc",
        grade,
        "subjects",
        subject,
        "topics",
        topicId,
        "exams"
      );
      const snapshot = await getDocs(examsRef);
      setExams(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
    } catch (err) {
      console.error("Failed to fetch exams:", err);
    }
  };

  const fetchExamQuestions = async (examId) => {
    setLoadingQuestions(true);
    try {
      const questionsRef = collection(
        db,
        "cbc",
        grade,
        "subjects",
        subject,
        "topics",
        topicId,
        "exams",
        examId,
        "questions"
      );
      const snapshot = await getDocs(questionsRef);
      const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
      list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
      setExamQuestions(list);
    } catch (e) {
      console.error("Failed to fetch exam questions:", e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  const getExamQuestionsForEditor = async (examId) => {
    const questionsRef = collection(
      db,
      "cbc",
      grade,
      "subjects",
      subject,
      "topics",
      topicId,
      "exams",
      examId,
      "questions"
    );
    const snapshot = await getDocs(questionsRef);
    const list = snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
    list.sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
    return list;
  };

  const openExam = async (exam) => {
    setSelectedExam(exam);
    await fetchExamQuestions(exam.id);
  };

  const handleEditExam = async (exam) => {
    const qs = await getExamQuestionsForEditor(exam.id);
    setEditorExam({
      id: exam.id,
      title: exam.title || exam.id,
      questions: qs,
    });
    setShowExamEditor(true);
    setSelectedExam(null);
  };

  const deleteExam = async (examId) => {
    if (!window.confirm("Delete this exam and its questions?")) return;
    try {
      const questionsRef = collection(
        db,
        "cbc",
        grade,
        "subjects",
        subject,
        "topics",
        topicId,
        "exams",
        examId,
        "questions"
      );
      const qSnap = await getDocs(questionsRef);
      const batch = writeBatch(db);
      qSnap.forEach((docSnap) => batch.delete(docSnap.ref));
      await batch.commit();

      const examRef = doc(
        db,
        "cbc",
        grade,
        "subjects",
        subject,
        "topics",
        topicId,
        "exams",
        examId
      );
      await deleteDoc(examRef);

      alert("Exam deleted.");
      setSelectedExam(null);
      setExamQuestions([]);
      fetchExams();
    } catch (e) {
      console.error("Failed to delete exam:", e);
      alert("Failed to delete exam");
    }
  };

  if (!topic) return <p className="text-center mt-10">Loading topic...</p>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Top bar */}
      <div className="flex items-center justify-between mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
        >
          ← Go Back
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setTab("video")}
            className={`px-3 py-1 rounded text-sm font-semibold transition
              ${tab === "video" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
          >
            Topical Video
          </button>
          <button
          onClick={() => setTab("exam")}
          className={`px-3 py-1 rounded text-sm font-semibold transition
            ${tab === "exam" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800 hover:bg-gray-300"}`}
          >
            Topical Exam
          </button>
        </div>
      </div>

      {tab === "video" ? (
        <>
          <h3 className="text-xl font-semibold mb-4">Now Watching: {topic.title}</h3>
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
      ) : (
        <div className="space-y-4">
          {/* ADD / EDIT EXAM */}
          {showExamEditor && (
            <TopicExamEditor
              grade={grade}
              subject={subject}
              topicId={topicId}
              examId={editorExam?.id || null}
              initialTitle={editorExam?.title || ""}
              initialQuestions={editorExam?.questions || []}
              onClose={() => {
                setShowExamEditor(false);
                setEditorExam(null);
                fetchExams();
              }}
            />
          )}

          {/* LIST + ADD BUTTON (only when not inside editor or a selected exam) */}
          {!showExamEditor && !selectedExam && (
            <>
              <button
                onClick={() => {
                  setEditorExam(null);
                  setShowExamEditor(true);
                }}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                ➕ Add Topical Exam
              </button>

              <h3 className="text-xl font-bold mb-4">Exams for {topic.title}</h3>

              {exams.length === 0 ? (
                <p className="text-gray-500">No exams available.</p>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {exams.map((exam) => (
                    <div
                      key={exam.id}
                      className="border p-4 rounded-lg bg-gray-50 shadow hover:shadow-md"
                    >
                      <div className="flex items-start justify-between">
                        <div
                          className="flex-1 cursor-pointer"
                          onClick={() => openExam(exam)}
                        >
                          <h4 className="font-semibold text-lg">
                            {exam.title || exam.id}
                          </h4>
                        </div>

                        <div className="flex gap-2 ml-2">
                          <button
                            onClick={() => handleEditExam(exam)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Edit"
                          >
                            ✏️
                          </button>
                          <button
                            onClick={() => deleteExam(exam.id)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}

          {/* READ-ONLY EXAM DETAILS */}
          {selectedExam && !showExamEditor && (
            <div>
              <button
                onClick={() => {
                  setSelectedExam(null);
                  setExamQuestions([]);
                }}
                className="mb-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded"
              >
                ← Back to Exams
              </button>
              <h3 className="text-xl font-bold mb-4">{selectedExam.title}</h3>
              {loadingQuestions ? (
                <p>Loading questions...</p>
              ) : examQuestions.length === 0 ? (
                <p>No questions available for this exam.</p>
              ) : (
                <div className="space-y-4">
                  {examQuestions.map((q, i) => (
                    <div key={q.id} className="border p-4 rounded bg-white shadow-sm">
                      <h4 className="font-semibold text-blue-600">Question {i + 1}</h4>
                      <div
                        className="prose max-w-none"
                        dangerouslySetInnerHTML={{ __html: q.questionHTML }}
                      />
                      {q.answerHTML && (
                        <div className="mt-2 p-2 bg-gray-100 rounded">
                          <h5 className="font-semibold text-green-700">Answer:</h5>
                          <div
                            className="prose max-w-none"
                            dangerouslySetInnerHTML={{ __html: q.answerHTML }}
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TopicView;
