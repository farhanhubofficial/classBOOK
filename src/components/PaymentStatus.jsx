import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  updateDoc,
  doc,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { FaCheckCircle, FaTimesCircle } from "react-icons/fa";
import moment from "moment";
import { Line } from "react-chartjs-2";
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

function PaymentStatus() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState(null);
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
              feesPaid: data.feesPaid || Math.floor(Math.random() * 5000) + 1000,
              feesBalance: data.feesBalance || Math.floor(Math.random() * 3000),
              lastPaid: data.lastPaid || null,
            };
          })
          .filter((s) => s.category === "learner");

        setStudents(studentsData);
      } catch (err) {
        console.error("Error fetching students:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStudents();
  }, []);

  const markAsPaid = async (studentId) => {
    const now = new Date();
    setStudents((prev) =>
      prev.map((s) =>
        s.id === studentId ? { ...s, feesBalance: 0, lastPaid: now } : s
      )
    );

    try {
      const studentRef = doc(db, "users", studentId);
      await updateDoc(studentRef, {
        feesBalance: 0,
        lastPaid: now,
      });
    } catch (err) {
      console.error("Error updating payment:", err);
    }
  };

  const isPaidStatus = (student) => {
    if (!student.feesBalance || student.feesBalance === 0) return true;

    if (student.lastPaid) {
      const paidDate = moment(student.lastPaid.toDate?.() || student.lastPaid);
      const daysSincePaid = moment().diff(paidDate, "days");
      return daysSincePaid <= 15;
    }

    return false;
  };

  const totalPaid = students.reduce((acc, s) => acc + (s.feesPaid || 0), 0);
  const totalUnpaid = students.reduce((acc, s) => acc + (s.feesBalance || 0), 0);

  const handleCardClick = (type) => {
    setSelectedType(type);
  };

  const filteredStudents = students.filter((s) =>
    selectedType === "paid"
      ? isPaidStatus(s)
      : selectedType === "unpaid"
      ? !isPaidStatus(s)
      : false
  );

  const monthlyPayments = Array.from({ length: 12 }, (_, i) => {
    const monthName = moment().month(i).format("MMMM");
    const totalPaid = students
      .filter((s) => {
        const date = s.lastPaid?.toDate?.() || s.lastPaid;
        return moment(date).format("MMMM") === monthName;
      })
      .reduce((sum, s) => sum + s.feesPaid, 0);

    return {
      month: monthName,
      totalPaid,
    };
  });

  const chartData = {
    labels: monthlyPayments.map((d) => d.month),
    datasets: [
      {
        label: "Fees Paid",
        data: monthlyPayments.map((d) => d.totalPaid),
        borderColor: "green",
        backgroundColor: "rgba(0, 128, 0, 0.2)",
        fill: true,
      },
    ],
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payment Status</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div
          className="bg-green-100 text-green-800 p-4 rounded-lg shadow cursor-pointer"
          onClick={() => handleCardClick("paid")}
        >
          <h2 className="font-semibold text-lg">
            Total Fees Paid in {currentMonth}
          </h2>
          <p className="text-2xl">{totalPaid} KES</p>
        </div>
        <div
          className="bg-red-100 text-red-800 p-4 rounded-lg shadow cursor-pointer"
          onClick={() => handleCardClick("unpaid")}
        >
          <h2 className="font-semibold text-lg">
            Unpaid Balances in {currentMonth}
          </h2>
          <p className="text-2xl">{totalUnpaid} KES</p>
        </div>
      </div>

      {/* Main Table: All Students */}
      <div className="overflow-x-auto mb-12">
        <h2 className="text-lg font-semibold mb-3">All Students</h2>
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
              <th className="p-3">Mark as Paid</th>
            </tr>
          </thead>
          <tbody>
            {students.map((student) => {
              const paid = isPaidStatus(student);
              return (
                <tr key={student.id} className="border-t hover:bg-gray-50">
                  <td className="p-3 sticky left-0 bg-white">
                    {student.firstName} {student.lastName}
                  </td>
                  <td className="p-3">{student.email}</td>
                  <td className="p-3">{student.curriculum}</td>
                  <td className="p-3">{student.grade}</td>
                  <td className="p-3">{student.feesPaid} KES</td>
                  <td className="p-3">{student.feesBalance} KES</td>
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
                  <td className="p-3">
                    {!paid ? (
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
            })}
          </tbody>
        </table>
      </div>

      {/* Filtered Table */}
      {selectedType && (
        <div className="overflow-x-auto mb-12">
          <h2 className="text-lg font-semibold mb-3 capitalize">
            {selectedType} Students
          </h2>
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
                <th className="p-3">Mark as Paid</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map((student) => {
                const paid = isPaidStatus(student);
                return (
                  <tr key={student.id} className="border-t hover:bg-gray-50">
                    <td className="p-3 sticky left-0 bg-white">
                      {student.firstName} {student.lastName}
                    </td>
                    <td className="p-3">{student.email}</td>
                    <td className="p-3">{student.curriculum}</td>
                    <td className="p-3">{student.grade}</td>
                    <td className="p-3">{student.feesPaid} KES</td>
                    <td className="p-3">{student.feesBalance} KES</td>
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
                    <td className="p-3">
                      {!paid ? (
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
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Monthly Chart */}
      <div className="mt-10">
        <h3 className="text-lg font-semibold mb-2">Monthly Fees Chart</h3>
        <Line data={chartData} />
      </div>
    </div>
  );
}

export default PaymentStatus;
