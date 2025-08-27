import React, { useState, useEffect } from "react";
import { MdClose, MdMenu } from "react-icons/md";
import { FaCamera, FaUser, FaLock, FaCog, FaDatabase, FaEye, FaEyeSlash } from "react-icons/fa";
import { getAuth, updateEmail, updatePassword, EmailAuthProvider, reauthenticateWithCredential } from "firebase/auth";
import { doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";


// Avatar fallback
const CombinedAvatar = ({ name, photoURL, size = 96 }) => {
  const [error, setError] = useState(false);
  const initials = name?.charAt(0).toUpperCase() || "?";
  return (
    <div style={{ width: size, height: size }} className="rounded-full bg-gray-200 overflow-hidden flex items-center justify-center">
      {photoURL && !error ? (
        <img src={photoURL} alt="Avatar" className="w-full h-full object-cover" onError={() => setError(true)} />
      ) : (
        <span className="text-gray-600 font-bold text-xl">{initials}</span>
      )}
    </div>
  );
};

const AccountSettingsModal = ({ onClose, userData, refreshUser }) => {
  const auth = getAuth();
  const currentUser = auth.currentUser;

  const [activeTab, setActiveTab] = useState("profile");
  const [isEditing, setIsEditing] = useState(false);
  const [photoURL, setPhotoURL] = useState(userData?.photoURL || "");
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    role: "",
    bio: ""
  });

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [sidebarVisible, setSidebarVisible] = useState(true);

  useEffect(() => {
    if (userData) {
      setFormData({
        firstName: userData.firstName || "",
        lastName: userData.lastName || "",
        email: userData.email || "",
        role: userData.role || "",
        bio: userData.bio || ""
      });
      setPhotoURL(userData.photoURL || "");
    }
  }, [userData]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      setIsEditing(false);

      const userRef = doc(db, "users", currentUser.uid);
      const updatedData = {
        ...formData,
        photoURL,
        fullName: `${formData.firstName} ${formData.lastName}`,
        updatedAt: new Date().toISOString()
      };

      await updateDoc(userRef, updatedData);

      if (formData.email !== currentUser.email) {
        await updateEmail(currentUser, formData.email);
      }

      const updatedSnap = await getDoc(userRef);
      if (updatedSnap.exists()) {
        refreshUser(updatedSnap.data());
      }

      onClose();
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error saving changes: " + error.message);
    }
  };

const handlePhotoChange = async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  try {
    const storage = getStorage();
    const storageRef = ref(storage, `user_avatars/${currentUser.uid}/${file.name}`);
    await uploadBytes(storageRef, file);
    const downloadURL = await getDownloadURL(storageRef);
    setPhotoURL(downloadURL);
  } catch (error) {
    console.error("Failed to upload image:", error);
    alert("Failed to upload image. Please try again.");
  }
};


  const handlePasswordUpdate = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) return alert("Passwords do not match.");

    try {
      const credential = EmailAuthProvider.credential(currentUser.email, currentPassword);
      await reauthenticateWithCredential(currentUser, credential);
      await updatePassword(currentUser, newPassword);
      alert("Password updated successfully.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowCurrent(false);
      setActiveTab("profile");
    } catch (err) {
      console.error("Password update error:", err);
      alert("Failed to update password: " + err.message);
    }
  };

  const renderProfileTab = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800">Profile Information</h3>
        {isEditing ? (
          <div className="space-x-2">
            <button onClick={() => setIsEditing(false)} className="px-4 py-1 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-100">Cancel</button>
            <button onClick={handleSave} className="px-4 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700">Save Changes</button>
          </div>
        ) : (
          <button onClick={() => setIsEditing(true)} className="px-4 py-1 text-sm text-white bg-green-600 rounded-md hover:bg-green-700">Edit Profile</button>
        )}
      </div>

      <div className="text-center">
        <div className="relative w-24 h-24 mx-auto">
          <CombinedAvatar name={formData.firstName} photoURL={photoURL} />
          {isEditing && (
            <label className="absolute bottom-0 right-0 bg-white p-1 rounded-full shadow cursor-pointer">
              <FaCamera className="text-gray-600 text-sm" />
              <input type="file" className="hidden" accept="image/*" onChange={handlePhotoChange} />
            </label>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">Supports JPEG, PNG, WebP, GIF (max 5MB)</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm text-gray-500">First Name</label>
          {isEditing ? (
            <input name="firstName" value={formData.firstName} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" />
          ) : (
            <p className="text-gray-800 font-medium mt-1">{formData.firstName}</p>
          )}
        </div>
        <div>
          <label className="text-sm text-gray-500">Last Name</label>
          {isEditing ? (
            <input name="lastName" value={formData.lastName} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" />
          ) : (
            <p className="text-gray-800 font-medium mt-1">{formData.lastName}</p>
          )}
        </div>
        <div className="md:col-span-2">
          <label className="text-sm text-gray-500">Email</label>
          {isEditing ? (
            <input name="email" value={formData.email} onChange={handleChange} className="w-full mt-1 px-3 py-2 border rounded-md" />
          ) : (
            <p className="text-gray-800 font-medium mt-1">{formData.email}</p>
          )}
        </div>
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <form onSubmit={handlePasswordUpdate} className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-800">Security Settings</h3>

      <div>
        <label className="block text-sm text-gray-600">Current Password</label>
        <div className="relative">
          <input type={showCurrent ? "text" : "password"} className="w-full mt-1 px-3 py-2 border rounded-md pr-10" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          <button type="button" onClick={() => setShowCurrent(!showCurrent)} className="absolute right-2 top-3 text-gray-500">
            {showCurrent ? <FaEyeSlash /> : <FaEye />}
          </button>
        </div>
      </div>

      <div>
        <label className="block text-sm text-gray-600">New Password</label>
        <input type="password" className="w-full mt-1 px-3 py-2 border rounded-md" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
      </div>

      <div>
        <label className="block text-sm text-gray-600">Confirm New Password</label>
        <input type="password" className="w-full mt-1 px-3 py-2 border rounded-md" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
      </div>

      <div className="text-right">
        <button type="submit" className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md">Update Password</button>
      </div>
    </form>
  );

  const renderContent = () => {
    switch (activeTab) {
      case "profile": return renderProfileTab();
      case "security": return renderSecurityTab();
      case "preference": return <p className="text-sm text-gray-700">Preference options here.</p>;
      case "data": return <p className="text-sm text-gray-700">Data integrity settings here.</p>;
      default: return null;
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-center items-center p-4 overflow-auto">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-xl p-6 relative animate-fade-in-up h-[90vh] flex flex-col">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 z-20">
          <MdClose className="text-2xl" />
        </button>

        <h2 className="text-2xl font-semibold text-green-600 text-center mb-1">Account Settings</h2>
        <p className="text-sm text-gray-500 text-center mb-4">Manage your profile and preferences</p>

        <div className="flex-1 flex flex-col md:flex-row overflow-hidden border border-gray-200 rounded-lg shadow-sm">
          {/* Topbar (small) / Sidebar (md+) */}
          <div className="bg-white border-b md:border-b-0 md:border-r p-2 flex md:flex-col space-x-2 md:space-x-0 md:space-y-3 overflow-x-auto md:overflow-y-auto w-full md:w-1/4">
            <button onClick={() => setActiveTab("profile")} className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 ${activeTab === "profile" ? "bg-green-100 font-semibold" : ""}`}><FaUser /> Profile</button>
            <button onClick={() => setActiveTab("security")} className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 ${activeTab === "security" ? "bg-green-100 font-semibold" : ""}`}><FaLock /> Security</button>
            <button onClick={() => setActiveTab("preference")} className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 ${activeTab === "preference" ? "bg-green-100 font-semibold" : ""}`}><FaCog /> Preferences</button>
            <button onClick={() => setActiveTab("data")} className={`flex items-center gap-2 px-3 py-2 rounded-md hover:bg-green-50 ${activeTab === "data" ? "bg-green-100 font-semibold" : ""}`}><FaDatabase /> Data Integrity</button>
          </div>

          {/* Scrollable tab content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {renderContent()}
          </div>
        </div>

        <div className="mt-4 text-right">
          <button onClick={onClose} className="inline-block px-5 py-2 rounded-lg bg-green-600 hover:bg-green-700 text-white font-medium transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsModal;
