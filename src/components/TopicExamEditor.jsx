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

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { TextStyle } from "@tiptap/extension-text-style";
import { Color } from "@tiptap/extension-color";
import { Highlight } from "@tiptap/extension-highlight";
import { FontFamily } from "@tiptap/extension-font-family";
import { FontSize } from "@tiptap/extension-font-size";
import TextAlign from "@tiptap/extension-text-align";

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
const QuestionCard = ({
  idx,
  data,
  onCancel,
  onCreateNext,
  setActiveEditor,
}) => {
  const [showAnswer, setShowAnswer] = useState(Boolean(data.answerHTML));

  const questionEditor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight,
      FontFamily.configure({ types: ["textStyle"] }),
      FontSize.configure({ types: ["textStyle"] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: data.questionHTML || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[120px] p-3 border border-gray-300 rounded focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => {
      data.questionHTML = editor.getHTML();
    },
  });

  const answerEditor = useEditor({
    extensions: [
      StarterKit,
      TextStyle,
      Color,
      Highlight,
      FontFamily.configure({ types: ["textStyle"] }),
      FontSize.configure({ types: ["textStyle"] }),
      TextAlign.configure({ types: ["heading", "paragraph"] }),
    ],
    content: data.answerHTML || "",
    editorProps: {
      attributes: {
        class:
          "min-h-[100px] p-3 border border-gray-300 rounded focus:outline-none bg-gray-50",
      },
    },
    onUpdate: ({ editor }) => {
      data.answerHTML = editor.getHTML();
    },
  });

  useEffect(() => {
    if (!questionEditor) return;
    const onFocus = () => setActiveEditor(questionEditor);
    questionEditor.on("focus", onFocus);
    return () => questionEditor.off("focus", onFocus);
  }, [questionEditor, setActiveEditor]);

  useEffect(() => {
    if (!answerEditor) return;
    const onFocus = () => setActiveEditor(answerEditor);
    answerEditor.on("focus", onFocus);
    return () => answerEditor.off("focus", onFocus);
  }, [answerEditor, setActiveEditor]);

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
      <EditorContent editor={questionEditor} />

      <button
        onClick={() => setShowAnswer((s) => !s)}
        className="mt-3 text-sm text-blue-600 hover:underline"
      >
        {showAnswer ? "Hide answer" : "Write answer"}
      </button>

      {showAnswer && (
        <div className="mt-3">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Answer
          </label>
          <EditorContent editor={answerEditor} />
        </div>
      )}

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

// ---------- Global Toolbar ----------
const GlobalToolbar = ({ activeEditor }) => {
  const run = (fn) => activeEditor && fn(activeEditor);

  const applyColor = (color) =>
    run((e) => e.chain().focus().setColor(color).run());
  const applyBgColor = (color) =>
    run((e) => e.chain().focus().setHighlight({ color }).run());

  return (
    <div className="flex flex-wrap gap-2 mb-4 border-b pb-3">
      <button
        onClick={() => run((e) => e.chain().focus().toggleBold().run())}
        className="btn"
      >
        Bold
      </button>
      <button
        onClick={() => run((e) => e.chain().focus().toggleItalic().run())}
        className="btn"
      >
        Italic
      </button>
      <button
        onClick={() => run((e) => e.chain().focus().toggleStrike().run())}
        className="btn"
      >
        Strike
      </button>
      <button
        onClick={() => run((e) => e.chain().focus().toggleBulletList().run())}
        className="btn"
      >
        • List
      </button>
      <button
        onClick={() => run((e) => e.chain().focus().toggleOrderedList().run())}
        className="btn"
      >
        1. List
      </button>
      <button
        onClick={() => run((e) => e.chain().focus().setTextAlign("left").run())}
        className="btn"
      >
        Left
      </button>
      <button
        onClick={() => run((e) => e.chain().focus().setTextAlign("center").run())}
        className="btn"
      >
        Center
      </button>
      <button
        onClick={() => run((e) => e.chain().focus().setTextAlign("right").run())}
        className="btn"
      >
        Right
      </button>
      <button
        onClick={() =>
          run((e) => e.chain().focus().unsetAllMarks().clearNodes().run())
        }
        className="btn"
      >
        Clear
      </button>

      <input
        type="color"
        onChange={(e) => applyColor(e.target.value)}
        title="Text Color"
      />
      <input
        type="color"
        onChange={(e) => applyBgColor(e.target.value)}
        title="Background"
      />

      <select
        onChange={(e) =>
          run((ed) => ed.chain().focus().setFontFamily(e.target.value).run())
        }
      >
        <option value="">Font</option>
        <option value="Arial">Arial</option>
        <option value="Georgia">Georgia</option>
        <option value="Tahoma">Tahoma</option>
        <option value="Courier New">Courier New</option>
      </select>

      <select
        onChange={(e) =>
          run((ed) => ed.chain().focus().setFontSize(e.target.value).run())
        }
      >
        <option value="">Size</option>
        <option value="12px">12px</option>
        <option value="16px">16px</option>
        <option value="20px">20px</option>
        <option value="24px">24px</option>
      </select>
    </div>
  );
};

// ---------- Main ----------
const TopicExamEditor = ({
  onClose,
  initialTitle = "",
  initialQuestions = [],
  examId = null, // if present -> edit mode
}) => {
  const { curriculum, grade, subject, topicId } = useParams();

  const [title, setTitle] = useState(initialTitle);
  const [questions, setQuestions] = useState([
    {
      localId: randomId(),
      questionHTML: "",
      answerHTML: "",
      order: 0,
    },
  ]);
  const [activeEditor, setActiveEditor] = useState(null);
  const [isSavingExam, setIsSavingExam] = useState(false);

  // Load edit mode content
  useEffect(() => {
    if (examId) {
      // edit mode
      if (initialQuestions?.length) {
        const qs = initialQuestions.map((q, i) => ({
          localId: randomId(),
          questionHTML: q.questionHTML || "",
          answerHTML: q.answerHTML || "",
          order: i,
        }));
        setQuestions(qs);
      } else {
        setQuestions([
          {
            localId: randomId(),
            questionHTML: "",
            answerHTML: "",
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
        answerHTML: "",
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
      (q) =>
        (q.questionHTML && q.questionHTML.replace(/<[^>]+>/g, "").trim()) ||
        (q.answerHTML && q.answerHTML.replace(/<[^>]+>/g, "").trim())
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
      // ✅ Save under the specific topic
      const examsPath = collection(
        db,
        curriculum,
        grade,
        "subjects",
        subject,
        "topics",
        topicId,
        "exams"
      );

      let targetExamId = examId;
      let examRef;

      // --- EDIT MODE ---
      if (examId) {
        examRef = doc(examsPath, examId);

        // update the exam title
        await setDoc(
          examRef,
          {
            title,
            updatedAt: serverTimestamp(),
          },
          { merge: true }
        );

        // delete all existing questions then rewrite
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
            answerHTML: q.answerHTML || "",
            order: i,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp(),
          });
        });
        await batch.commit();

        alert("Exam updated successfully!");
        onClose?.();
        return;
      }

      // --- CREATE MODE ---
      targetExamId = toDocId(title) || randomId();
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
          answerHTML: q.answerHTML || "",
          order: i,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
      });

      await batch.commit();

      alert("Exam saved successfully!");
      onClose?.();
    } catch (e) {
      console.error(e);
      alert(examId ? "Failed to update exam." : "Failed to save exam.");
    } finally {
      setIsSavingExam(false);
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-4xl mx-auto">
      <GlobalToolbar activeEditor={activeEditor} />

      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-3">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Exam Title
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
              ? "✅ Update Exam"
              : "💾 Save Exam"}
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
          setActiveEditor={setActiveEditor}
          onCancel={cancelCard}
          onCreateNext={createNextCard}
        />
      ))}
    </div>
  );
};

export default TopicExamEditor;
