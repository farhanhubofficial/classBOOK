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

function UploadLesson() {
  const { classroomName } = useParams();
  const navigate = useNavigate();

  const [title, setTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(true);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleClose = () => {
    setIsModalVisible(false);
    navigate(-1); // go back to previous page
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a lesson title.");
      return;
    }

    if (!lessonContent.trim() && files.length === 0) {
      alert("Please provide lesson content or upload files.");
      return;
    }

    if (!classroomName) {
      alert("Missing classroom name in URL.");
      return;
    }

    setUploading(true);

    try {
      // Fetch learners in this classroom
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

      // Upload lesson files
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

      // Save lesson in Firestore
      const lessonData = {
        title: title.trim(),
        content: lessonContent.trim(),
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
          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">Lesson Title</label>
            <input
              type="text"
              placeholder="Enter Lesson Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded mb-6"
            />

            <label className="block text-sm font-semibold mb-2">Lesson Content</label>
            <textarea
              className="w-full border border-gray-300 p-4 rounded min-h-[200px]"
              placeholder="Write lesson content or summary..."
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <label className="block text-sm font-semibold mb-2">Upload Lesson Files (optional)</label>
            <div className="border border-gray-300 p-4 rounded bg-gray-50">
              <input type="file" multiple onChange={handleFileChange} />
              {files.length > 0 && (
                <ul className="list-disc text-sm text-gray-700 mt-2 pl-4">
                  {files.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

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
