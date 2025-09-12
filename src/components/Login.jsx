import React, { useState, useEffect } from "react";
import { auth, db } from "../firebase-config";
import { signInWithEmailAndPassword, onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();

        // ✅ Save login time
        await updateDoc(userDocRef, {
          lastLogin: new Date(),
        });

        // Navigate based on role
        if (userData.role === "learner") {
          navigate("/students/dashboard");
        } else if (userData.role === "admin") {
          navigate("/admin/dashboard");
        } else if (userData.role === "teacher") {
          navigate("/teacher/dashboard");
        } else {
          navigate("/");
        }
      } else {
        setError("User data not found in Firestore.");
      }
    } catch (err) {
      setError("Login failed: " + err.message);
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          // Auto redirect if already logged in
          if (userData.role === "learner") {
            navigate("/students/dashboard");
          } else if (userData.role === "admin") {
            navigate("/admin");
          } else if (userData.role === "teacher") {
            navigate("/teacher/dashboard");
          } else {
            navigate("/");
          }
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return (
    <div className="relative bg-gray-100 min-h-screen flex justify-center items-center">
      {/* Shadow backdrop - covers whole page */}
      <div
        className="fixed inset-0 bg-black bg-opacity-40 z-40"
        onClick={() => navigate("/")}
      ></div>

      {/* White login box stays in its normal flow (between header & footer) */}
      <div
        className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md z-50 relative"
        onClick={(e) => e.stopPropagation()} // prevent backdrop click
      >
        <h2 className="text-2xl font-bold text-center mb-6">Login</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleLogin} className="space-y-4">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Login
          </button>
        </form>

        {/* Sign up link below login button */}
        <p className="text-center text-sm mt-4">
          Don&apos;t have an account?{" "}
          <span
            onClick={() => navigate("/signup")}
            className="text-indigo-600 cursor-pointer hover:underline"
          >
            Sign Up
          </span>
        </p>
      </div>
    </div>
  );
}

export default Login;
