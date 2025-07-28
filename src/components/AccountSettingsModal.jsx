// AccountSettingsModal.js
import React, { useState, useEffect } from "react";
import { MdClose } from "react-icons/md";
import { FaCamera } from "react-icons/fa";
import { getAuth, updateEmail } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";

const AccountSettingsModal = ({ onClose, userData, refreshUser }) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;
  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState(userData?.photoURL || "https://via.placeholder.com/100");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    bio: ""
  });

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        role: userData.role || "",
        bio: userData.bio || ""
      });
      setPhotoURL(userData.photoURL || "https://via.placeholder.com/100");
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const userRef = doc(db, "users", currentUser.uid);

      // Update Firestore
      await updateDoc(userRef, {
        ...formData,
        photoURL,
        fullName: `${formData.firstName} ${formData.lastName}`,
        updatedAt: new Date().toISOString()
      });

      // Update Firebase Auth email if changed
      if (formData.email !== currentUser.email) {
        await updateEmail(currentUser, formData.email);
      }

      // Refresh parent user data
      const updatedSnap = await getDoc(userRef);
      if (updatedSnap.exists()) {
        refreshUser(updatedSnap.data());
      }

      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoURL(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Profile Information</h3>
        {isEditing ? (
          <div className="space-x-2">
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Save Changes
            </button>
          </div>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="px-4 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto">
          <img
            src={photoURL}
            alt="Avatar"
            className="w-full h-full rounded-full object-cover"
          />
          {isEditing && (
            <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow cursor-pointer">
              <FaCamera className="text-gray-600 text-sm" />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </label>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Supports JPEG, PNG, WebP, GIF (max 5MB)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-500">First Name</label>
          {isEditing ? (
            <input
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          ) : (
            <p className="text-gray-800 font-medium mt-1">{formData.firstName}</p>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-500">Last Name</label>
          {isEditing ? (
            <input
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          ) : (
            <p className="text-gray-800 font-medium mt-1">{formData.lastName}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-500">Email</label>
          {isEditing ? (
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 px-3 py-2 border rounded-md"
            />
          ) : (
            <p className="text-gray-800 font-medium mt-1">{formData.email}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return renderProfileTab();
      case "security":
        return <p className="text-sm text-gray-700">Security settings will appear here.</p>;
      case "preference":
        return <p className="text-sm text-gray-700">Preference options here.</p>;
      case "data":
        return <p className="text-sm text-gray-700">Data integrity settings here.</p>;
      default:
        return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-6 relative animate-fade-in-up">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
        >
          <MdClose className="text-2xl" />
        </button>

        <h2 className="text-2xl font-semibold text-green-600 text-center mb-1">
          Account Settings
        </h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          Manage your profile and preferences
        </p>

        <div className="flex gap-6">
          <div className="w-1/4 border-r pr-4 space-y-3">
            <button onClick={() => setActiveTab("profile")} className={`block w-full text-left px-3 py-2 rounded-md hover:bg-green-50 ${activeTab === "profile" ? "bg-green-100 font-semibold" : ""}`}>Profile</button>
            <button onClick={() => setActiveTab("security")} className={`block w-full text-left px-3 py-2 rounded-md hover:bg-green-50 ${activeTab === "security" ? "bg-green-100 font-semibold" : ""}`}>Security</button>
            <button onClick={() => setActiveTab("preference")} className={`block w-full text-left px-3 py-2 rounded-md hover:bg-green-50 ${activeTab === "preference" ? "bg-green-100 font-semibold" : ""}`}>Preference</button>
            <button onClick={() => setActiveTab("data")} className={`block w-full text-left px-3 py-2 rounded-md hover:bg-green-50 ${activeTab === "data" ? "bg-green-100 font-semibold" : ""}`}>Data Integrity</button>
          </div>

          <div className="w-3/4 pl-4 border-l">
            {renderContent()}
          </div>
        </div>

        <div className="mt-6 text-right">
          <button onClick={onClose} className="inline-block px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;
