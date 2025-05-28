import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import moment from "moment";
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend
);

const curriculumLabels = [
  "CBC",
  "IGCSE",
  "English Course",
  "Arabic Course",
  "Somali Course",
  "Kiswahili Course",
];

function PaymentStatus() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCurriculum, setSelectedCurriculum] = useState(null);
  const [editableFees, setEditableFees] = useState({}); // { [studentId]: { feesPaid, feesBalance } }
  const [searchTerm, setSearchTerm] = useState("");
  const [paymentUpdatedIds, setPaymentUpdatedIds] = useState(new Set()); // Track which have been marked

  const currentMonth = moment().format("MMMM");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        const studentCollection = collection(db, "users");
        const snapshot = await getDocs(studentCollection);
        const studentsData = snapshot.docs
          .map((doc) => {
            const data = doc.data();
            return {
              id: doc.id,
              ...data,
              feesPaid: data.feesPaid ?? Math.floor(Math.random() * 5000) + 1000,
              feesBalance: data.feesBalance ?? Math.floor(Math.random() * 3000),
              lastPaid: data.lastPaid ?? null,
            };
          })
          .filter((s) => s.category === "learner");

        setStudents(studentsData);

        // Initialize editable fees state
        const feesState = {};
        studentsData.forEach((s) => {
          feesState[s.id] = {
            feesPaid: s.feesPaid,
            feesBalance: s.feesBalance,
          };
        });
        setEditableFees(feesState);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const isPaidStatus = (student) => {
    if (!student.feesBalance || student.feesBalance === 0) return true;

    if (student.lastPaid) {
      const paidDate = moment(student.lastPaid.toDate?.() || student.lastPaid);
      const daysSincePaid = moment().diff(paidDate, "days");
      return daysSincePaid <= 15;
    }

    return false;
  };

  const markAsPaid = async (studentId) => {
    const now = new Date();
    const feesPaid = Number(editableFees[studentId]?.feesPaid) || 0;
    const feesBalance = Number(editableFees[studentId]?.feesBalance) || 0;

    // Update local state
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId
          ? { ...s, feesPaid, feesBalance, lastPaid: now }
          : s
      )
    );

    try {
      // Update user document
      const studentRef = doc(db, "users", studentId);
      await updateDoc(studentRef, {
        feesPaid,
        feesBalance,
        lastPaid: now,
      });

      // Add payment document in feespayment collection
      const feesPaymentCollection = collection(db, "feespayment");

      const student = students.find((s) => s.id === studentId);
      const studentName = student ? `${student.firstName} ${student.lastName}` : "";

      // Payment document for paid amount
      await addDoc(feesPaymentCollection, {
        studentId,
        studentName,
        amountPaid: feesPaid,
        paymentDate: now,
        feesStatus: feesBalance === 0 ? "paid" : "pending",
      });

      // If there is balance, add a balance document with status pending
      if (feesBalance > 0) {
        await addDoc(feesPaymentCollection, {
          studentId,
          studentName,
          balanceAmount: feesBalance,
          paymentDate: now,
          feesStatus: "pending",
        });
      }

      // Mark this student as updated/paid in UI
      setPaymentUpdatedIds((prev) => new Set(prev).add(studentId));
    } catch (err) {
      console.error("Error updating payment:", err);
    }
  };

  const handleFeesChange = (studentId, field, value) => {
    setEditableFees((prev) => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value,
      },
    }));
  };

  // Filter students by selected curriculum
  let displayedStudents = selectedCurriculum
    ? students.filter(
        (s) =>
          s.curriculum?.toLowerCase() === selectedCurriculum.toLowerCase()
      )
    : students;

  // Further filter by search term in name or grade (case insensitive)
  if (searchTerm.trim()) {
    const lowerSearch = searchTerm.toLowerCase();
    displayedStudents = displayedStudents.filter((s) => {
      const fullName = `${s.firstName} ${s.lastName}`.toLowerCase();
      const grade = s.grade?.toLowerCase() || "";
      return fullName.includes(lowerSearch) || grade.includes(lowerSearch);
    });
  }

  // Calculate totals for current month (optional: filter by month)
  const totalPaid = displayedStudents.reduce(
    (acc, s) => acc + (Number(s.feesPaid) || 0),
    0
  );
  const totalUnpaid = displayedStudents.reduce(
    (acc, s) => acc + (Number(s.feesBalance) || 0),
    0
  );

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payment Status</h1>

      {/* Curriculum Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        {curriculumLabels.map((label) => {
          const count = students.filter(
            (s) => s.curriculum?.toLowerCase() === label.toLowerCase()
          ).length;
          return (
            <div
              key={label}
              onClick={() =>
                setSelectedCurriculum(
                  selectedCurriculum === label ? null : label
                )
              }
              className={`cursor-pointer p-4 rounded-lg shadow-md text-center ${
                selectedCurriculum === label
                  ? "bg-indigo-600 text-white"
                  : "bg-indigo-100 text-indigo-900 hover:bg-indigo-200"
              }`}
            >
              <h2 className="font-semibold text-lg">{label}</h2>
              <p className="text-2xl">{count}</p>
            </div>
          );
        })}
      </div>

      {/* Search Input */}
      {selectedCurriculum && (
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search by student name or grade"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-1/3 border border-gray-300 rounded px-3 py-2"
          />
        </div>
      )}

      {/* Totals cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-green-100 text-green-800 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-lg">
            Total Fees Paid in {currentMonth}
          </h2>
          <p className="text-2xl">{totalPaid} KES</p>
        </div>
        <div className="bg-red-100 text-red-800 p-4 rounded-lg shadow">
          <h2 className="font-semibold text-lg">
            Unpaid Balances in {currentMonth}
          </h2>
          <p className="text-2xl">{totalUnpaid} KES</p>
        </div>
      </div>

      {/* Student Table */}
      <div className="overflow-x-auto mb-12">
        <table className="min-w-full border text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 sticky left-0 bg-white">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Curriculum</th>
              <th className="p-3">Grade</th>
              <th className="p-3">Fees Paid</th>
              <th className="p-3">Fees Balance</th>
              <th className="p-3">Fees Status</th>
              <th className="p-3">Mark as Paid / Update</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">
                  Loading...
                </td>
              </tr>
            ) : displayedStudents.length === 0 ? (
              <tr>
                <td colSpan={8} className="p-4 text-center">
                  No students found.
                </td>
              </tr>
            ) : (
              displayedStudents.map((student) => {
                const paid = isPaidStatus(student);
                const feesPaidValue =
                  editableFees[student.id]?.feesPaid ?? student.feesPaid;
                const feesBalanceValue =
                  editableFees[student.id]?.feesBalance ?? student.feesBalance;
                const wasMarked = paymentUpdatedIds.has(student.id);

                return (
                  <tr key={student.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 sticky left-0 bg-white">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="p-3">{student.email}</td>
                    <td className="p-3">{student.curriculum}</td>
                    <td className="p-3">{student.grade}</td>

                    {/* Editable Fees Paid */}
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        value={feesPaidValue}
                        onChange={(e) =>
                          handleFeesChange(
                            student.id,
                            "feesPaid",
                            e.target.value
                          )
                        }
                        className="w-24 border rounded px-1 py-0.5"
                        disabled={paid && !wasMarked}
                      />
                    </td>

                    {/* Editable Fees Balance */}
                    <td className="p-3">
                      <input
                        type="number"
                        min="0"
                        value={feesBalanceValue}
                        onChange={(e) =>
                          handleFeesChange(
                            student.id,
                            "feesBalance",
                            e.target.value
                          )
                        }
                        className="w-24 border rounded px-1 py-0.5"
                        disabled={paid && !wasMarked}
                      />
                    </td>

                    {/* Payment status */}
                    <td className="p-3">
                      {paid ? (
                        <span className="text-green-600 flex items-center gap-1">
                          <FaCheckCircle /> Paid
                        </span>
                      ) : (
                        <span className="text-red-600 flex items-center gap-1">
                          <FaTimesCircle /> Pending
                        </span>
                      )}
                    </td>

                    {/* Mark as Paid / Update */}
                    <td className="p-3">
                      {paid && wasMarked ? (
                        <>
                          <span className="text-green-700 font-semibold mr-2">
                            Marked as Paid
                          </span>
                          <button
                            onClick={() =>
                              setPaymentUpdatedIds((prev) => {
                                const copy = new Set(prev);
                                copy.delete(student.id);
                                return copy;
                              })
                            }
                            className="bg-yellow-500 text-white px-2 py-1 rounded hover:bg-yellow-600 text-xs"
                          >
                            Update
                          </button>
                        </>
                      ) : !paid ? (
                        <button
                          onClick={() => markAsPaid(student.id)}
                          className="bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 text-sm"
                        >
                          Mark as Paid
                        </button>
                      ) : (
                        "-"
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* You can keep your Monthly Chart here or remove as needed */}
    </div>
  );
}

export default PaymentStatus;
