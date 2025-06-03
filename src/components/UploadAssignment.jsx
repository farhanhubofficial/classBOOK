import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  updateDoc,
  doc,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase-config";

function UploadLesson() {
  const { classroomName } = useParams();
  const navigate = useNavigate();

  const [writtenTitle, setWrittenTitle] = useState("");
  const [fileTitle, setFileTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [files, setFiles] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(true);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleClose = () => {
    setIsModalVisible(false);
    navigate(-1);
  };

  const handleSubmit = async () => {
    if (!writtenTitle.trim() && !fileTitle.trim()) {
      alert("Please enter at least one title.");
      return;
    }
    if (!lessonContent.trim() && files.length === 0) {
      alert("Please provide lesson content or upload files.");
      return;
    }
    if (!classroomName) {
      alert("Missing classroom name.");
      return;
    }

    const title = writtenTitle || fileTitle || "Untitled Lesson";
    const date = new Date().toISOString();

    try {
      // 1. Get learners
      const usersQuery = query(
        collection(db, "users"),
        where("role", "==", "learner"),
        where("classroom", "==", classroomName)
      );
      const learnerSnap = await getDocs(usersQuery);
      const learners = learnerSnap.docs.map((doc) => {
        const { firstName, lastName, email } = doc.data();
        return {
          id: doc.id,
          firstName,
          lastName,
          email,
        };
      });

      // 2. Upload files
      const uploadedFiles = await Promise.all(
        files.map(async (file) => {
          const fileRef = ref(
            storage,
            `lessons/${classroomName}/${title}/${file.name}`
          );
          await uploadBytes(fileRef, file);
          const url = await getDownloadURL(fileRef);
          return { name: file.name, url };
        })
      );

      // 3. Prepare lesson data
      const lessonData = {
        title,
        writtenTitle: writtenTitle || null,
        fileTitle: fileTitle || null,
        content: lessonContent,
        files: uploadedFiles,
        date,
        classroom: classroomName,
        category: "learner",
        students: learners,
      };

      // 4. Check if a lesson already exists with the same title + classroom
      const lessonsRef = collection(db, "lessons");
      const existingQuery = query(
        lessonsRef,
        where("title", "==", title),
        where("classroom", "==", classroomName)
      );
      const existingSnap = await getDocs(existingQuery);

      if (!existingSnap.empty) {
        // Update existing
        const existingDocId = existingSnap.docs[0].id;
        await updateDoc(doc(db, "lessons", existingDocId), lessonData);
        alert("Lesson updated successfully.");
      } else {
        // Add new
        await addDoc(lessonsRef, lessonData);
        alert("Lesson uploaded successfully.");
      }

      // Reset
      setWrittenTitle("");
      setFileTitle("");
      setLessonContent("");
      setFiles([]);
      handleClose();
    } catch (err) {
      console.error("Error uploading lesson:", err);
      alert("An error occurred while uploading lesson.");
    }
  };

  if (!isModalVisible) return null;

  return (
    <div
      className="px-4 fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50"
      onClick={(e) => e.target === e.currentTarget && handleClose()}
    >
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-6xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Upload Lesson - {classroomName}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Written Section */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              Written Title
            </label>
            <input
              type="text"
              value={writtenTitle}
              onChange={(e) => setWrittenTitle(e.target.value)}
              placeholder="Enter written title"
              className="w-full border border-gray-300 p-3 rounded mb-6"
            />

            <label className="block text-sm font-semibold mb-2">
              Lesson Content
            </label>
            <textarea
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
              placeholder="Write lesson content"
              className="w-full border border-gray-300 p-4 rounded min-h-[200px]"
            />
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-semibold mb-2">
              File Upload Title
            </label>
            <input
              type="text"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              placeholder="Enter file title"
              className="w-full border border-gray-300 p-3 rounded mb-6"
            />

            <label className="block text-sm font-semibold mb-2">
              Upload Lesson Files
            </label>
            <div className="border border-gray-300 p-4 rounded bg-gray-50">
              <input type="file" multiple onChange={handleFileChange} />
              {files.length > 0 && (
                <ul className="list-disc text-sm text-gray-800 mt-2 pl-4">
                  {files.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <button
            onClick={handleClose}
            className="bg-gray-600 text-white px-6 py-3 rounded"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-600 text-white px-6 py-3 rounded"
          >
            Submit Lesson
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadLesson;
