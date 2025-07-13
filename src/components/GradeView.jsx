import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  updateDoc,
  doc,
} from "firebase/firestore";

const GradeView = () => {
  const { curriculum, grade } = useParams(); // ✅ include curriculum
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newSubject, setNewSubject] = useState("");
  const [editSubjectId, setEditSubjectId] = useState(null);
  const [editSubjectName, setEditSubjectName] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  const navigate = useNavigate();

  const fetchSubjects = async () => {
    const subjectsRef = collection(db, curriculum, grade, "subjects"); // ✅ dynamic path
    const snapshot = await getDocs(subjectsRef);
    const subjectList = snapshot.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name,
    }));
    setSubjects(subjectList);
  };

  useEffect(() => {
    fetchSubjects();
  }, [curriculum, grade]); // ✅ add curriculum as dependency too

  const handleAddSubject = async () => {
    if (!newSubject.trim()) {
      alert("Subject name is required.");
      return;
    }

    try {
      const subjectsRef = collection(db, curriculum, grade, "subjects"); // ✅ dynamic path
      await addDoc(subjectsRef, { name: newSubject.trim() });
      setNewSubject("");
      setShowModal(false);
      fetchSubjects();
    } catch (error) {
      console.error("Error adding subject:", error);
      alert("Failed to add subject.");
    }
  };

  const handleDeleteSubject = async (subjectId) => {
    const confirmed = window.confirm("Are you sure you want to delete this subject?");
    if (!confirmed) return;

    try {
      await deleteDoc(doc(db, curriculum, grade, "subjects", subjectId)); // ✅ dynamic path
      fetchSubjects();
    } catch (error) {
      console.error("Error deleting subject:", error);
      alert("Failed to delete subject.");
    }
  };

  const handleEditClick = (subject) => {
    setEditSubjectId(subject.id);
    setEditSubjectName(subject.name);
    setShowEditModal(true);
  };

  const handleUpdateSubject = async () => {
    if (!editSubjectName.trim()) {
      alert("Subject name is required.");
      return;
    }

    try {
      const subjectRef = doc(db, curriculum, grade, "subjects", editSubjectId); // ✅ dynamic path
      await updateDoc(subjectRef, { name: editSubjectName.trim() });
      setShowEditModal(false);
      fetchSubjects();
    } catch (error) {
      console.error("Error updating subject:", error);
      alert("Failed to update subject.");
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6 gap-4">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded w-full sm:w-auto"
        >
          ← Go Back
        </button>
        <button
          onClick={() => setShowModal(true)}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full sm:w-auto"
        >
          ➕ Register New Subject
        </button>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold mb-4 text-center">
        {grade.replace("_", " ").toUpperCase()} Subjects
      </h3>

      {/* Subject Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
        {subjects.map((subject) => (
          <div
            key={subject.id}
            className="bg-green-100 p-4 rounded shadow-md w-full max-w-xs flex flex-col justify-between"
          >
            <button
              onClick={() =>
                navigate(`/admin/curriculum/${curriculum}/${grade}/${subject.name}`)
              }
              className="bg-green-500 text-white w-full py-2 rounded hover:bg-green-600 mb-2 text-sm sm:text-base"
            >
              {subject.name.toUpperCase()}
            </button>
            <div className="flex justify-between text-xs sm:text-sm">
              <button
                onClick={() => handleEditClick(subject)}
                className="text-green-600 hover:text-green-800"
              >
                ✏️ Edit
              </button>
              <button
                onClick={() => handleDeleteSubject(subject.id)}
                className="text-red-600 hover:text-red-800"
              >
                🗑️ Delete
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Register Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg relative w-full max-w-md">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-2 right-3 text-xl text-gray-600 hover:text-red-600"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4 text-blue-700">Register New Subject</h2>
            <input
              type="text"
              value={newSubject}
              onChange={(e) => setNewSubject(e.target.value)}
              placeholder="Subject Name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <button
              onClick={handleAddSubject}
              className="bg-blue-600 text-white px-4 py-2 rounded w-full hover:bg-blue-700"
            >
              Submit
            </button>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded shadow-lg relative w-full max-w-md">
            <button
              onClick={() => setShowEditModal(false)}
              className="absolute top-2 right-3 text-xl text-gray-600 hover:text-red-600"
            >
              &times;
            </button>
            <h2 className="text-lg font-bold mb-4 text-green-700">Edit Subject</h2>
            <input
              type="text"
              value={editSubjectName}
              onChange={(e) => setEditSubjectName(e.target.value)}
              placeholder="Subject Name"
              className="w-full p-2 border border-gray-300 rounded mb-4"
            />
            <button
              onClick={handleUpdateSubject}
              className="bg-green-600 text-white px-4 py-2 rounded w-full hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default GradeView;
