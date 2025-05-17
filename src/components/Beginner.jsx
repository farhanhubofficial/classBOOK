import React, { useState, useEffect } from "react";
import {
  collection,
  getDocs,
  doc,
  setDoc,
} from "firebase/firestore";
import { db } from "../firebase-config";;

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
    setClassrooms([...classrooms, form]);
    setForm({ name: "", time: "", teacher: "", students: [] });
    setFormOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold mb-4">{level}</h1>

      {/* Students Table */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Students</h2>
        <table className="w-full table-auto border">
          <thead>
            <tr>
              <th className="border px-4 py-2">Name</th>
              <th className="border px-4 py-2">Email</th>
            </tr>
          </thead>
          <tbody>
            {students.map((s) => (
              <tr key={s.id}>
                <td className="border px-4 py-2">{s.firstName} {s.lastName}</td>
                <td className="border px-4 py-2">{s.email}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Classrooms List */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Registered Classrooms</h2>
        <ul className="list-disc pl-5">
          {classrooms.map((c, idx) => (
            <li key={idx}>
              {c.name} – {c.time} – Teacher: {c.teacher}
            </li>
          ))}
        </ul>
      </div>

      {/* Register Classroom Button */}
      <button
        className="bg-indigo-600 text-white px-4 py-2 rounded"
        onClick={() => setFormOpen(true)}
      >
        Register Classroom
      </button>

      {/* Modal Form */}
      {formOpen && (
        <div className="mt-4 border p-4 bg-gray-50 rounded shadow">
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
            className="bg-green-600 text-white px-4 py-2 rounded"
            onClick={handleSubmit}
          >
            Submit
          </button>
        </div>
      )}
    </div>
  );
}

export default Beginner;
