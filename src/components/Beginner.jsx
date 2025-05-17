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
import { FaEdit, FaTrashAlt, FaTimes } from "react-icons/fa"; // Import close icon
import { useNavigate } from 'react-router-dom'; // Import useNavigate hook

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
  const [selectedClassroom, setSelectedClassroom] = useState(null); // Track selected classroom
  const navigate = useNavigate(); // Initialize the navigate function

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
    alert(`Edit student: ${student.firstName}`);
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
  };

  // Function to handle the close button
  const handleClose = () => {
    navigate("/admin/curriculum/english-course"); // Navigate back to the curriculum page, excluding "beginner"
  };

  return (
    <div className="max-w-6xl relative mx-auto px-4 py-6">

     <button
          className="text-red-600 absolute top-0 left-4 ml-[80rem] text-2xl"
          onClick={handleClose}
        >
          <FaTimes />
        </button>
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">{level}</h1>

        {/* Close Button with FaTimes Icon */}
       

        {/* Register Classroom Button */}
        <button
          className="bg-green-600 text-white px-6 py-3 rounded-full shadow-md"
          onClick={() => setFormOpen(true)}
        >
          Register Classroom
        </button>
      </div>

      {/* Search Input */}
      <div className="mb-6 flex justify-center">
        <div className="relative w-full max-w-md">
          <input
            type="text"
            className="w-full p-2 pl-10 pr-4 border rounded-lg"
            placeholder="Search student"
            onChange={handleSearchChange}
            value={searchTerm}
          />
          <i className="absolute left-3 top-2 text-gray-500 fas fa-search"></i>
        </div>
      </div>

      {/* Classrooms Cards */}
      <div className="grid grid-cols-3 gap-6 mb-6">
        {classrooms.map((classroom) => (
          <div
            key={classroom.name}
            className="border p-4 rounded-lg shadow-md hover:shadow-lg cursor-pointer"
            onClick={() => handleClassroomClick(classroom)}
          >
            <h3 className="text-lg font-semibold">{classroom.name}</h3>
            <p>Teacher: {classroom.teacher}</p>
            <p>Time: {classroom.time}</p>
            <div className="flex justify-between mt-2">
              <button
                className="text-green-600"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents triggering classroom click event
                  handleEdit(classroom);
                }}
              >
                <FaEdit />
              </button>
              <button
                className="text-red-600"
                onClick={(e) => {
                  e.stopPropagation(); // Prevents triggering classroom click event
                  handleDelete(classroom.name);
                }}
              >
                <FaTrashAlt />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Students Table */}
      <table className="w-full table-auto border">
        <thead>
          <tr>
            <th className="border px-4 py-2">Name</th>
            <th className="border px-4 py-2">Email</th>
            <th className="border px-4 py-2">Classroom</th>
            <th className="border px-4 py-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredStudents.map((s) => (
            <tr key={s.id}>
              <td className="border px-4 py-2">{s.firstName} {s.lastName}</td>
              <td className="border px-4 py-2">{s.email}</td>
              <td className="border px-4 py-2">{s.classroom || "Not assigned"}</td>
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

      {/* Modal Form */}
      {formOpen && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
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

      {/* Classroom Details Popup */}
      {selectedClassroom && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex justify-center items-center">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h2 className="text-xl font-bold mb-4">{selectedClassroom.name} Students</h2>
            <ul>
              {students
                .filter((student) => student.classroom === selectedClassroom.name)
                .map((student) => (
                  <li key={student.id} className="mb-2">
                    <p>Name: {student.firstName} {student.lastName}</p>
                    <p>Email: {student.email}</p>
                  </li>
                ))}
            </ul>
            <button
              className="mt-4 bg-gray-600 text-white px-4 py-2 rounded"
              onClick={() => setSelectedClassroom(null)}
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Beginner;
