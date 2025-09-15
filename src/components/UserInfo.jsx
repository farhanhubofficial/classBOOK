import React, { useEffect, useState } from "react";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { useParams, useNavigate } from "react-router-dom";

function UserInfo({ userId: propUserId, onClose }) {
  const params = useParams();
  const navigate = useNavigate();

  // 🔹 Use prop if provided (modal), else fallback to URL param
  const userId = propUserId || params.userId;

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [confirmDelete, setConfirmDelete] = useState(false); // 🔹 For delete confirmation

  // 🔹 Fetch user
  const fetchUser = async () => {
    if (!userId) return;
    try {
      const ref = doc(db, "users", userId);
      const snapshot = await getDoc(ref);
      if (snapshot.exists()) {
        const data = snapshot.data();
        setUserData(data);
        setEditForm(data); // preload edit form
      } else {
        console.log("No user found");
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, [userId]);

  // 🔹 Toggle active/inactive
  const toggleActive = async () => {
    if (!userData) return;
    try {
      const ref = doc(db, "users", userId);
      await updateDoc(ref, { isActive: !userData.isActive });
      setUserData({ ...userData, isActive: !userData.isActive });
    } catch (err) {
      console.error("Error updating status:", err);
    }
  };

  // 🔹 Delete user
  const deleteUser = async () => {
    try {
      await deleteDoc(doc(db, "users", userId));
      if (onClose) {
        onClose(); // close modal if inside popup
      }
      navigate("/users");
    } catch (err) {
      console.error("Error deleting user:", err);
    }
  };

  // 🔹 Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({ ...prev, [name]: value }));
  };

  // 🔹 Save changes
  const saveChanges = async () => {
    try {
      const ref = doc(db, "users", userId);
      await updateDoc(ref, editForm);
      setUserData(editForm);
      setIsEditing(false);
    } catch (err) {
      console.error("Error saving user:", err);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (!userData) return <p>User not found</p>;

  // ✅ Combine first + last name
  const displayName =
    (userData.firstName || "") + " " + (userData.lastName || "");
  const finalName = displayName.trim() || "Unnamed User";

  return (
    <div className="max-w-lg mx-auto bg-white shadow-md rounded-xl p-6 relative max-h-[80vh] overflow-y-auto">
      {/* Optional close button for modal usage */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-600 hover:text-gray-900"
        >
          ✖
        </button>
      )}

      {/* Profile Picture */}
      {userData.profilePicture ? (
        <img
          src={userData.profilePicture}
          alt="Profile"
          className="w-24 h-24 object-cover rounded-full mx-auto mb-4"
        />
      ) : (
        <div className="w-24 h-24 bg-gray-300 rounded-full mx-auto mb-4" />
      )}

      {/* Basic Info */}
      {!isEditing ? (
        <>
          <h2 className="text-xl font-bold text-center mb-2">{finalName}</h2>
          <p className="text-center text-gray-600 mb-1">{userData.email}</p>
          <p className="text-center text-sm text-gray-500 mb-4">
            Role: {userData.role || "N/A"}
          </p>

          {/* Dynamic fields */}
          <div className="space-y-1 text-sm text-gray-700">
            {Object.entries(userData).map(([key, value]) => {
              if (
                [
                  "firstName",
                  "lastName",
                  "fullName",
                  "email",
                  "role",
                  "profilePicture",
                  "isActive",
                ].includes(key)
              )
                return null;
              return (
                <p key={key}>
                  <span className="font-semibold capitalize">{key}:</span>{" "}
                  {String(value)}
                </p>
              );
            })}
          </div>
        </>
      ) : (
        <>
          {/* Editable fields */}
          <div className="space-y-3">
            <input
              type="text"
              name="firstName"
              value={editForm.firstName || ""}
              onChange={handleChange}
              placeholder="First Name"
              className="w-full border rounded-lg p-2"
            />
            <input
              type="text"
              name="lastName"
              value={editForm.lastName || ""}
              onChange={handleChange}
              placeholder="Last Name"
              className="w-full border rounded-lg p-2"
            />
            <input
              type="email"
              name="email"
              value={editForm.email || ""}
              onChange={handleChange}
              placeholder="Email"
              className="w-full border rounded-lg p-2"
            />
            <input
              type="text"
              name="role"
              value={editForm.role || ""}
              onChange={handleChange}
              placeholder="Role"
              className="w-full border rounded-lg p-2"
            />

            {/* Extra dynamic fields */}
            {Object.entries(editForm).map(([key, value]) => {
              if (
                [
                  "firstName",
                  "lastName",
                  "fullName",
                  "email",
                  "role",
                  "profilePicture",
                  "isActive",
                ].includes(key)
              )
                return null;
              return (
                <input
                  key={key}
                  type="text"
                  name={key}
                  value={value}
                  onChange={handleChange}
                  placeholder={key}
                  className="w-full border rounded-lg p-2"
                />
              );
            })}
          </div>
        </>
      )}

      {/* Active status */}
      <p
        className={`mt-4 text-center font-semibold ${
          userData.isActive ? "text-green-600" : "text-red-600"
        }`}
      >
        {userData.isActive ? "Active" : "Inactive"}
      </p>

      {/* Actions */}
      <div className="flex justify-center gap-3 mt-6 flex-wrap">
        {!isEditing ? (
          <>
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg"
            >
              Edit
            </button>
            <button
              onClick={() => setConfirmDelete(true)} // 🔹 Trigger confirmation
              className="px-4 py-2 bg-red-500 text-white rounded-lg"
            >
              Delete
            </button>
            <button
              onClick={toggleActive}
              className={`px-4 py-2 text-white rounded-lg ${
                userData.isActive ? "bg-yellow-500" : "bg-green-500"
              }`}
            >
              {userData.isActive ? "Deactivate" : "Activate"}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={saveChanges}
              className="px-4 py-2 bg-green-600 text-white rounded-lg"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 bg-gray-400 text-white rounded-lg"
            >
              Cancel
            </button>
          </>
        )}
      </div>

      {/* 🔹 Delete confirmation modal */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-80">
            <h3 className="text-lg font-bold mb-4">Confirm Deletion</h3>
            <p className="mb-6">Are you sure you want to delete this account?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 bg-gray-400 text-white rounded-lg"
              >
                Cancel
              </button>
              <button
                onClick={deleteUser}
                className="px-4 py-2 bg-red-600 text-white rounded-lg"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserInfo;
