import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  Timestamp,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase-config";

import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

// ---------- Quill Toolbar Config ----------
const toolbarOptions = [
  ["bold", "italic", "strike"], // text styles
  [{ list: "ordered" }, { list: "bullet" }], // lists
  [{ align: "" }, { align: "center" }, { align: "right" }], // alignments
  [{ color: [] }, { background: [] }], // colors
  [{ font: [] }, { size: [] }], // font + size
  ["clean"], // clear formatting
];

function UploadLesson() {
  const { classroomName } = useParams();
  const navigate = useNavigate();

  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(true);

  // Independent Quill content states
  const [title, setTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleClose = () => {
    setIsModalVisible(false);
    navigate(-1);
  };

  const stripHtml = (html) => html.replace(/<[^>]+>/g, "").trim();

  const handleSubmit = async () => {
    if (!stripHtml(title)) {
      alert("Please enter a lesson title.");
      return;
    }
    if (!stripHtml(lessonContent) && files.length === 0) {
      alert("Please provide lesson content or upload files.");
      return;
    }
    if (!classroomName) {
      alert("Missing classroom name in URL.");
      return;
    }

    setUploading(true);

    try {
      // fetch learners
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

      // upload files
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const fileRef = ref(
            storage,
            `lessons/${classroomName}/${stripHtml(title)}/${file.name}`
          );
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          return { name: file.name, url };
        })
      );

      // lesson payload
      const lessonData = {
        title,
        content: lessonContent,
        files: uploadedFiles,
        createdAt: Timestamp.now(),
        date: new Date().toISOString(),
        classroom: classroomName,
        category: "learner",
        students: learners,
      };

      await addDoc(collection(db, "lessons"), lessonData);

      alert("Lesson uploaded successfully!");
      setTitle("");
      setLessonContent("");
      setFiles([]);
      handleClose();
    } catch (error) {
      console.error("Error uploading lesson:", error);
      alert("Failed to upload lesson. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!classroomName) {
      alert("No classroom specified in URL.");
      navigate("/admin/dashboard");
    }
  }, [classroomName, navigate]);

  if (!isModalVisible) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center modal-overlay z-50"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Upload Lesson - {classroomName}
        </h2>

        <div className="flex flex-col md:flex-row gap-6">
          {/* Editors */}
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">
              Lesson Title
            </label>
            <ReactQuill
              theme="snow"
              value={title}
              onChange={setTitle}
              placeholder="Enter lesson title..."
              modules={{ toolbar: toolbarOptions }}
              className="mb-4 min-h-[60px]"
            />

            <label className="block text-sm font-semibold mt-6 mb-2">
              Lesson Content
            </label>
            <ReactQuill
              theme="snow"
              value={lessonContent}
              onChange={setLessonContent}
              placeholder="Write lesson content..."
              modules={{ toolbar: toolbarOptions }}
              className="mb-4 min-h-[200px]"
            />
          </div>

          {/* File Upload */}
         
        </div>

        {/* Actions */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            className="bg-gray-600 text-white px-6 py-3 rounded"
            onClick={handleClose}
            disabled={uploading}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-6 py-3 rounded"
            onClick={handleSubmit}
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Submit Lesson"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadLesson;
