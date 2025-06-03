import React, { useState } from "react";
import { db, storage } from "../firebase-config";
import { collection, addDoc, Timestamp, getDoc, doc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getAuth } from "firebase/auth";

function UploadLesson({ onClose, classroomName }) {
  const [title, setTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
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

    setUploading(true);

    try {
      // Get the current user for potential use in students list
      const auth = getAuth();
      const currentUser = auth.currentUser;

      let studentInfo = [];

      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);

        if (userSnap.exists()) {
          const userData = userSnap.data();
          studentInfo.push({
            id: currentUser.uid,
            email: currentUser.email,
            firstName: userData.firstName || "",
            lastName: userData.lastName || "",
          });
        }
      }

      // Upload files and get download URLs
      const fileUploadPromises = files.map(async (file) => {
        const storageRef = ref(
          storage,
          `classrooms/${classroomName}/lessons/${title}/${file.name}`
        );
        await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(storageRef);
        return {
          name: file.name,
          url: downloadURL,
        };
      });

      const uploadedFiles = await Promise.all(fileUploadPromises);

      // Create lesson object
      const lessonData = {
        title: title.trim(),
        writtenTitle: title.trim(),
        fileTitle: null,
        content: lessonContent.trim(),
        files: uploadedFiles,
        createdAt: Timestamp.now(),
        date: new Date().toISOString(),
        classroom: classroomName,
        category: "learner",
        students: studentInfo,
      };

      // Add lesson to Firestore
      const lessonsRef = collection(db, "lessons");
      await addDoc(lessonsRef, lessonData);

      alert("Lesson uploaded successfully!");
      onClose();
    } catch (error) {
      console.error("Error uploading lesson:", error);
      alert("Failed to upload lesson. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center modal-overlay z-50"
      onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}
    >
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Upload Lesson - {classroomName}
        </h2>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-gray-800 border-b pb-2">
            Upload Lesson Details
          </h3>
        </div>

        <div className="flex flex-col md:flex-row gap-6">
          <div className="flex-1">
            <div className="mb-6">
              <h3 className="text-xl font-semibold mb-2">Lesson Title</h3>
              <input
                type="text"
                placeholder="Enter Lesson Title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded"
              />
            </div>

            <h3 className="text-xl font-semibold mb-2">Lesson Content</h3>
            <textarea
              className="w-full border border-gray-300 p-4 rounded min-h-[200px]"
              placeholder="Write lesson content or summary..."
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
            />
          </div>

          <div className="flex-1">
            <h3 className="text-xl font-semibold mb-2">Upload Lesson Files (optional)</h3>
            <div className="border border-gray-300 p-4 rounded bg-gray-50">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="mb-4"
              />
              {files.length > 0 && (
                <ul className="text-sm text-gray-700 list-disc list-inside">
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
            onClick={onClose}
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
