// StudentSubjects.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import { db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";

const StudentSubjects = () => {
  const [subjects, setSubjects] = useState([]);
  const [grade, setGrade] = useState("");
  const [loading, setLoading] = useState(true);
  const auth = getAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userRef = doc(db, "users", user.uid);
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            const userData = userSnap.data();
            const { grade, subjects: registeredSubjects = [] } = userData;
            setGrade(grade);
            setSubjects(registeredSubjects);
          } else {
            console.error("User document not found.");
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
        } finally {
          setLoading(false);
        }
      } else {
        navigate("/login");
      }
    });

    return () => unsubscribe();
  }, [auth, navigate]);

  if (loading) {
    return <p className="text-center py-10">Loading subjects...</p>;
  }

  return (
    <div className="p-5 bg-white shadow-md rounded-md">
      <h2 className="text-2xl font-bold mb-4 text-green-600">
        Subjects for Grade {grade}
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {subjects.length > 0 ? (
          subjects.map((subject) => (
            <button
              key={subject}
              onClick={() => navigate(`/student/subjects/${subject}`)}
              className="bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded shadow"
            >
              {subject.toUpperCase()}
            </button>
          ))
        ) : (
          <p className="col-span-full text-gray-600">
            No registered subjects found for Grade {grade}.
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentSubjects;
