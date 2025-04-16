import React, { useEffect, useState } from "react";
import { auth, db } from "../firebase-config";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";

const StudentSubjects = () => {
  const [gradePath, setGradePath] = useState(""); // grade_5, grade_6 etc
  const [displayGrade, setDisplayGrade] = useState(""); // Grade 5, Grade 6
  const [subjects, setSubjects] = useState([]);

  // Fetch user data when logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userDoc = await getDoc(doc(db, "users", user.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            const userGrade = userData.grade; // e.g., "Grade 5"

            // Convert "Grade 5" → "grade_5"
            const parts = userGrade.split(" ");
            if (parts.length === 2) {
              const formattedGrade = `grade_${parts[1]}`;
              setGradePath(formattedGrade); // used for Firestore path
              setDisplayGrade(userGrade);   // shown in UI
            }
          }
        } catch (err) {
          console.error("Error fetching user data:", err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch subjects for the current user's grade
  useEffect(() => {
    const fetchSubjects = async () => {
      if (!gradePath) return;

      try {
        const subjectsRef = collection(db, "cbc", gradePath, "subjects");
        const snapshot = await getDocs(subjectsRef);

        if (!snapshot.empty) {
          const subjectList = snapshot.docs.map((doc) => doc.data().name);
          setSubjects(subjectList);
        } else {
          setSubjects([]);
        }
      } catch (err) {
        console.error("Error fetching subjects:", err);
      }
    };

    fetchSubjects();
  }, [gradePath]);
  console.log(gradePath)

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Subjects for {displayGrade || "your grade"}
      </h2>

      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
        {subjects.length > 0 ? (
          subjects.map((name, index) => (
            <div
              key={index}
              className="bg-blue-100 p-4 rounded text-center font-semibold text-lg"
            >
              {name.toUpperCase()}
            </div>
          ))
        ) : (
          <p className="text-center text-gray-500 col-span-full">
            No subjects available.
          </p>
        )}
      </div>
    </div>
  );
};

export default StudentSubjects;
