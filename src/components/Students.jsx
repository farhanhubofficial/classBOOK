import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import Modal from "react-modal";

Modal.setAppElement("#root");

const curriculumLabels = [
  "CBC",
  "IGCSE",
  "English Course",
  "Arabic Course",
  "Somali Course",
  "Kiswahili Course",
];

function Students() {
  const [students, setStudents] = useState([]);
  const [filteredStudents, setFilteredStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalStudents, setModalStudents] = useState([]);

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentCollection = collection(db, "users");
        const snapshot = await getDocs(studentCollection);
        const studentsData = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((s) => s.category === "learner");
        setStudents(studentsData);
        setFilteredStudents(studentsData);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  

  const randomFeesPaid = () => (Math.floor(Math.random() * 5000) + 1000) + " KES";

  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearch(value);
    const filtered = students.filter((student) => {
      const nameMatch = `${student.firstName} ${student.lastName}`.toLowerCase().includes(value);
      const emailMatch = student.email.toLowerCase().includes(value);
      const curriculumMatch = student.curriculum?.toLowerCase().includes(value);
      const gradeMatch = student.grade?.toLowerCase().includes(value);
      return nameMatch || emailMatch || curriculumMatch || gradeMatch;
    });
    setFilteredStudents(filtered);
  };

  const openModalWithStudents = (curriculum) => {
    const currFiltered = students.filter(s =>
      s.curriculum?.toLowerCase() === curriculum.toLowerCase()
    );
    setModalStudents(currFiltered);
    setModalTitle(curriculum);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalStudents([]);
    setModalTitle("");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Students List</h1>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {curriculumLabels.map((label) => {
          const count = students.filter(s => s.curriculum?.toLowerCase() === label.toLowerCase()).length;
          return (
            <div
              key={label}
              onClick={() => openModalWithStudents(label)}
              className="cursor-pointer bg-indigo-100 hover:bg-indigo-200 text-indigo-900 p-4 rounded-lg shadow-md text-center"
            >
              <h2 className="font-semibold text-lg">{label}</h2>
              <p className="text-2xl">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Search Input */}
      <input
        type="text"
        placeholder="Search by name, email, curriculum, or grade"
        value={search}
        onChange={handleSearch}
        className="w-full mb-4 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />

      {/* Students Table */}
      {loading ? (
        <p>Loading students...</p>
      ) : (
        <StudentTable students={filteredStudents} />
      )}

      {/* Modal */}
      <Modal
        isOpen={modalOpen}
        onRequestClose={closeModal}
        contentLabel="Students by Curriculum"
        className="max-w-5xl mx-auto mt-20 bg-white p-6 rounded-lg shadow-lg overflow-auto max-h-[80vh]"
        overlayClassName="fixed inset-0 bg-black bg-opacity-50 flex items-start justify-center"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{modalTitle} Students</h2>
          <button onClick={closeModal} className="text-red-500 font-semibold">Close</button>
        </div>
        <StudentTable students={modalStudents} />
      </Modal>
    </div>
  );
}

// 👇 Component to reuse the student table
const StudentTable = ({ students }) => {
  const randomFeesPaid = () => (Math.floor(Math.random() * 5000) + 1000) + " KES";

  return (
    <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg overflow-hidden text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-3 text-left">Name</th>
          <th className="p-3 text-left">Phone</th>
          <th className="p-3 text-left">Email</th>
          <th className="p-3 text-left">Country</th>
          <th className="p-3 text-left">Curriculum</th>
          <th className="p-3 text-left">Grade/Level</th>
          <th className="p-3 text-left">Date Enrolled</th>
          <th className="p-3 text-left">Fees Status</th>
          <th className="p-3 text-left">Fees Paid</th>
          <th className="p-3 text-left">Parent</th>
        </tr>
      </thead>
      <tbody>
        {students.map((student) => {
          const isPaid = Math.random() > 0.5;
          const parent = student.parent || {};
          return (
            <tr key={student.id} className="border-t hover:bg-gray-50">
              <td className="p-3">{student.firstName} {student.lastName}</td>
              <td className="p-3">{student.phoneNumber || "N/A"}</td>
              <td className="p-3">{student.email}</td>
              <td className="p-3">{student.country || "N/A"}</td>
              <td className="p-3">{student.curriculum}</td>
              <td className="p-3">{student.grade}</td>
              <td className="p-3">{student.createdAt?.seconds
                ? new Date(student.createdAt.seconds * 1000).toLocaleDateString()
                : "N/A"}</td>
              <td className="p-3">
                {isPaid ? (
                  <span className="text-green-600 flex items-center gap-1">
                    <FaCheckCircle /> Paid
                  </span>
                ) : (
                  <span className="text-red-600 flex items-center gap-1">
                    <FaTimesCircle /> Pending
                  </span>
                )}
              </td>
              <td className="p-3">{randomFeesPaid()}</td>
              <td className="p-3">
                {parent?.name ? (
                  <>
                    <strong>{parent.name}</strong>
                    <div className="text-xs">
                      <p>Email: {parent.email}</p>
                      <p>Phone: {parent.phoneNumber}</p>
                    </div>
                  </>
                ) : (
                  "N/A"
                )}
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
};

export default Students;
