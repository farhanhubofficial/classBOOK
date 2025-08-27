import React, { useState, useEffect } from "react";
import { db } from "../firebase-config";
import { collection, getDocs } from "firebase/firestore";

const grades = ['grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5', 'grade_6', 'grade_7', 'grade_8', 'grade_9'];

const GradeSelection = () => {
  const [selectedGrade, setSelectedGrade] = useState("");
  const [selectedSubject, setSelectedSubject] = useState("");
  const [topics, setTopics] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [isFullScreen, setIsFullScreen] = useState(false);

  // Fetch topics when grade or subject changes
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedGrade || !selectedSubject) return;

      const topicsRef = collection(db, "cbc", selectedGrade, "subjects", selectedSubject, "topics");
      const snapshot = await getDocs(topicsRef);
      const topicList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTopics(topicList);
    };

    fetchTopics();
  }, [selectedGrade, selectedSubject]);

  const handleGradeClick = (grade) => {
    setSelectedGrade(grade);
    setSelectedSubject(""); // Reset subject
    setTopics([]); // Clear existing topics
    setSelectedTopic(null); // Reset selected topic
  };

  const handleSubjectSelect = (subject) => {
    setSelectedSubject(subject);
  };

  const handleTopicSelect = (topic) => {
    setSelectedTopic(topic);
  };

  const toggleFullScreen = () => {
    setIsFullScreen(!isFullScreen);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center mb-6">📚 Select Grade and Subject</h2>

      {/* Display Grade Cards */}
      {!selectedGrade && (
        <div className="grid grid-cols-3 gap-4">
          {grades.map((grade) => (
            <div
              key={grade}
              className="bg-blue-200 p-4 rounded-lg cursor-pointer text-center hover:bg-blue-300"
              onClick={() => handleGradeClick(grade)}
            >
              <h3 className="text-xl font-semibold">{grade.replace("_", " ").toUpperCase()}</h3>
            </div>
          ))}
        </div>
      )}

      {/* Display Subject Dropdown after Grade Selection */}
      {selectedGrade && !selectedSubject && (
        <div>
          <h3 className="text-xl font-semibold text-center mb-4">Select a Subject for {selectedGrade.replace("_", " ").toUpperCase()}</h3>
          <div className="flex justify-center gap-4">
            {["english", "math", "science", "kiswahili", "social_studies"].map((subject) => (
              <button
                key={subject}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                onClick={() => handleSubjectSelect(subject)}
              >
                {subject.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Display Topics for Selected Subject */}
      {selectedGrade && selectedSubject && !selectedTopic && (
        <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
          {topics.length > 0 ? (
            topics.map((topic) => (
              <div
                key={topic.id}
                className="border p-4 rounded-lg shadow-sm cursor-pointer hover:bg-blue-50"
                onClick={() => handleTopicSelect(topic)}
              >
                <h4 className="font-semibold text-lg">{topic.title}</h4>
                <p className="text-sm text-gray-600">{topic.description}</p>
              </div>
            ))
          ) : (
            <p>No topics available for this subject.</p>
          )}
        </div>
      )}

      {/* Display Selected Topic Video */}
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
              className="absolute top-2 right-2 bg-blue-500 text-white px-4 py-2 rounded-full"
              onClick={toggleFullScreen}
            >
              {isFullScreen ? "Exit Full Screen" : "Full Screen"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeSelection;
