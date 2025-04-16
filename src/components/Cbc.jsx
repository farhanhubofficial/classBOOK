import React, { useState, useEffect } from "react";
import { db, storage } from "../firebase-config";
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const grades = ["pp1", "pp2", ...Array.from({ length: 12 }, (_, i) => `grade_${i + 1}`)];

const Cbc = () => {
  const [showModal, setShowModal] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [newTopic, setNewTopic] = useState({ title: "", description: "", videoFile: null });
  const [isUploading, setIsUploading] = useState(false);
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [viewHistory, setViewHistory] = useState([]);
  const [modalViewHistory, setModalViewHistory] = useState([]);
  const [modalGrade, setModalGrade] = useState("");
  const [modalSubject, setModalSubject] = useState("");

  const [newSubjectGrade, setNewSubjectGrade] = useState("");
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isSubjectAdding, setIsSubjectAdding] = useState(false);

  const [gradeSubjects, setGradeSubjects] = useState([]); // Main view subjects
  const [modalGradeSubjects, setModalGradeSubjects] = useState([]); // Modal subjects

  // ✅ Add Topic Function
  const handleAddTopic = async () => {
    if (!modalGrade || !modalSubject || !newTopic.title || !newTopic.videoFile) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const videoRef = ref(storage, `videos/${newTopic.videoFile.name}`);
      setIsUploading(true);
      await uploadBytes(videoRef, newTopic.videoFile);
      const videoUrl = await getDownloadURL(videoRef);

      const topicRef = collection(db, "cbc", modalGrade, "subjects", modalSubject, "topics");
      await addDoc(topicRef, {
        title: newTopic.title,
        description: newTopic.description,
        videoUrl,
      });

      if (selectedGrade === modalGrade && selectedSubject === modalSubject) {
        const topicsRef = collection(db, "cbc", modalGrade, "subjects", modalSubject, "topics");
        const snapshot = await getDocs(topicsRef);
        const topicList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setTopics(topicList);
      }

      setNewTopic({ title: "", description: "", videoFile: null });
      setModalGrade("");
      setModalSubject("");
      setModalViewHistory([]);
      setShowModal(false);
      setIsUploading(false);
      alert("Topic added successfully!");
    } catch (err) {
      console.error("Error uploading topic:", err);
      alert("Something went wrong!");
      setIsUploading(false);
    }
  };

  // ✅ Add Subject Function
  const handleAddSubject = async () => {
    if (!newSubjectGrade || !newSubjectName) {
      alert("Please fill in all required fields.");
      return;
    }

    try {
      const subjectsRef = collection(db, "cbc", newSubjectGrade, "subjects");
      const snapshot = await getDocs(subjectsRef);
      const existingSubjects = snapshot.docs.map((doc) => doc.data().name);

      if (existingSubjects.includes(newSubjectName)) {
        alert("Subject with that name already exists in this grade.");
        return;
      }

      await addDoc(subjectsRef, { name: newSubjectName });

      alert("Subject added successfully!");
      setNewSubjectGrade("");
      setNewSubjectName("");
      setShowSubjectModal(false);
    } catch (err) {
      console.error("Error adding subject:", err);
      alert("Something went wrong!");
    }
  };

  // ✅ Fetch subjects for selected grade in main view
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!selectedGrade) return;

      const subjectsRef = collection(db, "cbc", selectedGrade, "subjects");
      const snapshot = await getDocs(subjectsRef);
      const subjectList = snapshot.docs.map((doc) => doc.data().name);
      setGradeSubjects(subjectList);
    };

    fetchSubjects();
  }, [selectedGrade]);

  // ✅ Fetch subjects for modal grade selection
  useEffect(() => {
    const fetchModalSubjects = async () => {
      if (!modalGrade) return;

      const subjectsRef = collection(db, "cbc", modalGrade, "subjects");
      const snapshot = await getDocs(subjectsRef);
      const subjectList = snapshot.docs.map((doc) => doc.data().name);
      setModalGradeSubjects(subjectList);
    };

    fetchModalSubjects();
  }, [modalGrade]);

  // ✅ Fetch topics when grade + subject are selected
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

  // Navigation + UI logic
  const handleGradeClick = (grade) => {
    setViewHistory((prev) => [...prev, { level: 0 }]);
    setSelectedGrade(grade);
    setSelectedSubject("");
    setSelectedTopic(null);
    setTopics([]);
  };

  const handleSubjectSelect = (subject) => {
    setViewHistory((prev) => [...prev, { level: 1 }]);
    setSelectedSubject(subject);
    setSelectedTopic(null);
  };

  const toggleFullScreen = () => setIsFullScreen(!isFullScreen);

  const handleGoBack = () => {
    if (viewHistory.length === 0) return;
    const updatedHistory = [...viewHistory];
    const lastView = updatedHistory.pop();

    switch (lastView.level) {
      case 2:
        setSelectedTopic(null);
        break;
      case 1:
        setSelectedSubject("");
        setSelectedTopic(null);
        setTopics([]);
        break;
      case 0:
        setSelectedGrade("");
        setSelectedSubject("");
        setSelectedTopic(null);
        setTopics([]);
        break;
      default:
        break;
    }

    setViewHistory(updatedHistory);
  };

  const handleModalGoBack = () => {
    if (modalViewHistory.length === 0) return;
    const updated = [...modalViewHistory];
    const last = updated.pop();

    switch (last.level) {
      case 1:
        setModalSubject("");
        break;
      case 0:
        setModalGrade("");
        setModalSubject("");
        break;
      default:
        break;
    }

    setModalViewHistory(updated);
  };

  return (
    <div className="space-y-6 p-6 max-w-6xl mx-auto">
      {/* Top Stats */}
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

      {/* Action Buttons */}
      <div className="text-right">
        <button
          onClick={() => setShowModal(true)}
          className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded font-semibold mr-4"
        >
          ➕ Add New CBC Topic
        </button>
        <button
          onClick={() => setShowSubjectModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-semibold"
        >
          ➕ Register New Grade Subject
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

      {/* Back button */}
      {viewHistory.length > 0 && (
        <div className="mt-4">
          <button
            onClick={handleGoBack}
            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded"
          >
            ← Go Back
          </button>
        </div>
      )}

      {/* Subject Selection */}
      {selectedGrade && !selectedSubject && (
        <div>
          <h3 className="text-xl font-semibold text-center mb-4">
            Select a Subject for {selectedGrade.replace("_", " ").toUpperCase()}
          </h3>
          <div className="flex flex-wrap gap-4 justify-center">
            {gradeSubjects.length > 0 ? (
              gradeSubjects.map((subject) => (
                <button
                  key={subject}
                  onClick={() => handleSubjectSelect(subject)}
                  className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  {subject.toUpperCase()}
                </button>
              ))
            ) : (
              <p className="text-center text-gray-500 col-span-full">No subjects registered for this grade yet.</p>
            )}
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
                onClick={() => {
                  setViewHistory((prev) => [...prev, { level: 2 }]);
                  setSelectedTopic(topic);
                }}
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
            <video
              controls
              controlsList="nodownload"
              onContextMenu={(e) => e.preventDefault()}
              className="w-full h-64 sm:h-96 rounded-lg"
            >
              <source src={selectedTopic.videoUrl} type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
      )}

      {/* Modals (Topic + Subject) */}
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

            {modalViewHistory.length > 0 && (
              <button
                onClick={handleModalGoBack}
                className="bg-gray-500 text-white px-4 py-1 rounded mb-3 hover:bg-gray-600"
              >
                ← Go Back
              </button>
            )}

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-sm font-medium">Select Grade:</label>
                <select
                  className="w-full p-2 border rounded"
                  value={modalGrade}
                  onChange={(e) => {
                    setModalGrade(e.target.value);
                    setModalViewHistory((prev) => [...prev, { level: 0 }]);
                  }}
                >
                  <option value="">-- Select Grade --</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              {modalGrade && (
                <div>
                  <label className="block mb-1 text-sm font-medium">Select Subject:</label>
                  <select
                    className="w-full p-2 border rounded"
                    value={modalSubject}
                    onChange={(e) => {
                      setModalSubject(e.target.value);
                      setModalViewHistory((prev) => [...prev, { level: 1 }]);
                    }}
                  >
                    <option value="">-- Select Subject --</option>
                    {modalGradeSubjects.map((subject) => (
                      <option key={subject} value={subject}>
                        {subject.toUpperCase()}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <input
                type="text"
                placeholder="Topic Title"
                value={newTopic.title}
                onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
                className="w-full p-2 border rounded"
              />

              <textarea
                placeholder="Description (optional)"
                value={newTopic.description}
                onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
                className="w-full p-2 border rounded"
              />

              <input
                type="file"
                accept="video/*"
                onChange={(e) => setNewTopic({ ...newTopic, videoFile: e.target.files[0] })}
                className="w-full p-2 border rounded"
              />

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

      {showSubjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-xl w-full p-6 relative">
            <button
              onClick={() => setShowSubjectModal(false)}
              className="absolute top-2 right-3 text-xl text-gray-600 hover:text-red-600"
            >
              &times;
            </button>
            <h2 className="text-xl font-bold mb-4 text-blue-700">📌 Register New Subject</h2>

            <div className="space-y-3">
              <div>
                <label className="block mb-1 text-sm font-medium">Select Grade:</label>
                <select
                  className="w-full p-2 border rounded"
                  value={newSubjectGrade}
                  onChange={(e) => setNewSubjectGrade(e.target.value)}
                >
                  <option value="">-- Select Grade --</option>
                  {grades.map((grade) => (
                    <option key={grade} value={grade}>
                      {grade.replace("_", " ").toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block mb-1 text-sm font-medium">Subject Name:</label>
                <input
                  type="text"
                  placeholder="Enter Subject Name"
                  value={newSubjectName}
                  onChange={(e) => setNewSubjectName(e.target.value)}
                  className="w-full p-2 border rounded"
                />
              </div>

              <button
                onClick={handleAddSubject}
                disabled={isSubjectAdding}
                className={`w-full bg-blue-600 text-white py-2 rounded mt-2 hover:bg-blue-700 ${
                  isSubjectAdding ? "opacity-50 cursor-not-allowed" : ""
                }`}
              >
                {isSubjectAdding ? "Adding..." : "Submit Subject"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Cbc;
