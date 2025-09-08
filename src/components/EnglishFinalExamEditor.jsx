import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase-config";
import {
  collection,
  doc,
  serverTimestamp,
  writeBatch,
  setDoc,
  getDocs,
} from "firebase/firestore";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// ---------- Utils ----------
const randomId = () => Math.random().toString(36).slice(2);

const toDocId = (str) =>
  str
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\- ]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");

// ---------- Question Card ----------
const QuestionCard = ({ idx, data, onCancel, onCreateNext }) => {
  return (
    <div className="border rounded-lg shadow-sm p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-lg font-semibold text-blue-700">
          Question {idx + 1}
        </h3>
      </div>

      <label className="block text-sm font-medium text-gray-700 mb-1">
        Question
      </label>
      <ReactQuill
        theme="snow"
        value={data.questionHTML}
        onChange={(val) => (data.questionHTML = val)}
        className="bg-white border rounded min-h-[120px]"
        modules={{
          toolbar: [
            ["bold", "italic", "underline", "strike"],
            [{ list: "ordered" }, { list: "bullet" }],
            [{ align: [] }],
            [{ color: [] }, { background: [] }],
            [{ font: [] }, { size: [] }],
            ["clean"],
          ],
        }}
      />

      <div className="flex items-center gap-2 mt-4">
        <button
          onClick={() => onCancel(idx)}
          className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          onClick={() => onCreateNext(idx)}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// ---------- Main ----------
const EnglishFinalExamEditor = ({
  onClose,
  initialTitle = "",
  initialQuestions = [],
  examId = null, // if present -> edit mode
}) => {
  const { curriculum, grade, subject } = useParams();

  const [title, setTitle] = useState(initialTitle);
  const [questions, setQuestions] = useState([
    {
      localId: randomId(),
      questionHTML: "",
      order: 0,
    },
  ]);
  const [isSavingExam, setIsSavingExam] = useState(false);

  // Load edit mode content
  useEffect(() => {
    if (examId) {
      if (initialQuestions?.length) {
        const qs = initialQuestions.map((q, i) => ({
          localId: randomId(),
          questionHTML: q.questionHTML || "",
          order: i,
        }));
        setQuestions(qs);
      } else {
        setQuestions([
          {
            localId: randomId(),
            questionHTML: "",
            order: 0,
          },
        ]);
      }
      setTitle(initialTitle || "");
    }
  }, [examId, initialTitle, initialQuestions]);

  const createNextCard = () => {
    setQuestions((prev) => [
      ...prev,
      {
        localId: randomId(),
        questionHTML: "",
        order: prev.length,
      },
    ]);
  };

  const cancelCard = (idx) => {
    setQuestions((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      return next.map((q, i) => ({ ...q, order: i }));
    });
  };

  const handleSaveExam = async () => {
    if (!title.trim()) {
      alert("Please enter an exam title first.");
      return;
    }

    const filtered = questions.filter(
      (q) => q.questionHTML && q.questionHTML.replace(/<[^>]+>/g, "").trim()
    );

    if (!examId && filtered.length === 0) {
      if (
        !window.confirm(
          "No questions to save. Save the exam with title only?"
        )
      ) {
        return;
      }
    }

    setIsSavingExam(true);
    try {
      const examsPath = collection(
        db,
        curriculum,
        grade,
        "subjects",
        subject,
        "finalExams" // <-- saved separately
      );

      let targetExamId = examId;
      let examRef;

      // --- EDIT MODE ---
      if (examId) {
        examRef = doc(examsPath, examId);

        await setDoc(
          examRef,
          {
            title,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        const questionsPath = collection(examRef, "questions");
        const existing = await getDocs(questionsPath);
        const batchDel = writeBatch(db);
        existing.forEach((d) => batchDel.delete(d.ref));
        await batchDel.commit();

        const batch = writeBatch(db);
        filtered.forEach((q, i) => {
          const qRef = doc(questionsPath);
          batch.set(qRef, {
            questionHTML: q.questionHTML || "",
            order: i,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();

        alert("Final Exam updated successfully!");
        onClose?.();
        return;
      }

      // --- CREATE MODE ---
      targetExamId = toDocId(title);
      examRef = doc(examsPath, targetExamId);

      await setDoc(
        examRef,
        {
          title,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        },
        { merge: true }
      );

      const batch = writeBatch(db);
      const questionsPath = collection(examRef, "questions");

      filtered.forEach((q, i) => {
        const qRef = doc(questionsPath);
        batch.set(qRef, {
          questionHTML: q.questionHTML || "",
          order: i,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      alert("Final Exam saved successfully!");
      onClose?.();
    } catch (e) {
      console.error(e);
      alert(examId ? "Failed to update final exam." : "Failed to save final exam.");
    } finally {
      setIsSavingExam(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-4xl mx-auto">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Final Exam Title
          </label>
          <input
            type="text"
            className="w-full border rounded p-2"
            placeholder="Enter the exam title..."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSaveExam}
            disabled={isSavingExam}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-2 px-4 rounded"
          >
            {isSavingExam
              ? examId
                ? "Updating..."
                : "Saving..."
              : examId
              ? "✅ Update Final Exam"
              : "💾 Save Final Exam"}
          </button>

          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
          >
            Cancel
          </button>
        </div>
      </div>

      {/* QUESTION CARDS */}
      {questions.map((q, idx) => (
        <QuestionCard
          key={q.localId}
          idx={idx}
          data={q}
          onCancel={cancelCard}
          onCreateNext={createNextCard}
        />
      ))}
    </div>
  );
};

export default EnglishFinalExamEditor;
