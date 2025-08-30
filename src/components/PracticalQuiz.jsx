import React, { useState } from "react";
import { db, storage } from "../firebase-config";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { useNavigate, useParams } from "react-router-dom"; // ✅ added useParams

const randomId = () => Math.random().toString(36).slice(2);

const PracticalQuiz = ({ classroomName: propClassroomName }) => {
  const navigate = useNavigate();
  const { classroomName: paramClassroomName } = useParams(); // ✅ from URL
  const classroomName = propClassroomName || paramClassroomName; // ✅ fallback

  const [mode, setMode] = useState("text"); // "text" or "image"
  const [questions, setQuestions] = useState([
    { id: randomId(), type: "text", question: "", answer: "", imageUrl: "" },
  ]);
  const [saving, setSaving] = useState(false);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: randomId(), type: mode, question: "", answer: "", imageUrl: "" },
    ]);
  };

  const updateQuestion = (id, field, value) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, [field]: value } : q))
    );
  };

  const handleImageUpload = async (file, qid) => {
    if (!file) return;
    const path = `practicalQuizzes/${classroomName || "unknown"}/${randomId()}-${file.name}`;
    const storageRef = ref(storage, path);
    await uploadBytes(storageRef, file);
    const url = await getDownloadURL(storageRef);
    updateQuestion(qid, "imageUrl", url);
  };

  const saveQuiz = async () => {
    if (!classroomName) {
      alert("❌ Classroom name is missing. Cannot save quiz.");
      console.error("classroomName is undefined");
      return;
    }

    const filtered = questions.filter(
      (q) =>
        (q.question && q.question.trim()) ||
        (q.answer && q.answer.trim()) ||
        q.imageUrl
    );
    if (filtered.length === 0) {
      alert("Please add at least one valid question.");
      return;
    }

    setSaving(true);
    try {
      // fetch learners in this classroom
      const usersQuery = query(
        collection(db, "users"),
        where("role", "==", "learner"),
        where("classroom", "==", classroomName)
      );
      const learnerSnap = await getDocs(usersQuery);
      const learners = learnerSnap.docs.map((doc) => {
        const { firstName, lastName, email } = doc.data();
        return { id: doc.id, firstName, lastName, email };
      });

      // lesson/exam-like payload
      const quizData = {
        questions: filtered,
        createdAt: Timestamp.now(),
        date: new Date().toISOString(),
        classroom: classroomName,
        category: "learner",
        students: learners,
      };

      await addDoc(
        collection(
          db,
          "englishLevels",
          "A2 (Elementary)",
          "subClassrooms",
          classroomName,
          "practicalQuizzes"
        ),
        quizData
      );

      alert("Practical quiz saved!");
      navigate(-1);
    } catch (e) {
      console.error("❌ Failed to save quiz:", e);
      alert("Failed to save quiz.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Upload Practical Quiz
      </h2>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-gray-600 text-white px-4 py-2 rounded"
      >
        ← Back
      </button>

      {/* Mode Switcher */}
      <div className="flex gap-3 mb-6">
        <button
          className={`px-4 py-2 rounded ${
            mode === "text" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => {
            setMode("text");
            setQuestions([
              { id: randomId(), type: "text", question: "", answer: "" },
            ]);
          }}
        >
          Text Questions
        </button>
        <button
          className={`px-4 py-2 rounded ${
            mode === "image" ? "bg-green-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => {
            setMode("image");
            setQuestions([
              {
                id: randomId(),
                type: "image",
                question: "",
                answer: "",
                imageUrl: "",
              },
            ]);
          }}
        >
          Image-Based Questions
        </button>
      </div>

      {/* Questions */}
      {questions.map((q, idx) => (
        <div key={q.id} className="border rounded p-4 mb-4">
          <h3 className="font-semibold mb-2">Question {idx + 1}</h3>

          {q.type === "text" && (
            <>
              <textarea
                placeholder="Enter question"
                value={q.question}
                onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="text"
                placeholder="Answer"
                value={q.answer}
                onChange={(e) => updateQuestion(q.id, "answer", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </>
          )}

          {q.type === "image" && (
            <>
              <textarea
                placeholder="Enter text describing the image"
                value={q.question}
                onChange={(e) => updateQuestion(q.id, "question", e.target.value)}
                className="w-full p-2 border rounded mb-2"
              />
              <input
                type="file"
                accept="image/*"
                onChange={(e) => handleImageUpload(e.target.files[0], q.id)}
                className="mb-2"
              />
              {q.imageUrl && (
                <img
                  src={q.imageUrl}
                  alt="Uploaded"
                  className="max-h-40 object-contain mb-2"
                />
              )}
              <input
                type="text"
                placeholder="Correct Answer"
                value={q.answer}
                onChange={(e) => updateQuestion(q.id, "answer", e.target.value)}
                className="w-full p-2 border rounded"
              />
            </>
          )}
        </div>
      ))}

      {/* Add Question */}
      <div className="mb-6">
        <button
          onClick={addQuestion}
          className="bg-indigo-600 text-white px-4 py-2 rounded"
        >
          + Add {mode === "text" ? "Text" : "Image"} Question
        </button>
      </div>

      {/* Save / Cancel */}
      <div className="flex justify-end gap-3">
        <button
          className="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate(-1)}
        >
          Cancel
        </button>
        <button
          className="bg-indigo-600 text-white px-4 py-2 rounded"
          disabled={saving}
          onClick={saveQuiz}
        >
          {saving ? "Saving..." : "Save Quiz"}
        </button>
      </div>
    </div>
  );
};

export default PracticalQuiz;
