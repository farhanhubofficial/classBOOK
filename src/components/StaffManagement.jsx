import React, { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase-config";

function StaffManagement() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  useEffect(() => {
    const fetchStaff = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "users"));
        const staffList = querySnapshot.docs
          .map((docSnap) => ({ id: docSnap.id, ...docSnap.data() }))
          .filter(
            (user) =>
              user.role !== "parent" &&
              user.role !== "learner" &&
              user.role !== "admin"
          );
        setStaff(staffList);
      } catch (error) {
        console.error("Error fetching staff:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaff();
  }, []);

  const confirmDelete = (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deleteDoc(doc(db, "users", deleteId));
      setStaff((prev) => prev.filter((user) => user.id !== deleteId));
      setShowConfirm(false);
      setDeleteId(null);
    } catch (error) {
      console.error("Error deleting staff member:", error);
      setShowConfirm(false);
      setDeleteId(null);
    }
  };

  return (
    <div className="p-6">
      {/* Page Title */}
      <h1 className="text-2xl font-bold mb-4">Staff Management</h1>

      {/* Loading Spinner */}
      {loading ? (
        <p className="text-gray-600">Loading staff...</p>
      ) : staff.length === 0 ? (
        <p className="text-gray-600">No staff found.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200 shadow-md rounded-lg">
            <thead>
              <tr className="bg-gray-100 text-left">
                <th className="py-2 px-4 border-b">Name</th>
                <th className="py-2 px-4 border-b">Email</th>
                <th className="py-2 px-4 border-b">Role</th>
                <th className="py-2 px-4 border-b">Phone</th>
                <th className="py-2 px-4 border-b">ID Number</th>
                <th className="py-2 px-4 border-b">Country</th>
                <th className="py-2 px-4 border-b">Date Registered</th>
                <th className="py-2 px-4 border-b text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="py-2 px-4 border-b">
                    {`${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                      "—"}
                  </td>
                  <td className="py-2 px-4 border-b">{user.email || "—"}</td>
                  <td className="py-2 px-4 border-b capitalize">
                    {user.role || "—"}
                  </td>
                  <td className="py-2 px-4 border-b">{user.phone || "—"}</td>
                  <td className="py-2 px-4 border-b">{user.idNumber || "—"}</td>
                  <td className="py-2 px-4 border-b">{user.country || "—"}</td>
                  <td className="py-2 px-4 border-b">
                    {user.dateRegistered
                      ? new Date(
                          user.dateRegistered.seconds * 1000
                        ).toLocaleDateString()
                      : "—"}
                  </td>
                  <td className="py-2 px-4 border-b text-center space-x-2">
                    {/* Delete Button */}
                    <button
                      onClick={() => confirmDelete(user.id)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
                    >
                      Delete
                    </button>
                    {/* Deactivate Button (not functional yet) */}
                    <button className="bg-yellow-500 hover:bg-yellow-600 text-white px-3 py-1 rounded">
                      Deactivate
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80 text-center">
            <h2 className="text-lg font-semibold mb-4">
              Confirm Deletion
            </h2>
            <p className="mb-6">
              Are you sure you want to delete this staff member? This action cannot be undone.
            </p>
            <div className="flex justify-center space-x-4">
              <button
                onClick={handleDelete}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 px-4 py-2 rounded"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StaffManagement;
