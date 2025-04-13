import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase-config";
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

// Grade & Subject Options
const grades = ["pp1", "pp2", ...Array.from({ length: 12 }, (_, i) => `grade_${i + 1}`)];
const subjects = ["english", "math", "science", "kiswahili", "social_studies"];

const Cbc = () => {
  const [showModal, setShowModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newTopic, setNewTopic] = useState({ title: "", description: "", videoFile: null });
  const [isUploading, setIsUploading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // To keep track of where we came from (Grades, Subjects, or Topic)
  const [previousView, setPreviousView] = useState("");

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

  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedGrade || !selectedSubject) return;

      const topicsRef = collection(db, "cbc", selectedGrade, "subjects", selectedSubject, "topics");
      const snapshot = await getDocs(topicsRef);
      const topicList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTopics(topicList);
    };

    fetchTopics();
  }, [selectedGrade, selectedSubject]);

  const handleGradeClick = (grade) => {
    setPreviousView("grades");  // Remember we came from grades view
    setSelectedGrade(grade);
    setSelectedSubject("");
    setSelectedTopic(null);
    setTopics([]);
  };

  const handleSubjectSelect = (subject) => {
    setPreviousView("subjects");  // Remember we came from subjects view
    setSelectedSubject(subject);
    setSelectedTopic(null);
  };

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  const handleGoBack = () => {
    if (previousView === "grades") {
      setSelectedGrade("");
      setSelectedSubject("");
      setSelectedTopic(null);
      setTopics([]);
    } else if (previousView === "subjects") {
      setSelectedSubject("");
      setSelectedTopic(null);
      setTopics([]);
    } else if (previousView === "topics") {
      setSelectedTopic(null);  // Only reset selectedTopic
    }

    // After going back, set the previous view accordingly
    setPreviousView(""); // Reset previous view to avoid any conflicts in subsequent back actions.
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
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

      {/* Grade Selection */}
      {!selectedGrade && (
        <div>
          <h3 className="text-xl font-bold mb-4 text-center">Select a Grade to View Topics</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
            {grades.map((grade) => (
              <div
                key={grade}
                onClick={() => handleGradeClick(grade)}
                className="bg-blue-200 p-4 rounded-lg cursor-pointer text-center hover:bg-blue-300"
              >
                <h3 className="font-semibold">{grade.replace("_", " ").toUpperCase()}</h3>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Go Back Button */}
      {(selectedGrade || selectedSubject) && (
        <div className="mt-4">
          <button
            onClick={handleGoBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            ← Go Back
          </button>
        </div>
      )}

      {/* Subject Buttons */}
      {selectedGrade && !selectedSubject && (
        <div>
          <h3 className="text-xl font-semibold text-center mb-4">
            Select a Subject for {selectedGrade.replace("_", " ").toUpperCase()}
          </h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => handleSubjectSelect(subject)}
                className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                {subject.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Topics List */}
      {selectedGrade && selectedSubject && !selectedTopic && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {topics.length > 0 ? (
            topics.map((topic) => (
              <div
                key={topic.id}
                onClick={() => setSelectedTopic(topic)}
                className="border p-4 rounded-lg cursor-pointer hover:bg-blue-50"
              >
                <h4 className="font-semibold text-lg">{topic.title}</h4>
                <p className="text-sm text-gray-600">{topic.description}</p>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500 col-span-full">No topics available for this subject.</p>
          )}
        </div>
      )}

      {/* Topic Viewer */}
      {selectedTopic && (
        <div className="mt-6">
          <h3 className="text-xl font-semibold mb-4">Now Watching: {selectedTopic.title}</h3>
          <div className={`relative ${isFullScreen ? "w-full h-screen" : "w-full max-w-3xl mx-auto"}`}>
            <iframe
              src={selectedTopic.videoUrl}
              title={selectedTopic.title}
              className="w-full h-64 sm:h-96 rounded-lg"
              allowFullScreen
            ></iframe>
            <button
              onClick={toggleFullScreen}
              className="absolute top-2 right-2 bg-blue-500 text-white px-4 py-2 rounded-full"
            >
              {isFullScreen ? "Exit Full Screen" : "Full Screen"}
            </button>
          </div>
        </div>
      )}

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
