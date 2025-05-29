import React, { useState } from "react";
import { addDoc, collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase-config";

function UploadAssignment({ onClose, classroomName }) {
  const [writtenTitle, setWrittenTitle] = useState("");
  const [fileTitle, setFileTitle] = useState("");
  const [assignmentContent, setAssignmentContent] = useState("");
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    if (!writtenTitle.trim() && !fileTitle.trim()) {
      alert("Please enter at least one title.");
      return;
    }
    if (!assignmentContent && files.length === 0) {
      alert("Please provide assignment content or upload files.");
      return;
    }

    const timestamp = new Date().toISOString();

    try {
      const usersRef = collection(db, "users");
      const learnersQuery = query(
        usersRef,
        where("role", "==", "learner"),
        where("classroom", "==", classroomName)
      );

      const querySnapshot = await getDocs(learnersQuery);
      if (querySnapshot.empty) {
        alert("No learners found in this classroom.");
        return;
      }

      const learners = querySnapshot.docs.map((doc) => {
        const { firstName, lastName, email } = doc.data();
        return {
          id: doc.id,
          firstName: firstName || "Unknown",
          lastName: lastName || "Unknown",
          email: email || "Unknown",
        };
      });

      const assignment = {
        title: writtenTitle || fileTitle || "Untitled Assignment",
        writtenTitle: writtenTitle || null,
        fileTitle: fileTitle || null,
        content: assignmentContent || "",
        files: files.map((file) => file.name),
        date: timestamp,
        classroom: classroomName,
        category: "learner",
        students: learners,
      };

      await addDoc(collection(db, "assignments"), assignment);
      alert("Assignment created and visible to learners.");
      onClose();
    } catch (error) {
      console.error("Error submitting assignment:", error);
      alert("An error occurred while creating the assignment.");
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center modal-overlay z-50"
      onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}
    >
      <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-6xl max-h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Upload Assignment - {classroomName}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {/* Written Content Section */}
          <div>
            <label
              htmlFor="writtenTitle"
              className="block text-sm font-semibold mb-2"
            >
              Written Content Title
            </label>
            <input
              id="writtenTitle"
              type="text"
              placeholder="Enter title for written content"
              value={writtenTitle}
              onChange={(e) => setWrittenTitle(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded mb-6"
            />

            <label
              htmlFor="assignmentContent"
              className="block text-sm font-semibold mb-2"
            >
              Assignment Content
            </label>
            <textarea
              id="assignmentContent"
              placeholder="Write assignment instructions or details..."
              value={assignmentContent}
              onChange={(e) => setAssignmentContent(e.target.value)}
              className="w-full border border-gray-300 p-4 rounded min-h-[200px]"
            />
          </div>

          {/* File Upload Section */}
          <div>
            <label
              htmlFor="fileTitle"
              className="block text-sm font-semibold mb-2"
            >
              File Upload Title
            </label>
            <input
              id="fileTitle"
              type="text"
              placeholder="Enter title for uploaded files"
              value={fileTitle}
              onChange={(e) => setFileTitle(e.target.value)}
              className="w-full border border-gray-300 p-3 rounded mb-6"
            />

            <label className="block text-sm font-semibold mb-2">
              Upload Assignment Files (optional)
            </label>
            <div className="border border-gray-300 p-4 rounded bg-gray-50">
              <input
                type="file"
                multiple
                onChange={handleFileChange}
                className="mb-4"
              />
              {files.length > 0 && (
                <ul className="list-disc list-inside text-gray-700 text-sm">
                  {files.map((file, idx) => (
                    <li key={idx}>{file.name}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-600 text-white px-6 py-3 rounded hover:bg-gray-700 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="bg-green-600 text-white px-6 py-3 rounded hover:bg-green-700 transition"
          >
            Submit Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadAssignment;
