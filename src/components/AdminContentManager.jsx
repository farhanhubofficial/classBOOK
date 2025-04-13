import React, { useState, useEffect } from 'react';
import { db, storage } from '../firebase-config'; // Import storage
import {
  collection,
  addDoc,
  getDocs,
} from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'; // Import Firebase storage methods

const grades = ['grade_1', 'grade_2', 'grade_3', 'grade_4', 'grade_5'];
const subjects = ['english', 'math', 'science', 'kiswahili', 'social_studies'];

const AdminContentManager = () => {
  const [selectedGrade, setSelectedGrade] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [topics, setTopics] = useState([]);
  const [newTopic, setNewTopic] = useState({ title: '', description: '', videoFile: null });
  const [isUploading, setIsUploading] = useState(false);

  // Fetch topics when grade or subject changes
  useEffect(() => {
    const fetchTopics = async () => {
      if (!selectedGrade || !selectedSubject) return;

      const topicsRef = collection(db, 'cbc', selectedGrade, 'subjects', selectedSubject, 'topics');
      const snapshot = await getDocs(topicsRef);
      const topicList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTopics(topicList);
    };

    fetchTopics();
  }, [selectedGrade, selectedSubject]);

  const handleAddTopic = async () => {
    if (!selectedGrade || !selectedSubject || !newTopic.title || !newTopic.videoFile) {
      alert('Fill in all required fields');
      return;
    }

    // Upload video to Firebase Storage
    const videoRef = ref(storage, `videos/${newTopic.videoFile.name}`);
    setIsUploading(true);
    await uploadBytes(videoRef, newTopic.videoFile);
    const videoUrl = await getDownloadURL(videoRef);

    // Add topic to Firestore with video URL
    const topicRef = collection(db, 'cbc', selectedGrade, 'subjects', selectedSubject, 'topics');
    await addDoc(topicRef, {
      title: newTopic.title,
      description: newTopic.description,
      videoUrl: videoUrl, // Store the video URL from Firebase Storage
    });

    // Reset form and alert user
    setNewTopic({ title: '', description: '', videoFile: null });
    setIsUploading(false);
    alert('Topic added successfully!');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center">📚 CBC Admin Content Manager</h2>

      {/* Select Grade */}
      <div>
        <label className="block mb-1">Select Grade:</label>
        <select
          className="w-full p-2 border rounded"
          value={selectedGrade}
          onChange={(e) => setSelectedGrade(e.target.value)}
        >
          <option value="">-- Select Grade --</option>
          {grades.map((grade) => (
            <option key={grade} value={grade}>{grade.replace('_', ' ').toUpperCase()}</option>
          ))}
        </select>
      </div>

      {/* Select Subject */}
      {selectedGrade && (
        <div>
          <label className="block mb-1">Select Subject:</label>
          <select
            className="w-full p-2 border rounded"
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
          >
            <option value="">-- Select Subject --</option>
            {subjects.map((subject) => (
              <option key={subject} value={subject}>{subject.toUpperCase()}</option>
            ))}
          </select>
        </div>
      )}

      {/* Add Topic Form */}
      {selectedSubject && (
        <div className="p-4 border rounded bg-gray-50">
          <h3 className="font-semibold text-lg mb-2">Add New Topic</h3>
          <input
            type="text"
            placeholder="Topic Title"
            value={newTopic.title}
            onChange={(e) => setNewTopic({ ...newTopic, title: e.target.value })}
            className="w-full mb-2 p-2 border rounded"
          />
          <textarea
            placeholder="Description (optional)"
            value={newTopic.description}
            onChange={(e) => setNewTopic({ ...newTopic, description: e.target.value })}
            className="w-full mb-2 p-2 border rounded"
          />
          <input
            type="file"
            accept="video/*"
            onChange={(e) => setNewTopic({ ...newTopic, videoFile: e.target.files[0] })}
            className="w-full mb-2 p-2 border rounded"
          />
          <button
            onClick={handleAddTopic}
            className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 ${isUploading ? 'cursor-not-allowed' : ''}`}
            disabled={isUploading}
          >
            {isUploading ? 'Uploading...' : '➕ Add Topic'}
          </button>
        </div>
      )}

      {/* Topics Display */}
      {topics.length > 0 && (
        <div className="mt-6">
          <h3 className="text-xl font-bold mb-2">📖 Topics for {selectedSubject.toUpperCase()}</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topics.map((topic) => (
              <div key={topic.id} className="border p-4 rounded shadow-sm bg-white">
                <h4 className="font-bold text-lg">{topic.title}</h4>
                <p className="text-sm text-gray-600">{topic.description}</p>
                {topic.videoUrl && (
                  <div className="mt-2">
                    <iframe
                      src={topic.videoUrl}
                      title={topic.title}
                      className="w-full aspect-video rounded"
                      allowFullScreen
                    ></iframe>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminContentManager;
