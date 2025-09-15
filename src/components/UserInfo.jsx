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

  // 🔹 Fetch user
  useEffect(() => {
    const fetchUser = async () => {
      if (!userId) return;
      try {
        const ref = doc(db, "users", userId);
        const snapshot = await getDoc(ref);
        if (snapshot.exists()) {
          setUserData(snapshot.data());
        } else {
          console.log("No user found");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
      } finally {
        setLoading(false);
      }
    };
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

  // 🔹 Edit user
  const editUser = () => {
    navigate(`/users/${userId}/edit`);
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

      {/* Active status */}
      <p
        className={`mt-4 text-center font-semibold ${
          userData.isActive ? "text-green-600" : "text-red-600"
        }`}
      >
        {userData.isActive ? "Active" : "Inactive"}
      </p>

      {/* Actions */}
      <div className="flex justify-center gap-3 mt-6">
        <button
          onClick={editUser}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg"
        >
          Edit
        </button>
        <button
          onClick={deleteUser}
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
      </div>
    </div>
  );
}

export default UserInfo;
