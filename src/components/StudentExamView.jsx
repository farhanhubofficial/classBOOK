import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { db } from "../firebase-config";
import { collection, getDocs } from "firebase/firestore";

const StudentExamView = () => {
  const { curriculum, grade, subject } = useParams();
  const [exams, setExams] = useState([]);

  useEffect(() => {
    const fetchExams = async () => {
      try {
        const examsRef = collection(
          db,
          curriculum,
          grade,
          "subjects",
          subject,
          "exams"
        );
        const snapshot = await getDocs(examsRef);
        const examList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setExams(examList);
      } catch (err) {
        console.error("Error fetching exams:", err);
      }
    };

    fetchExams();
  }, [curriculum, grade, subject]);

  return (
    <div className="space-y-4">
      {exams.length === 0 ? (
        <p className="text-gray-500 text-center">No exams found.</p>
      ) : (
        exams.map((exam) => (
          <div
            key={exam.id}
            className="border p-4 rounded bg-gray-50 shadow-sm"
          >
            <div dangerouslySetInnerHTML={{ __html: exam.content }} />
            <p className="text-xs text-gray-400 mt-2">
              Created: {exam.createdAt?.toDate?.().toLocaleString()}
            </p>
          </div>
        ))
      )}
    </div>
  );
};

export default StudentExamView;
