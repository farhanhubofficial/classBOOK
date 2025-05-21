import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  query,
  where,
  doc,
  getDoc,
  addDoc,
} from "firebase/firestore";
import { db } from "../firebase-config";
import { getAuth } from "firebase/auth";

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentClassroom, setStudentClassroom] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [expandedContent, setExpandedContent] = useState({});
  const [answerForms, setAnswerForms] = useState({});
  const [submittedAssignments, setSubmittedAssignments] = useState([]);

  useEffect(() => {
    const fetchStudentAndAssignments = async () => {
      try {
        const auth = getAuth();
        const currentUser = auth.currentUser;

        if (!currentUser) throw new Error("User not authenticated");

        const userDocRef = doc(db, "users", currentUser.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (!userDocSnap.exists()) throw new Error("User data not found");

        const userData = userDocSnap.data();
        const classroomName = userData.classroom;
        const fullName = `${userData.firstName} ${userData.lastName}`;
        setStudentName(fullName);
        setStudentClassroom(classroomName);

        // Fetch assignments
        const assignmentsRef = collection(db, "assignments");
        const q = query(assignmentsRef, where("classroom", "==", classroomName));
        const snapshot = await getDocs(q);
        const filteredAssignments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        filteredAssignments.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAssignments(filteredAssignments);

        // Fetch submitted answers
        const assignmentAnswersRef = collection(db, "assignmentAnswers");
        const answersQuery = query(
          assignmentAnswersRef,
          where("studentName", "==", fullName),
          where("submitted", "==", true)
        );
        const answersSnapshot = await getDocs(answersQuery);

        const submittedIds = answersSnapshot.docs.map(
          (doc) => doc.data().assignmentId
        );
        setSubmittedAssignments(submittedIds);
      } catch (error) {
        console.error("Error fetching assignments:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndAssignments();
  }, []);

  const toggleContent = (id) => {
    setExpandedContent((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAnswerForm = (id) => {
    setAnswerForms((prev) => ({
      ...prev,
      [id]: {
        open: !prev[id]?.open,
        text: prev[id]?.text || "",
      },
    }));
  };

const handleAnswerSubmit = async (assignment) => {
  const answerText = answerForms[assignment.id]?.text?.trim();
  if (!answerText) {
    alert("Answer cannot be empty.");
    return;
  }

  // Check if an answer with the same content already exists for this assignment
  const existingAnswerQuery = query(
    collection(db, "assignmentAnswers"),
    where("assignmentId", "==", assignment.id),
    where("answerText", "==", answerText),
    where("studentName", "==", studentName),
    where("classroom", "==", studentClassroom)
  );
  const existingAnswerSnapshot = await getDocs(existingAnswerQuery);

  if (!existingAnswerSnapshot.empty) {
    alert("You have already submitted this answer.");
    return;
  }

  const answerData = {
    answerText,
    assignmentId: assignment.id,
    classroom: assignment.classroom,
    files: [], // Handle file uploads if necessary
    questionTitle: assignment.writtenTitle || assignment.fileTitle || "Untitled",
    questionContent: assignment.content || "",
    studentName,
    email: currentUser.email, // Ensure currentUser is defined
    submittedAt: new Date().toISOString(),
    submitted: true,
  };

  try {
    await addDoc(collection(db, "assignmentAnswers"), answerData);
    setSubmittedAssignments((prev) => [...prev, assignment.id]);
    setAnswerForms((prev) => ({
      ...prev,
      [assignment.id]: { open: false, text: "" },
    }));
    alert("Answer submitted successfully.");
  } catch (error) {
    console.error("Error submitting answer:", error.message);
    alert("Failed to submit answer.");
  }
};


  if (loading) return <p>Loading assignments...</p>;
  if (!studentClassroom)
    return <p>No classroom assigned or user not authenticated.</p>;
  if (assignments.length === 0)
    return <p>No assignments available for your classroom.</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        Assignments for {studentClassroom}
      </h1>

    {assignments.map((assignment) => {
  const isExpanded = expandedContent[assignment.id];
  const isSubmitted = submittedAssignments.includes(assignment.id);
  const answerState = answerForms[assignment.id] || { open: false, text: "" };

  const contentToShow =
    isExpanded || assignment.content.length < 200
      ? assignment.content
      : assignment.content.substring(0, 200) + "...";

  return (
    <div key={assignment.id} className="border rounded-md p-5 mb-6 shadow-sm bg-white">
      <h3 className="text-xl font-bold text-blue-700 mb-2">
        {assignment.writtenTitle || assignment.fileTitle || "Untitled Assignment"}
      </h3>

      <p className="mb-3 text-gray-700 whitespace-pre-wrap">
        <strong>Content:</strong> {contentToShow}
        {assignment.content.length > 200 && (
          <button
            className="text-blue-500 ml-2"
            onClick={() => toggleContent(assignment.id)}
          >
            {isExpanded ? "See Less" : "See More"}
          </button>
        )}
      </p>

      {assignment.files && assignment.files.length > 0 && (
        <div className="mb-2">
          <strong>Attached Files:</strong>
          <ul className="list-disc list-inside text-gray-600">
            {assignment.files.map((fileName, idx) => (
              <li key={idx}>{fileName}</li>
            ))}
          </ul>
        </div>
      )}

      <p className="text-sm text-gray-500 mb-4">
        Posted on: {new Date(assignment.date).toLocaleString()}
      </p>

      {!isSubmitted ? (
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => toggleAnswerForm(assignment.id)}
        >
          {answerState.open ? "Cancel" : "Answer"}
        </button>
      ) : (
        <span className="text-green-600 font-semibold">Submitted</span>
      )}

      {answerState.open && !isSubmitted && (
        <div className="mt-4 border-t pt-4">
          <textarea
            className="w-full border border-gray-300 rounded p-3 mb-3 min-h-[120px]"
            placeholder="Write your answer here..."
            value={answerState.text || ""}
            onChange={(e) =>
              setAnswerForms((prev) => ({
                ...prev,
                [assignment.id]: {
                  ...prev[assignment.id],
                  text: e.target.value,
                  open: true,
                },
              }))
            }
          />
          <div className="flex gap-4 justify-end">
            <button
              className="px-4 py-2 bg-gray-400 text-white rounded"
              onClick={() =>
                setAnswerForms((prev) => ({
                  ...prev,
                  [assignment.id]: { open: false, text: "" },
                }))
              }
            >
              Cancel
            </button>
            <button
              className="px-4 py-2 bg-green-600 text-white rounded"
              onClick={() => handleAnswerSubmit(assignment)}
            >
              Submit Answer
            </button>
          </div>
        </div>
      )}
    </div>
  );
})}

    </div>
  );
}

export default StudentAssignments;
