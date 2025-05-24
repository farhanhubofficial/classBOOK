import React, { useState, useEffect } from "react";
import UploadAssignment from "./UploadAssignment";
import UploadLesson from "./UploadLesson";
import AssignmentAnswers from "./ViewSubmittedAssignment"; // Corrected import

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
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

function SomaliBeginner() {
const level = "Bilow (Beginner)";

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
  const [viewingSubmissionFor, setViewingSubmissionFor] = useState(null);
  const [expandedRows, setExpandedRows] = useState([]);

  const navigate = useNavigate();

  const toggleRow = (id) => {
    setExpandedRows((prev) =>
      prev.includes(id) ? prev.filter((rowId) => rowId !== id) : [...prev, id]
    );
  };

  const fetchStudents = async () => {
  const q = collection(db, "users");
  const snap = await getDocs(q);
  const levelStudents = [];
  snap.forEach((doc) => {
    const data = doc.data();
    if (data.grade === "Bilow (Beginner)" && data.curriculum === "Somali Course") {
      levelStudents.push({ id: doc.id, ...data });
    }
  });
  setStudents(levelStudents);
};


  useEffect(() => {
    fetchStudents();
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

    // Update classroom field in user docs
    await Promise.all(
      form.students.map(async (studentId) => {
        const studentRef = doc(db, "users", studentId);
        await updateDoc(studentRef, {
          classroom: form.name,
        });
      })
    );

    setClassrooms([...classrooms, form]);
    setForm({ name: "", time: "", teacher: "", students: [] });
    setFormOpen(false);

    // Refresh students after update
    fetchStudents();
  };

  const handleDelete = async (classroomName) => {
    const confirmed = window.confirm("Are you sure you want to delete this classroom?");
    if (confirmed) {
      const classroomRef = doc(db, "englishLevels", level, "subClassrooms", classroomName);
      await deleteDoc(classroomRef);
      alert("Classroom deleted!");

      await Promise.all(
        students.map(async (student) => {
          if (student.classroom === classroomName) {
            const studentRef = doc(db, "users", student.id);
            await updateDoc(studentRef, {
              classroom: "",
            });
          }
        })
      );

      setClassrooms(classrooms.filter((c) => c.name !== classroomName));
      fetchStudents();
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

    // Update students: remove from old, assign new ones
    const oldStudents = classrooms.find((c) => c.name === form.name)?.students || [];
    const removedStudents = oldStudents.filter((id) => !form.students.includes(id));
    const addedStudents = form.students.filter((id) => !oldStudents.includes(id));

    await Promise.all([
      ...removedStudents.map(async (id) => {
        const studentRef = doc(db, "users", id);
        await updateDoc(studentRef, { classroom: "" });
      }),
      ...addedStudents.map(async (id) => {
        const studentRef = doc(db, "users", id);
        await updateDoc(studentRef, { classroom: form.name });
      }),
    ]);

    alert("Classroom updated!");
    setClassrooms(classrooms.map((c) => (c.name === form.name ? form : c)));
    setForm({ name: "", time: "", teacher: "", students: [] });
    setFormOpen(false);
    setEditingClassroom(null);

    fetchStudents();
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
    await updateDoc(studentRef, editingStudent);
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
      setViewingSubmissionFor(null);
      setUploadingAssignmentFor(null);
      setUploadingLessonFor(null);
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

      {/* Student table */}
      <div className="w-full max-w-4xl mx-auto space-y-4">
        {filteredStudents.map((student) => {
          const isExpanded = expandedRows.includes(student.id);
          return (
            <div
              key={student.id}
              className="border border-gray-300 p-4 rounded-lg shadow-sm"
            >
              <div className="flex justify-between items-center">
                <div
                  className="cursor-pointer text-lg font-medium"
                  onClick={() => toggleRow(student.id)}
                >
                  {student.firstName} {student.lastName}
                </div>
                <div className="flex items-center gap-4">
                  <button
                    className="text-green-600 hover:text-green-800"
                    onClick={() => handleStudentEdit(student)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={() => handleStudentDelete(student.id)}
                  >
                    <FaTrashAlt />
                  </button>
                  <button
                    className="text-gray-500 hover:text-black"
                    onClick={() => toggleRow(student.id)}
                  >
                    {isExpanded ? <FaChevronUp /> : <FaChevronDown />}
                  </button>
                </div>
              </div>

              {isExpanded && (
                <div className="mt-3 text-sm text-gray-700 space-y-1">
                  <div><strong>Email:</strong> {student.email}</div>
                  <div><strong>Classroom:</strong> {student.classroom || "None"}</div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modals */}
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
                onClick={() => setViewingSubmissionFor(selectedClassroom.name)} // Viewing Assignment
              >
                View Submitted Assignments
              </button>
              <button
                className="bg-yellow-600 text-white px-4 py-2 rounded-md mt-4"
                onClick={() => setUploadingAssignmentFor(selectedClassroom.name)} // Upload Assignment
              >
                Upload Assignment
              </button>
              <button
                className="bg-teal-600 text-white px-4 py-2 rounded-md mt-4"
                onClick={() => setUploadingLessonFor(selectedClassroom.name)} // Upload Lesson
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
            <AssignmentAnswers classroomName={viewingSubmissionFor} /> {/* Viewing Submitted Assignments */}
          </div>
        </div>
      )}

      {uploadingAssignmentFor && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center modal-overlay"
          onClick={handleModalClose}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl w-full">
            <UploadAssignment
              classroomName={uploadingAssignmentFor}
              onClose={() => setUploadingAssignmentFor(null)} // Fixed here
            />
          </div>
        </div>
      )}

      {uploadingLessonFor && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center modal-overlay"
          onClick={handleModalClose}
        >
          <div className="bg-white p-8 rounded-lg shadow-lg max-w-6xl w-full">
            <UploadLesson
              classroomName={uploadingLessonFor}
              onClose={() => setUploadingLessonFor(null)} // Fixed here
            />
          </div>
        </div>
      )}
      {/* Register Classroom Modal */}
{formOpen && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 modal-overlay"
    onClick={handleModalClose}
  >
    <div
      className="bg-white rounded-lg shadow-lg p-6 w-full max-w-lg"
      onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inside
    >
      <h2 className="text-xl font-bold mb-4">
        {editingClassroom ? "Edit Classroom" : "Register New Classroom"}
      </h2>

      <div className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Classroom Name"
          value={form.name}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
          disabled={!!editingClassroom} // prevent renaming when editing
        />
        <input
          type="text"
          name="teacher"
          placeholder="Teacher Name"
          value={form.teacher}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          name="time"
          placeholder="Class Time"
          value={form.time}
          onChange={handleChange}
          className="w-full p-2 border border-gray-300 rounded"
        />

        <div>
          <label className="block mb-2 font-medium">Assign Students</label>
          <select
            multiple
            name="students"
            value={form.students}
            onChange={handleSelect}
            className="w-full p-2 border border-gray-300 rounded h-40"
          >
            {students.map((student) => (
              <option key={student.id} value={student.id}>
                {student.firstName} {student.lastName}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end space-x-3">
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded"
            onClick={() => {
              setFormOpen(false);
              setForm({ name: "", time: "", teacher: "", students: [] });
              setEditingClassroom(null);
            }}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={editingClassroom ? handleUpdate : handleSubmit}
          >
            {editingClassroom ? "Update" : "Submit"}
          </button>
        </div>
      </div>
    </div>
  </div>
)}


{editingStudent && (
  <div
    className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 modal-overlay"
    onClick={handleModalClose}
  >
    <div
      className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md"
      onClick={(e) => e.stopPropagation()}
    >
      <h2 className="text-xl font-bold mb-4">Edit Student</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="First Name"
          value={editingStudent.firstName}
          onChange={(e) =>
            setEditingStudent({ ...editingStudent, firstName: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="text"
          placeholder="Last Name"
          value={editingStudent.lastName}
          onChange={(e) =>
            setEditingStudent({ ...editingStudent, lastName: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={editingStudent.email}
          onChange={(e) =>
            setEditingStudent({ ...editingStudent, email: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded"
        />
        <select
          value={editingStudent.classroom}
          onChange={(e) =>
            setEditingStudent({ ...editingStudent, classroom: e.target.value })
          }
          className="w-full p-2 border border-gray-300 rounded"
        >
          <option value="">Select Classroom</option>
          {classrooms.map((c) => (
            <option key={c.name} value={c.name}>
              {c.name}
            </option>
          ))}
        </select>

        <div className="flex justify-end space-x-3">
          <button
            className="bg-gray-300 text-black px-4 py-2 rounded"
            onClick={() => setEditingStudent(null)}
          >
            Cancel
          </button>
          <button
            className="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={handleStudentUpdate}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  </div>
)}


    </div>
    
  );
}

export default SomaliBeginner;
