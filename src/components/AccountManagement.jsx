import React, { useState, useEffect } from "react";
import { FaUser, FaLock, FaCog, FaDatabase, FaExclamationTriangle } from "react-icons/fa";
import { MdClose } from "react-icons/md";
import { getAuth, deleteUser, updateEmail } from "firebase/auth";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase-config";

const AccountManagement = ({ adminId }) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [adminData, setAdminData] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [loading, setLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (!adminId) {
      setLoading(false);
      return;
    }

    const fetchAdmin = async () => {
      try {
        const docRef = doc(db, "admins", adminId);
        const snap = await getDoc(docRef);
        if (snap.exists()) {
          setAdminData(snap.data());
        } else {
          console.warn("Admin not found for ID:", adminId);
        }
      } catch (err) {
        console.error("Failed to load admin data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAdmin();
  }, [adminId]);

  const handleSave = async () => {
    try {
      const docRef = doc(db, "admins", adminId);
      await updateDoc(docRef, { ...adminData, updatedAt: new Date().toISOString() });

      if (adminData.email !== currentUser.email) {
        await updateEmail(currentUser, adminData.email);
      }

      alert("Changes saved successfully");
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving admin info:", err);
      alert("Failed to save changes: " + err.message);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      await deleteDoc(doc(db, "admins", adminId));
      await deleteUser(currentUser);

      alert("Account deleted successfully.");
    } catch (err) {
      console.error("Error deleting account:", err);
      alert("Failed to delete account: " + err.message);
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-green-600">Admin Account Management</h2>
          <p className="text-sm text-gray-500">
            Manage administrator details, security, and account actions
          </p>
        </div>
      </div>

      {/* Main Layout */}
      <div className="flex flex-col md:flex-row border border-gray-200 rounded-lg shadow-sm">
        {/* Sidebar */}
        <div className="bg-white border-b md:border-r p-2 flex md:flex-col space-x-2 md:space-x-0 md:space-y-3 w-full md:w-1/4">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 ${
              activeTab === "overview" ? "bg-green-100 font-semibold" : ""
            }`}
          >
            <FaUser /> Overview
          </button>
          <button
            onClick={() => setActiveTab("security")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 ${
              activeTab === "security" ? "bg-green-100 font-semibold" : ""
            }`}
          >
            <FaLock /> Security
          </button>
          <button
            onClick={() => setActiveTab("preferences")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 ${
              activeTab === "preferences" ? "bg-green-100 font-semibold" : ""
            }`}
          >
            <FaCog /> Preferences
          </button>
          <button
            onClick={() => setActiveTab("data")}
            className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 ${
              activeTab === "data" ? "bg-green-100 font-semibold" : ""
            }`}
          >
            <FaDatabase /> Data
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {activeTab === "overview" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Admin Info</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm text-gray-500">Full Name</label>
                  <input
                    value={adminData?.name || ""}
                    readOnly={!isEditing}
                    onChange={(e) => setAdminData({ ...adminData, name: e.target.value })}
                    className={`w-full mt-1 px-3 py-2 border rounded-md ${
                      !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Email</label>
                  <input
                    value={adminData?.email || ""}
                    readOnly={!isEditing}
                    onChange={(e) => setAdminData({ ...adminData, email: e.target.value })}
                    className={`w-full mt-1 px-3 py-2 border rounded-md ${
                      !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Role</label>
                  <input
                    value={adminData?.role || ""}
                    readOnly={!isEditing}
                    onChange={(e) => setAdminData({ ...adminData, role: e.target.value })}
                    className={`w-full mt-1 px-3 py-2 border rounded-md ${
                      !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-500">Status</label>
                  <select
                    value={adminData?.status || "active"}
                    disabled={!isEditing}
                    onChange={(e) => setAdminData({ ...adminData, status: e.target.value })}
                    className={`w-full mt-1 px-3 py-2 border rounded-md ${
                      !isEditing ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="active">Active</option>
                    <option value="suspended">Suspended</option>
                    <option value="disabled">Disabled</option>
                  </select>
                </div>
              </div>

              <div className="mt-4 flex justify-end gap-2">
                {isEditing ? (
                  <>
                    <button
                      onClick={() => setIsEditing(false)}
                      className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded-md"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md"
                    >
                      Save Changes
                    </button>
                  </>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md"
                  >
                    Edit
                  </button>
                )}
              </div>
            </div>
          )}

          {activeTab === "security" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Security Options</h3>
              <p className="text-gray-600">
                Reset password, enable 2FA, and manage login sessions (future features).
              </p>
            </div>
          )}

          {activeTab === "preferences" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Preferences</h3>
              <p className="text-gray-600">Notification & theme settings can go here.</p>
            </div>
          )}

          {activeTab === "data" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Data Management</h3>
              <p className="text-gray-600">
                Export logs, manage admin privileges, or review activity history.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Delete Account Section */}
      <div className="mt-6 flex justify-between items-center border-t pt-4">
        <div className="flex items-center gap-2 text-red-600">
          <FaExclamationTriangle />
          <span>Danger Zone</span>
        </div>
        <button
          onClick={() => setShowDeleteModal(true)}
          className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
        >
          Delete Account
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex justify-center items-center bg-black/50 z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-[90%] max-w-md">
            <h3 className="text-lg font-semibold text-red-600 mb-2">
              Confirm Delete
            </h3>
            <p className="text-gray-600 mb-4">
              Are you sure you want to delete this account? This action cannot be undone.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-md"
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md"
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Anyway"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AccountManagement;
