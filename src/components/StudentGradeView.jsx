import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import { collection, getDocs, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const StudentGradeView = () => {
  const { curriculum } = useParams();
  const [subjects, setSubjects] = useState([]);
  const [userGrade, setUserGrade] = useState(null);
  const [userCurriculum, setUserCurriculum] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserGradeAndSubjects = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) {
          console.error("User not logged in");
          return;
        }

        // Get the user's document
        const userDocRef = doc(db, "users", currentUser.uid);
        const userSnapshot = await getDoc(userDocRef);

        if (!userSnapshot.exists()) {
          console.error("User data not found in Firestore.");
          return;
        }

        const userData = userSnapshot.data();
        const grade = userData.grade;
        const userCurr = userData.curriculum;

        setUserGrade(grade);
        setUserCurriculum(userCurr);

        if (!userCurr || !grade) return;

        // Fetch subjects under the user's curriculum and grade
        const subjectsRef = collection(db, userCurr, grade, "subjects");
        const snapshot = await getDocs(subjectsRef);
        const subjectList = snapshot.docs
          .map((doc) => ({
            id: doc.id,
            name: doc.data().name,
          }))
          .filter((subject) => !!subject.name);

        setSubjects(subjectList);
      } catch (error) {
        console.error("Error fetching user grade or subjects:", error);
      }
    };

    fetchUserGradeAndSubjects();
  }, []);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
        >
          ← Go Back
        </button>
      </div>

      <h3 className="text-xl font-bold mb-4 text-center">
        {userGrade ? `${userGrade} Subjects` : "Subjects"}
      </h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 justify-items-center">
       {subjects.map((subject) => (
  <button
    key={subject.id}
    onClick={() =>
      navigate(`/students/curriculum/${userCurriculum}/${userGrade}/${subject.name}`)
    }
    className="bg-green-100 hover:bg-green-200 w-full max-w-xs p-4 rounded shadow text-center font-semibold text-green-700"
  >
    {subject.name.toUpperCase()}
  </button>
))}

      </div>
    </div>
  );
};

export default StudentGradeView;
