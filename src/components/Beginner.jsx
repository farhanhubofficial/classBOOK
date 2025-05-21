import React, { useState, useEffect } from "react";
import UploadAssignment from "./UploadAssignment";
import UploadLesson from "./UploadLesson";
import ViewSubmittedAssignment from "./ViewSubmittedAssignment"; // ✅ NEW
import AssignmentAnswers from "./ViewSubmittedAssignment"; // ✅ ADDED

import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase-config";
import {
  FaEdit,
  FaTrashAlt,
  FaChevronDown,
  FaChevronUp,
  FaUpload,
  FaFileAlt,
  FaBook,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function Beginner() {
  const level = "A1 (Beginner)";
  const [students, setStudents] = useState([]);
  const [classrooms, setClassrooms] = useState([]);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({
    name: "",
    time: "",
    teacher: "",
    students: [],
  });
  const [editingClassroom, setEditingClassroom] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState(null);
  const [editingStudent, setEditingStudent] = useState(null);
  const [showStudentDetails, setShowStudentDetails] = useState(false);
  const [uploadingAssignmentFor, setUploadingAssignmentFor] = useState(null);
  const [uploadingLessonFor, setUploadingLessonFor] = useState(null);
  const [viewingSubmissionFor, setViewingSubmissionFor] = useState(null); // ✅ NEW

  const [expandedRows, setExpandedRows] = useState([]);
  const navigate = useNavigate();

  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  useEffect(() => {
    const fetchData = async () => {
      const q = collection(db, "users");
      const snap = await getDocs(q);
      const levelStudents = [];
      snap.forEach((doc) => {
        const data = doc.data();
        if (data.grade === level && data.curriculum === "English Course") {
          levelStudents.push({ id: doc.id, ...data });
        }
      });
      setStudents(levelStudents);
    };
    fetchData();
  }, []);

  useEffect(() => {
    const fetchClassrooms = async () => {
      const q = collection(db, "englishLevels", level, "subClassrooms");
      const snap = await getDocs(q);
      const levelClassrooms = [];
      snap.forEach((doc) => {
        levelClassrooms.push({ id: doc.id, ...doc.data() });
      });
      setClassrooms(levelClassrooms);
    };
    fetchClassrooms();
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSelect = (e) => {
    const selected = Array.from(e.target.selectedOptions, (option) => option.value);
    setForm({ ...form, students: selected });
  };

  const handleSubmit = async () => {
    if (!form.name || !form.time || !form.teacher || form.students.length === 0) {
      alert("Please fill all fields.");
      return;
    }

    const classroomRef = doc(db, "englishLevels", level, "subClassrooms", form.name);
    await setDoc(classroomRef, form);
    alert("Classroom registered!");

    form.students.forEach(async (studentId) => {
      const studentRef = doc(db, "users", studentId);
      await updateDoc(studentRef, {
        classroom: form.name,
      });
    });

    setClassrooms([...classrooms, form]);
    setForm({ name: "", time: "", teacher: "", students: [] });
    setFormOpen(false);
  };

  const handleDelete = async (classroomName) => {
    const confirmed = window.confirm("Are you sure you want to delete this classroom?");
    if (confirmed) {
      const classroomRef = doc(db, "englishLevels", level, "subClassrooms", classroomName);
      await deleteDoc(classroomRef);
      alert("Classroom deleted!");

      students.forEach(async (student) => {
        if (student.classroom === classroomName) {
          const studentRef = doc(db, "users", student.id);
          await updateDoc(studentRef, {
            classroom: "",
          });
        }
      });

      setClassrooms(classrooms.filter((c) => c.name !== classroomName));
    }
  };

  const handleEdit = (classroom) => {
    setEditingClassroom(classroom);
    setForm(classroom);
    setFormOpen(true);
  };

  const handleUpdate = async () => {
    if (!form.name || !form.time || !form.teacher || form.students.length === 0) {
      alert("Please fill all fields.");
      return;
    }

    const classroomRef = doc(db, "englishLevels", level, "subClassrooms", form.name);
    await updateDoc(classroomRef, form);
    alert("Classroom updated!");

    form.students.forEach(async (studentId) => {
      const studentRef = doc(db, "users", studentId);
      await updateDoc(studentRef, {
        classroom: form.name,
      });
    });

    setClassrooms(classrooms.map((c) => (c.name === form.name ? form : c)));
    setForm({ name: "", time: "", teacher: "", students: [] });
    setFormOpen(false);
    setEditingClassroom(null);
  };

  const handleStudentEdit = (student) => {
    setEditingStudent(student);
  };

  const handleStudentUpdate = async () => {
    if (!editingStudent.firstName || !editingStudent.lastName || !editingStudent.email || !editingStudent.classroom) {
      alert("Please fill all fields.");
      return;
    }

    const studentRef = doc(db, "users", editingStudent.id);
    await updateDoc(studentRef, {
      firstName: editingStudent.firstName,
      lastName: editingStudent.lastName,
      email: editingStudent.email,
      classroom: editingStudent.classroom,
    });
    alert("Student updated!");
    setStudents(students.map((s) => (s.id === editingStudent.id ? editingStudent : s)));
    setEditingStudent(null);
  };

  const handleStudentDelete = async (studentId) => {
    const confirmed = window.confirm("Are you sure you want to delete this student?");
    if (confirmed) {
      const studentRef = doc(db, "users", studentId);
      await deleteDoc(studentRef);
      alert("Student deleted!");
      setStudents(students.filter((s) => s.id !== studentId));
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const filteredStudents = students.filter((student) =>
    student.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.lastName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleClassroomClick = (classroom) => {
    setSelectedClassroom(classroom);
    setShowStudentDetails(true);
  };

  const handleClose = () => {
    navigate("/admin/curriculum/english-course");
  };

  const handleModalClose = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setFormOpen(false);
      setEditingStudent(null);
      setShowStudentDetails(false);
      setViewingSubmissionFor(null); // ✅ CLOSE MODAL
    }
  };

  return (
    <div className="w-full max-w-screen overflow-x-hidden relative py-6">
      <div className="flex justify-around items-center mb-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{level}</h1>
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-full shadow-md"
          onClick={() => setFormOpen(true)}
        >
          Register Classroom
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-6">
        {classrooms.map((classroom) => (
          <div
            key={classroom.name}
            className="border p-4 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            onClick={() => handleClassroomClick(classroom)}
          >
            <h3 className="text-lg sm:text-xl font-semibold">{classroom.name}</h3>
            <p>Teacher: {classroom.teacher}</p>
            <p>Time: {classroom.time}</p>
            <div className="flex justify-between mt-2">
              <button
                className="text-green-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEdit(classroom);
                }}
              >
                <FaEdit />
              </button>
              <button
                className="text-red-600"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(classroom.name);
                }}
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            className="w-full p-2 pl-10 pr-4 border rounded-lg"
            placeholder="Search student"
            onChange={handleSearchChange}
            value={searchTerm}
          />
        </div>
      </div>

      {/* student table omitted for brevity — no change */}

      {showStudentDetails && selectedClassroom && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center modal-overlay"
          onClick={handleModalClose}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl w-full flex flex-col sm:flex-row gap-8">
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-4">Students in {selectedClassroom.name}</h2>
              <ul className="max-h-96 overflow-y-auto">
                {students
                  .filter((student) => student.classroom === selectedClassroom.name)
                  .map((student) => (
                    <li key={student.id} className="mb-2">
                      {student.firstName} {student.lastName}
                    </li>
                  ))}
              </ul>
            </div>
            <div className="flex-1">
              <h2 className="text-xl font-bold mb-4">Classroom Actions</h2>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded-md"
                onClick={() => setViewingSubmissionFor(selectedClassroom.name)} // ✅ ON BUTTON CLICK
              >
                View Submitted Assignments
              </button>
              <button
                className="bg-yellow-600 text-white px-4 py-2 rounded-md mt-4"
                onClick={() => setUploadingAssignmentFor(selectedClassroom.name)} // ✅ UPLOAD ASSIGNMENT BUTTON
              >
                Upload Assignment
              </button>
              <button
                className="bg-teal-600 text-white px-4 py-2 rounded-md mt-4"
                onClick={() => setUploadingLessonFor(selectedClassroom.name)} // ✅ UPLOAD LESSON BUTTON
              >
                Upload Lesson
              </button>
            </div>
          </div>
        </div>
      )}

      {viewingSubmissionFor && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center modal-overlay"
          onClick={handleModalClose}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl w-full">
            <AssignmentAnswers classroomName={viewingSubmissionFor} /> {/* ✅ SHOW ASSIGNMENT ANSWERS */}
          </div>
        </div>
      )}

      {uploadingAssignmentFor && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center modal-overlay"
          onClick={handleModalClose}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl w-full">
            <UploadAssignment classroomName={uploadingAssignmentFor} /> {/* ✅ UPLOAD ASSIGNMENT */}
          </div>
        </div>
      )}

      {uploadingLessonFor && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center modal-overlay"
          onClick={handleModalClose}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl w-full">
            <UploadLesson classroomName={uploadingLessonFor} /> {/* ✅ UPLOAD LESSON */}
          </div>
        </div>
      )}
    </div>
  );
}

export default Beginner;
