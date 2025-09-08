import React, { useEffect, useState, useRef } from "react";
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
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";

function StudentAssignments() {
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [studentClassroom, setStudentClassroom] = useState(null);
  const [studentName, setStudentName] = useState("");
  const [answerForms, setAnswerForms] = useState({});
  const [submittedAssignments, setSubmittedAssignments] = useState([]);
  const [submittedAnswersDetails, setSubmittedAnswersDetails] = useState({});
  const [viewAnswerExpanded, setViewAnswerExpanded] = useState({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [modalPosition, setModalPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  const scrollRef = useRef(null);
  const modalRef = useRef(null);

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

        const assignmentsRef = collection(db, "assignments");
        const q = query(assignmentsRef, where("classroom", "==", classroomName));
        const snapshot = await getDocs(q);
        const filteredAssignments = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        filteredAssignments.sort((a, b) => new Date(b.date) - new Date(a.date));
        setAssignments(filteredAssignments);

        const answersQuery = query(
          collection(db, "assignmentAnswers"),
          where("studentName", "==", fullName),
          where("submitted", "==", true)
        );
        const answersSnapshot = await getDocs(answersQuery);

        const submittedIds = [];
        const answersDetails = {};
        answersSnapshot.docs.forEach((doc) => {
          const data = doc.data();
          submittedIds.push(data.assignmentId);
          answersDetails[data.assignmentId] = { id: doc.id, ...data };
        });

        setSubmittedAssignments(submittedIds);
        setSubmittedAnswersDetails(answersDetails);
      } catch (error) {
        console.error("Error fetching assignments:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentAndAssignments();
  }, []);

  const toggleAnswerForm = (id) => {
    setAnswerForms((prev) => ({
      ...prev,
      [id]: {
        open: !prev[id]?.open,
        text: prev[id]?.text || "",
      },
    }));
    setModalPosition({ x: window.innerWidth / 2 - 200, y: 150 }); // center modal
  };

  const toggleViewAnswer = (id) => {
    setViewAnswerExpanded((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleAnswerSubmit = async (assignment) => {
    const answerText = answerForms[assignment.id]?.text?.trim();
    if (!answerText) return alert("Answer cannot be empty.");
    if (submittedAssignments.includes(assignment.id)) {
      return alert("You have already submitted an answer for this assignment.");
    }

    const answerData = {
      answerText,
      assignmentId: assignment.id,
      classroom: assignment.classroom,
      files: [],
      questionTitle: assignment.writtenTitle || assignment.fileTitle || "Untitled",
      questionContent: assignment.content || "",
      studentName,
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

  // Dragging logic
  const handleMouseDown = (e) => {
    setIsDragging(true);
    setDragOffset({
      x: e.clientX - modalPosition.x,
      y: e.clientY - modalPosition.y,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setModalPosition({
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
    } else {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    }
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
    };
  }, [isDragging]);

  const goPrev = () => {
    setCurrentIndex((prev) => (prev === 0 ? assignments.length - 1 : prev - 1));
  };

  const goNext = () => {
    setCurrentIndex((prev) =>
      prev === assignments.length - 1 ? 0 : prev + 1
    );
  };

  if (loading) return <p>Loading assignments...</p>;
  if (!studentClassroom) return <p>No classroom assigned or user not authenticated.</p>;
  if (assignments.length === 0) return <p>No assignments available for your classroom.</p>;

  const assignment = assignments[currentIndex];

  const renderAssignmentCard = (assignment) => {
    const isSubmitted = submittedAssignments.includes(assignment.id);
    const answerState = answerForms[assignment.id] || { open: false, text: "" };
    const isViewAnswerOpen = viewAnswerExpanded[assignment.id];
    const answerData = submittedAnswersDetails[assignment.id];

    const canViewAnswer =
      isSubmitted &&
      answerData &&
      answerData.evaluationStatus !== "correct" &&
      answerData.correctAnswer?.trim().length > 0;

    return (
      <div className="border-2 border-blue-300 rounded-2xl p-6 w-full shadow-lg bg-gradient-to-br from-white to-blue-50 transition duration-300 h-[600px] flex flex-col">
        <h3 className="text-2xl font-semibold text-blue-700 mb-3 text-center">
          {assignment.writtenTitle || assignment.fileTitle || "Untitled Assignment"}
        </h3>

        <div className="flex-1 overflow-y-auto pr-2 text-gray-700">
          <p className="whitespace-pre-wrap">{assignment.content}</p>

          {assignment.files?.length > 0 && (
            <div className="mb-2">
              <strong>📂 Attached Files:</strong>
              <ul className="list-disc list-inside text-gray-600">
                {assignment.files.map((file, i) => (
                  <li key={i}>{file}</li>
                ))}
              </ul>
            </div>
          )}

          {!isSubmitted ? (
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded mt-4"
              onClick={() => toggleAnswerForm(assignment.id)}
            >
              {answerState.open ? "Cancel" : "Answer"}
            </button>
          ) : (
            <div className="flex justify-between items-center mt-4">
              <span className="text-green-600 font-semibold flex items-center gap-1">
                Submitted
                {answerData?.evaluationStatus === "correct" && (
                  <span className="text-green-700 text-xl">✅</span>
                )}
                {answerData?.evaluationStatus === "incorrect" && (
                  <span className="text-red-700 text-xl">❌</span>
                )}
              </span>
              {canViewAnswer && (
                <button
                  onClick={() => toggleViewAnswer(assignment.id)}
                  className="px-3 py-1 border rounded text-blue-600 hover:bg-blue-100"
                >
                  {isViewAnswerOpen ? "Hide Answer" : "View Answer"}
                </button>
              )}
            </div>
          )}

          {isViewAnswerOpen && canViewAnswer && (
            <div className="mt-6 bg-gray-50 border border-gray-300 rounded p-4">
              <p className="font-semibold mb-1">Your Answer:</p>
              <p className="bg-white border p-3 rounded text-gray-800 whitespace-pre-wrap">
                {answerData.answerText || "No answer text found."}
              </p>
              <p className="mt-3 font-semibold text-red-700">Evaluation: ❌ Incorrect</p>
              <div className="mt-3">
                <strong>Teacher's Correct Answer:</strong>
                <p className="bg-white border p-3 rounded mt-1 text-gray-800 whitespace-pre-wrap">
                  {answerData.correctAnswer || "No answer posted yet."}
                </p>
              </div>
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 text-right italic mt-2">
          📅 Posted on: {new Date(assignment.date).toLocaleString()}
        </p>

        {/* Answer Modal */}
      {/* Answer Modal */}
{/* Answer Modal */}
{answerState.open && !isSubmitted && (
  <div
    ref={modalRef}
    className="fixed z-50 bg-white border border-gray-300 rounded-lg shadow-xl p-6 
               w-[700px] h-[500px] max-w-full 
               sm:w-[90%] sm:h-[80%] sm:top-[10%] sm:left-[5%] 
               overflow-y-auto"
    style={{
      top: modalPosition.y,
      left: modalPosition.x,
      cursor: isDragging ? "grabbing" : "default",
      touchAction: "none",
      position: "absolute",
    }}
  >
    {/* Drag Handle */}
    <div
      className="w-full h-8 bg-gray-200 rounded-t-md cursor-move mb-3 flex justify-center items-center text-gray-600 text-sm font-medium"
      onMouseDown={handleMouseDown}
      onTouchStart={(e) => {
        setIsDragging(true);
        setDragOffset({
          x: e.touches[0].clientX - modalPosition.x,
          y: e.touches[0].clientY - modalPosition.y,
        });
      }}
      onTouchMove={(e) => {
        if (!isDragging) return;
        setModalPosition({
          x: e.touches[0].clientX - dragOffset.x,
          y: e.touches[0].clientY - dragOffset.y,
        });
      }}
      onTouchEnd={() => setIsDragging(false)}
    >
      Drag Me
    </div>

    <textarea
      className="w-full h-[300px] border border-gray-300 rounded p-3 mb-3 resize-none"
      placeholder="Write your answer here..."
      value={answerState.text}
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
  };

  return (
    <div className="p-6 max-w-4xl mx-auto relative">
      <h1 className="text-3xl font-bold mb-6 text-center text-blue-800 drop-shadow">
        Assignments for {studentClassroom}
      </h1>

      {/* Desktop/Tablet slider */}
      <div className="relative hidden md:flex items-center justify-center">
        <button
          onClick={goPrev}
          className="absolute -left-12 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-gray-100 shadow hover:bg-gray-200 transition"
        >
          <FaChevronLeft className="text-2xl text-blue-600" />
        </button>

        <div className="w-full">{renderAssignmentCard(assignment)}</div>

        <button
          onClick={goNext}
          className="absolute -right-12 top-1/2 transform -translate-y-1/2 p-4 rounded-full bg-gray-100 shadow hover:bg-gray-200 transition"
        >
          <FaChevronRight className="text-2xl text-blue-600" />
        </button>
      </div>

      {/* Mobile horizontal scroll */}
      <div
        ref={scrollRef}
        className="md:hidden flex overflow-x-auto space-x-2 snap-x snap-mandatory scrollbar-hide"
      >
        {assignments.map((a) => (
          <div key={a.id} className="flex-none w-full snap-center">
            {renderAssignmentCard(a)}
          </div>
        ))}
      </div>

      {/* Dots indicator (desktop only) */}
      <div className="hidden md:flex justify-center mt-4 space-x-2">
        {assignments.map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full ${
              i === currentIndex ? "bg-blue-600" : "bg-gray-300"
            }`}
          ></div>
        ))}
      </div>

      <style>
        {`
          .scrollbar-hide::-webkit-scrollbar { display: none; }
          .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
        `}
      </style>
    </div>
  );
}

export default StudentAssignments;
