// SettingsPanel.js
import React, { useState } from "react";
import {
  FaUser,
  FaLock,
  FaMoon,
  FaBell,
  FaLanguage,
  FaUniversalAccess,
  FaTrash,
  FaDownload,
  FaGithub,
  FaGoogle,
  FaCheckCircle
} from "react-icons/fa";

const SettingsPanel = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState("profile");
  const [darkMode, setDarkMode] = useState(false);
  const [notifications, setNotifications] = useState({ email: true, push: false });
  const [language, setLanguage] = useState("en");
  const [fontSize, setFontSize] = useState("medium");
  const [connected, setConnected] = useState({ google: false, github: false });

  const renderTab = () => {
    switch (activeTab) {
      case "profile":
        return (
          <section>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Profile Info</h3>
            <p className="text-gray-600">Edit your personal information here.</p>
          </section>
        );

      case "security":
        return (
          <section>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Security Settings</h3>
            <p className="text-gray-600">Change your password and manage security options.</p>
          </section>
        );

      case "theme":
        return (
          <section>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Theme</h3>
            <div className="flex items-center gap-4">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="accent-green-600"
                  checked={darkMode}
                  onChange={() => setDarkMode(!darkMode)}
                />
                <span className="text-gray-700">Enable Dark Mode</span>
              </label>
            </div>
          </section>
        );

      case "notifications":
        return (
          <section>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Notifications</h3>
            <div className="space-y-2">
              {Object.entries(notifications).map(([key, value]) => (
                <label key={key} className="block text-gray-700">
                  <input
                    type="checkbox"
                    checked={value}
                    onChange={() => setNotifications({ ...notifications, [key]: !value })}
                    className="mr-2 accent-green-600"
                  />
                  {key === "email" ? "Email Notifications" : "Push Notifications"}
                </label>
              ))}
            </div>
          </section>
        );

      case "language":
        return (
          <section>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Language</h3>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="en">English</option>
              <option value="ar">Arabic</option>
              <option value="sw">Swahili</option>
              <option value="so">Somali</option>
            </select>
          </section>
        );

      case "accessibility":
        return (
          <section>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Accessibility</h3>
            <select
              value={fontSize}
              onChange={(e) => setFontSize(e.target.value)}
              className="border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              <option value="small">Small Font</option>
              <option value="medium">Medium Font</option>
              <option value="large">Large Font</option>
            </select>
          </section>
        );

      case "connections":
        return (
          <section>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Connected Accounts</h3>
            <div className="space-y-3">
              <button
                onClick={() => setConnected({ ...connected, google: !connected.google })}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-md transition ${connected.google ? "bg-green-100 text-green-700" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                <FaGoogle />
                {connected.google ? "Connected to Google" : "Connect Google"}
                {connected.google && <FaCheckCircle className="text-green-500" />}
              </button>
              <button
                onClick={() => setConnected({ ...connected, github: !connected.github })}
                className={`flex items-center gap-2 text-sm px-4 py-2 rounded-md transition ${connected.github ? "bg-green-100 text-green-700" : "bg-gray-100 hover:bg-gray-200"}`}
              >
                <FaGithub />
                {connected.github ? "Connected to GitHub" : "Connect GitHub"}
                {connected.github && <FaCheckCircle className="text-green-500" />}
              </button>
            </div>
          </section>
        );

      case "data":
        return (
          <section>
            <h3 className="text-2xl font-semibold text-gray-800 mb-3">Data Management</h3>
            <div className="space-y-3">
              <button className="flex items-center gap-2 text-green-600 font-medium hover:underline">
                <FaDownload /> Download My Data
              </button>
              <button className="flex items-center gap-2 text-red-600 font-medium hover:underline">
                <FaTrash /> Delete My Account
              </button>
            </div>
          </section>
        );

      default:
        return null;
    }
  };

  const tabs = [
    { id: "profile", label: "Profile", icon: <FaUser /> },
    { id: "security", label: "Security", icon: <FaLock /> },
    { id: "theme", label: "Theme", icon: <FaMoon /> },
    { id: "notifications", label: "Notifications", icon: <FaBell /> },
    { id: "language", label: "Language", icon: <FaLanguage /> },
    { id: "accessibility", label: "Accessibility", icon: <FaUniversalAccess /> },
    { id: "connections", label: "Connections", icon: <FaUser /> },
    { id: "data", label: "Data", icon: <FaDownload /> }
  ];

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex justify-center items-center p-6">
      <div className="bg-white w-full max-w-5xl h-[85vh] p-6 rounded-lg shadow-2xl flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-1/4 pr-6 border-r space-y-3 overflow-y-auto">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-3 w-full text-left px-4 py-2 rounded-md text-gray-700 hover:bg-green-100 transition ${activeTab === tab.id ? "bg-green-200 font-semibold" : ""}`}
            >
              {tab.icon} {tab.label}
            </button>
          ))}
        </aside>

        {/* Main Content */}
        <main className="w-3/4 pl-6 overflow-y-auto">
          {renderTab()}
          <div className="mt-8 text-right">
            <button onClick={onClose} className="px-5 py-2 rounded-md bg-green-600 hover:bg-green-700 text-white font-medium">
              Close
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

export default SettingsPanel;
