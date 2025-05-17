import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa";
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();

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
    setShowStudentDetails(true);  // Open student details modal
  };

  const handleClose = () => {
    navigate("/admin/curriculum/english-course"); // Navigate back to the curriculum page
  };

  const handleModalClose = (e) => {
    if (e.target.classList.contains("modal-overlay")) {
      setFormOpen(false);
      setEditingStudent(null);
      setShowStudentDetails(false);
    }
  };

  return (
  <div className="w-full max-w-screen overflow-x-hidden relative  py-6">


      <div className="flex justify-around items-center mb-4">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold">{level}</h1>
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-full shadow-md"
          onClick={() => setFormOpen(true)}
        >
          Register Classroom
        </button>
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

      {/* Make the table scrollable on smaller screens */}
      <div className=" mb-6">
        <table className="w-full table-auto border">
          <thead>
            <tr>
              <th className="border px-4 py-2 text-xs sm:text-sm">Name</th>
              <th className="border px-4 py-2 text-xs sm:text-sm">Email</th>
              <th className="border px-4 py-2 text-xs sm:text-sm">Classroom</th>
              <th className="border px-4 py-2 text-xs sm:text-sm">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.map((s) => (
              <tr key={s.id}>
                <td className="border px-4 py-2 text-xs sm:text-sm">{s.firstName} {s.lastName}</td>
                <td className="border px-4 py-2 text-xs sm:text-sm">{s.email}</td>
                <td className="border px-4 py-2 text-xs sm:text-sm">{s.classroom || "Not assigned"}</td>
                <td className="border px-4 py-2">
                  <button
                    className="text-green-600"
                    onClick={() => handleStudentEdit(s)}
                  >
                    <FaEdit />
                  </button>
                  <button
                    className="ml-2 text-red-600"
                    onClick={() => handleStudentDelete(s.id)}
                  >
                    <FaTrashAlt />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Classroom Student Details Modal */}
      {showStudentDetails && selectedClassroom && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center modal-overlay"
          onClick={handleModalClose}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Students in {selectedClassroom.name}</h2>
            <ul>
              {students.filter(student => student.classroom === selectedClassroom.name).map((student) => (
                <li key={student.id} className="mb-2">{student.firstName} {student.lastName}</li>
              ))}
            </ul>
            <button
              className="bg-gray-600 text-white px-4 py-2 rounded"
              onClick={() => setShowStudentDetails(false)}
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Modal Form for Classroom Registration/Editing */}
      {formOpen && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center modal-overlay"
          onClick={handleModalClose}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-full sm:w-96">
            <h2 className="text-xl font-bold mb-4">{editingClassroom ? "Edit Classroom" : "Register Classroom"}</h2>
            <input
              type="text"
              name="name"
              placeholder="Classroom Name"
              className="w-full p-2 border rounded mb-2"
              onChange={handleChange}
              value={form.name}
            />
            <input
              type="text"
              name="time"
              placeholder="Class Time"
              className="w-full p-2 border rounded mb-2"
              onChange={handleChange}
              value={form.time}
            />
            <input
              type="text"
              name="teacher"
              placeholder="Teacher Name"
              className="w-full p-2 border rounded mb-2"
              onChange={handleChange}
              value={form.teacher}
            />
            <select
              multiple
              className="w-full p-2 border rounded mb-2"
              onChange={handleSelect}
              value={form.students}
            >
              <option disabled>Choose students</option>
              {students.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.firstName} {s.lastName}
                </option>
              ))}
            </select>

            <button
              className="bg-green-600 text-white px-4 py-2 rounded mr-2"
              onClick={editingClassroom ? handleUpdate : handleSubmit}
            >
              {editingClassroom ? "Update" : "Submit"}
            </button>

            <button
              className="bg-gray-600 text-white px-4 py-2 rounded"
              onClick={() => {
                setFormOpen(false);
                setForm({ name: "", time: "", teacher: "", students: [] });
                setEditingClassroom(null);
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Student Edit Modal */}
      {editingStudent && (
        <div
          className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center modal-overlay"
          onClick={handleModalClose}
        >
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">Edit Student</h2>
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="w-full p-2 border rounded mb-2"
              onChange={(e) => setEditingStudent({ ...editingStudent, firstName: e.target.value })}
              value={editingStudent.firstName}
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
              className="w-full p-2 border rounded mb-2"
              onChange={(e) => setEditingStudent({ ...editingStudent, lastName: e.target.value })}
              value={editingStudent.lastName}
            />
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="w-full p-2 border rounded mb-2"
              onChange={(e) => setEditingStudent({ ...editingStudent, email: e.target.value })}
              value={editingStudent.email}
            />
            <select
              className="w-full p-2 border rounded mb-2"
              onChange={(e) => setEditingStudent({ ...editingStudent, classroom: e.target.value })}
              value={editingStudent.classroom}
            >
              <option disabled>Current Classroom: {editingStudent.classroom || "Not assigned"}</option>
              {classrooms.map((classroom) => (
                <option key={classroom.id} value={classroom.name}>
                  {classroom.name}
                </option>
              ))}
            </select>

            <button
              className="bg-green-600 text-white px-4 py-2 rounded mr-2"
              onClick={handleStudentUpdate}
            >
              Update
            </button>

            <button
              className="bg-gray-600 text-white px-4 py-2 rounded"
              onClick={() => setEditingStudent(null)}
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Beginner;
