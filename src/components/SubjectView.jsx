import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db, storage } from "../firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from "firebase/firestore";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "firebase/storage";
import ExamEditor from "./ExamEditor";

const SubjectView = () => {
  const { curriculum, grade, subject } = useParams();
  const [topics, setTopics] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isEditing, setIsEditing] = useState(false);
  const [editingTopicId, setEditingTopicId] = useState(null);
  const [view, setView] = useState("topics");
  const [showExamEditor, setShowExamEditor] = useState(false);

const [selectedExam, setSelectedExam] = useState(null);


  const [exams, setExams] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchTopics();
     fetchExams();
  }, [curriculum, grade, subject]);

const fetchExams = async () => {
  const examsRef = collection(db, curriculum, grade, "subjects", subject, "exams");
  const snapshot = await getDocs(examsRef);
  const examList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  setExams(examList);
};


  const fetchTopics = async () => {
    try {
      const topicsRef = collection(db, curriculum, grade, "subjects", subject, "topics");
      const snapshot = await getDocs(topicsRef);
      const topicList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setTopics(topicList);
    } catch (err) {
      console.error("Failed to fetch topics:", err);
    }
  };

  const uploadFile = async (file, onProgress) => {
    const timestamp = Date.now();
    const filePath = `${curriculum}/${grade}/${subject}/${timestamp}_${file.name}`;
    const storageRef = ref(storage, filePath);

    return new Promise((resolve, reject) => {
      try {
        const uploadTask = uploadBytesResumable(storageRef, file, {
          contentType: file.type,
          customMetadata: {
            uploadedBy: "admin",
          },
        });

        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress = Math.round(
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100
            );
            onProgress(progress);
          },
          (error) => {
            console.error("Upload error:", error);
            reject(error);
          },
          async () => {
            try {
              const downloadURL = await getDownloadURL(uploadTask.snapshot.ref);
              resolve(downloadURL);
            } catch (error) {
              reject(error);
            }
          }
        );
      } catch (error) {
        reject(error);
      }
    });
  };

  const handleAddOrEditTopic = async () => {
    if (!title.trim()) {
      alert("Title is required.");
      return;
    }

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      let videoUrl = "";
      if (file) {
        videoUrl = await uploadFile(file, setUploadProgress);
      }

      const topicData = {
        title: title.trim(),
        description: description.trim(),
        ...(videoUrl && { videoUrl }),
        updatedAt: new Date(),
      };

      const topicsRef = collection(db, curriculum, grade, "subjects", subject, "topics");
      if (isEditing && editingTopicId) {
        const docRef = doc(topicsRef, editingTopicId);
        await updateDoc(docRef, topicData);
      } else {
        topicData.createdAt = new Date();
        await addDoc(topicsRef, topicData);
      }

      resetModal();
      fetchTopics();
    } catch (err) {
      console.error("Error adding/editing topic:", err);
      alert("Failed to submit topic.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditClick = (topic) => {
    setTitle(topic.title);
    setDescription(topic.description || "");
    setFile(null);
    setEditingTopicId(topic.id);
    setIsEditing(true);
    setShowModal(true);
  };

  const handleDeleteClick = async (topicId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this topic?");
    if (!confirmDelete) return;

    try {
      const topicDocRef = doc(db, curriculum, grade, "subjects", subject, "topics", topicId);
      await deleteDoc(topicDocRef);
      fetchTopics();
    } catch (err) {
      console.error("Error deleting topic:", err);
      alert("Failed to delete topic.");
    }
  };

  const resetModal = () => {
    setTitle("");
    setDescription("");
    setFile(null);
    setUploadProgress(0);
    setShowModal(false);
    setIsEditing(false);
    setEditingTopicId(null);
  };

  return (
    <div className="min-h-screen bg-white">
      <h1 className="text-2xl font-bold text-center mb-2 text-gray-900">
        Grade: {grade.toUpperCase()}
      </h1>
      <div className="p-6 max-w-5xl mx-auto">
        <div className="flex justify-center gap-4 mb-6">
          <button
            onClick={() => setView("topics")}
            className={`px-4 py-2 rounded font-semibold ${view === "topics" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            Topics
          </button>
          <button
            onClick={() => setView("exams")}
            className={`px-4 py-2 rounded font-semibold ${view === "exams" ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-800"}`}
          >
            Exams
          </button>
        </div>

        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate(-1)}
            className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-3 py-1 rounded flex items-center"
          >
            ← Go Back
          </button>
          <button
            onClick={() => {
              if (view === "topics") {
                resetModal();
                setShowModal(true);
              } else if (view === "exams") {
                setShowExamEditor(true);
              }
            }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded"
          >
            ➕ {view === "topics" ? "Add Topic" : "Add Exam"}
          </button>
        </div>

        {view === "topics" && (
          <>
            <h3 className="text-xl font-bold mb-4 text-center">
              {subject.replace(/_/g, " ").toUpperCase()} TOPICS
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {topics.map((topic) => (
                <div
                  key={topic.id}
                  className="border p-4 rounded-lg relative hover:bg-blue-50 group"
                >
                  <h4
                    className="font-semibold text-lg cursor-pointer"
                    onClick={() =>
                      navigate(`/admin/curriculum/${curriculum}/${grade}/${subject}/${topic.id}`)
                    }
                  >
                    {topic.title}
                  </h4>
                  <p className="text-sm text-gray-600">{topic.description}</p>
                  {topic.videoUrl && (
                    <div className="mt-2 rounded overflow-hidden max-h-64">
                      <video
                        controls
                        preload="metadata"
                        className="w-full h-full object-cover rounded"
                        onLoadedMetadata={(e) => {
                          const video = e.target;
                          const duration = video.duration;
                          const formatted = `${Math.floor(duration / 60)}:${
                            Math.floor(duration % 60).toString().padStart(2, "0")
                          }`;
                          const label = video.nextElementSibling;
                          if (label) label.textContent = `Duration: ${formatted} min`;
                        }}
                      >
                        <source src={topic.videoUrl} type="video/mp4" />
                        Your browser does not support the video tag.
                      </video>
                      <p className="text-xs text-gray-500 mt-1">Loading duration...</p>
                    </div>
                  )}

                  <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                    <button
                      onClick={() => handleEditClick(topic)}
                      className="text-blue-600 hover:text-blue-800"
                      title="Edit"
                    >
                      ✏️
                    </button>
                    <button
                      onClick={() => handleDeleteClick(topic.id)}
                      className="text-red-600 hover:text-red-800"
                      title="Delete"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

{view === "exams" && (
  <div className="space-y-4">
   {showExamEditor && (
  <ExamEditor
    examId={selectedExam?.id || null}
    initialContent={selectedExam?.content || ""}
    onClose={() => {
      setShowExamEditor(false);
      setSelectedExam(null);
      fetchExams();
    }}
  />
)}

    <h3 className="text-xl font-bold text-center mb-4">
      {subject.replace(/_/g, " ").toUpperCase()} EXAMS
    </h3>

    {exams.length === 0 ? (
      <p className="text-gray-500 text-center">No exams available.</p>
    ) : (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 gap-4">
        {exams.map((exam) => (
          <div
  key={exam.id}
  className="border p-4 rounded-lg bg-gray-50 shadow hover:shadow-md cursor-pointer"
  onClick={() => {
    setSelectedExam(exam);
    setShowExamEditor(true);
  }}
>
  <div className="prose prose-sm max-w-none" dangerouslySetInnerHTML={{ __html: exam.content }} />
  <p className="text-xs text-gray-500 mt-2">
    Created: {exam.createdAt?.toDate?.().toLocaleString()}
  </p>
</div>

        ))}
      </div>
    )}
  </div>
)}




        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
            <div className="bg-white p-6 rounded shadow-lg relative w-full max-w-md">
              <button
                onClick={() => setShowModal(false)}
                className="absolute top-2 right-3 text-xl text-gray-600 hover:text-red-600"
              >
                &times;
              </button>
              <h2 className="text-lg font-bold mb-4 text-blue-700">
                {isEditing ? "Edit Topic" : "Add New Topic"}
              </h2>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Topic Title"
                className="w-full p-2 border border-gray-300 rounded mb-3"
                disabled={isSubmitting}
              />
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Topic Description"
                rows={3}
                className="w-full p-2 border border-gray-300 rounded mb-3"
                disabled={isSubmitting}
              />
              <input
                type="file"
                accept="video/*"
                onChange={(e) => {
                  const selectedFile = e.target.files[0];
                  setFile(selectedFile);
                }}
                className="mb-4"
                disabled={isSubmitting}
              />

              {uploadProgress > 0 && uploadProgress < 100 && (
                <div className="mb-4">
                  <p className="text-sm text-gray-600">Uploading: {uploadProgress}%</p>
                  <div className="w-full bg-gray-200 h-2 rounded">
                    <div
                      className="bg-blue-600 h-2 rounded"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <button
                onClick={handleAddOrEditTopic}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-2 rounded disabled:opacity-50"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Submitting..." : isEditing ? "Update" : "Submit"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SubjectView;
