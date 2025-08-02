import React, { useState } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";

function Signup() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    category: "",
    curriculum: "",
    grade: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const CBCGrades = [
    "Pre-Primary 1 (PP1)", "Pre-Primary 2 (PP2)", "Grade 1", "Grade 2", "Grade 3",
    "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9"
  ];

  const IGCSEGrades = [
    "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6", "Year 7",
    "Year 8", "Year 9", "Year 10", "Year 11", "Year 12", "Year 13"
  ];

  const EnglishLevels = [
    "A1 (Beginner)",
    "A2 (Elementary)",
    "B1 (Intermediate)",
    "B2 (Upper Intermediate)",
    "C1 (Advanced)",
    "C2 (Proficiency)"
  ];

  const SomaliLevels = [
    "Bilow (Beginner)",
    "Hoose (Elementary)",
    "Dhexdhexaad (Intermediate)",
    "Sare (Advanced)"
  ];

  const KiswahiliLevels = [
    "Kiwango cha Msingi (Beginner)",
    "Kiwango cha Kati (Intermediate)",
    "Kiwango cha Juu (Advanced)"
  ];

  const ArabicLevels = [
    "مبتدئ (Beginner)",
    "أساسي (Elementary)",
    "متوسط (Intermediate)",
    "متقدم (Advanced)",
    "إجادة (Proficiency)"
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: formData.firstName,
      });

      const userDocRef = doc(db, "users", user.uid);
      const role = formData.category;
await setDoc(userDocRef, {
  email: formData.email,
  firstName: formData.firstName,
  lastName: formData.lastName,
  role,
  category: formData.category,
  curriculum:
    formData.curriculum === "english"
      ? "English Course"
      : formData.curriculum === "somali"
      ? "Somali Course"
      : formData.curriculum === "arabic"
      ? "Arabic Course"
      : formData.curriculum === "kiswahili"
      ? "Kiswahili Course"
      : formData.curriculum || null,
  grade: formData.grade || null,
  daysPresent: 0,
  daysAbsent: 0,
  courseDuration: 0,
  dateRegistered: new Date(), // ✅ alternate working timestamp
});



      if (role === "admin") {
        navigate("/admin");
      } else if (formData.category === "learner") {
        navigate("/students/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError("Signup failed: " + error.message);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg bg-white"
          >
            <option value="">Select Category</option>
            <option value="teacher">Teacher</option>
            <option value="learner">Learner</option>
            <option value="parent">Parent</option>
          </select>

          {formData.category === "learner" && (
            <>
              <select
                name="curriculum"
                value={formData.curriculum}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg bg-white"
              >
                <option value="">Select Curriculum</option>
                <option value="cbc">CBC</option>
                <option value="igcse">IGCSE</option>
                <option value="english">English Course</option>
                <option value="arabic">Arabic Course</option>
                <option value="somali">Somali Course</option>
                <option value="kiswahili">Kiswahili Course</option>
              </select>

              {formData.curriculum && (
                <>
                  {formData.curriculum === "cbc" || formData.curriculum === "igcse" ? (
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg bg-white"
                    >
                      <option value="">Select Grade</option>
                      {(formData.curriculum === "cbc" ? CBCGrades : IGCSEGrades).map((grade) => (
                        <option key={grade} value={grade}>
                          {grade}
                        </option>
                      ))}
                    </select>
                  ) : formData.curriculum === "english" ? (
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg bg-white"
                    >
                      <option value="">Select Level</option>
                      {EnglishLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  ) : formData.curriculum === "somali" ? (
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg bg-white"
                    >
                      <option value="">Select Level</option>
                      {SomaliLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  ) : formData.curriculum === "kiswahili" ? (
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg bg-white"
                    >
                      <option value="">Select Level</option>
                      {KiswahiliLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  ) : formData.curriculum === "arabic" ? (
                    <select
                      name="grade"
                      value={formData.grade}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg bg-white"
                    >
                      <option value="">Select Level</option>
                      {ArabicLevels.map((level) => (
                        <option key={level} value={level}>
                          {level}
                        </option>
                      ))}
                    </select>
                  ) : null}
                </>
              )}
            </>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
