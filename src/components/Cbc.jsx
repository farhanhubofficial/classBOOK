import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase-config";
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const grades = ["grade_1", "grade_2", "grade_3", "grade_4", "grade_5"];
const subjects = ["english", "math", "science", "kiswahili", "social_studies"];

const Cbc = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newTopic, setNewTopic] = useState({ title: "", description: "", videoFile: null });
  const [isUploading, setIsUploading] = useState(false);

  const handleAddTopic = async () => {
    if (!selectedGrade || !selectedSubject || !newTopic.title || !newTopic.videoFile) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const videoRef = ref(storage, `videos/${newTopic.videoFile.name}`);
      setIsUploading(true);
      await uploadBytes(videoRef, newTopic.videoFile);
      const videoUrl = await getDownloadURL(videoRef);

      const topicRef = collection(db, "cbc", selectedGrade, "subjects", selectedSubject, "topics");
      await addDoc(topicRef, {
        title: newTopic.title,
        description: newTopic.description,
        videoUrl,
      });

      setNewTopic({ title: "", description: "", videoFile: null });
      setShowModal(false);
      setIsUploading(false);
      alert("Topic added successfully!");
    } catch (err) {
      console.error("Error uploading topic:", err);
      alert("Something went wrong!");
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* CBC Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-green-100 p-6 rounded shadow text-center">
          <h3 className="text-lg font-bold text-green-600">Total CBC Students</h3>
          <p className="text-4xl font-extrabold text-gray-800 mt-2">850</p>
        </div>
        <div className="bg-blue-100 p-6 rounded shadow text-center">
          <h3 className="text-lg font-bold text-blue-600">Total CBC Parents</h3>
          <p className="text-4xl font-extrabold text-gray-800 mt-2">310</p>
        </div>
      </div>

      {/* Add Topic Button */}
      <div className="text-right">
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold"
        >
          ➕ Add New CBC Topic
        </button>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-xl text-gray-600 hover:text-red-600"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-green-700">📌 Register New Topic</h2>

            <div className="space-y-3">
              {/* Grade Select */}
              <div>
                <label className="block mb-1 text-sm font-medium">Select Grade:</label>
                <select
                  className="w-full p-2 border rounded"
                  value={selectedGrade}
                  onChange={(e) => setSelectedGrade(e.target.value)}
                >
                  <option value="">-- Select Grade --</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Subject Select */}
              {selectedGrade && (
                <div>
                  <label className="block mb-1 text-sm font-medium">Select Subject:</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={selectedSubject}
                    onChange={(e) => setSelectedSubject(e.target.value)}
                  >
                    <option value="">-- Select Subject --</option>
                    {subjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {/* Topic Title */}
              <input
                type="text"
                placeholder="Topic Title"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                className="w-full p-2 border rounded"
              />

              {/* Topic Description */}
              <textarea
                placeholder="Description (optional)"
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                className="w-full p-2 border rounded"
              />

              {/* Video Upload */}
              <input
                type="file"
                accept="video/*"
                onChange={(e) => setNewTopic({ ...newTopic, videoFile: e.target.files[0] })}
                className="w-full p-2 border rounded"
              />

              {/* Submit Button */}
              <button
                onClick={handleAddTopic}
                disabled={isUploading}
                className={`w-full bg-green-600 text-white py-2 rounded mt-2 hover:bg-green-700 ${
                  isUploading ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isUploading ? "Uploading..." : "Submit Topic"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cbc;
