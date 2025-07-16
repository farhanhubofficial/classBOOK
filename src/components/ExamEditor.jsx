import React, { useEffect, useRef, useState } from "react";
import { db } from "../firebase-config";
import { collection, addDoc, doc, updateDoc } from "firebase/firestore";
import { useParams } from "react-router-dom";
import "quill/dist/quill.snow.css";

const ExamEditor = ({ onClose, initialContent = "", examId = null }) => {
  const { curriculum, grade, subject } = useParams();
  const editorRef = useRef(null);
  const quillRef = useRef(null);
  const [content, setContent] = useState(initialContent);

  useEffect(() => {
    const loadQuill = async () => {
      if (!window.Quill) {
        await import("https://cdn.quilljs.com/1.3.6/quill.js");
      }

      if (editorRef.current && !quillRef.current) {
        quillRef.current = new window.Quill(editorRef.current, {
          theme: "snow",
          modules: {
            toolbar: [
              [{ font: [] }, { size: ["small", false, "large", "huge"] }],
              ["bold", "italic", "underline", "strike"],
              [{ color: [] }, { background: [] }],
              [{ list: "ordered" }, { list: "bullet" }],
              [{ align: [] }],
              ["clean"],
            ],
          },
        });

        if (initialContent) {
          quillRef.current.root.innerHTML = initialContent;
        }

        quillRef.current.on("text-change", () => {
          setContent(quillRef.current.root.innerHTML);
        });
      }
    };

    loadQuill();
  }, [initialContent]);

  const handleSave = async () => {
    try {
      const examsRef = collection(db, curriculum, grade, "subjects", subject, "exams");

      if (examId) {
        const examDocRef = doc(examsRef, examId);
        await updateDoc(examDocRef, {
          content,
          updatedAt: new Date(),
        });
        alert("Exam updated successfully!");
      } else {
        await addDoc(examsRef, {
          content,
          createdAt: new Date(),
        });
        alert("Exam saved successfully!");
      }

      setContent("");
      if (quillRef.current) {
        quillRef.current.setContents([]);
      }
      if (onClose) onClose(); // ✅ Close editor after save
    } catch (err) {
      console.error("Error saving exam:", err);
      alert("Failed to save exam.");
    }
  };

  return (
    <div className="bg-white p-4 rounded shadow max-w-3xl mx-auto">
      <h2 className="text-xl font-semibold mb-4 text-center text-blue-700">
        {examId ? "📝 Edit Exam" : "📝 Exam Creator"}
      </h2>
      <div ref={editorRef} style={{ height: "400px", marginBottom: "1rem" }} />

      <div className="flex justify-end gap-2 mt-4">
        <button
          onClick={onClose}
          className="bg-gray-400 hover:bg-gray-500 text-white py-2 px-4 rounded"
        >
          Cancel
        </button>
        <button
          onClick={handleSave}
          className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
        >
          💾 Save Exam
        </button>
      </div>
    </div>
  );
};

export default ExamEditor;
