import React, { useEffect, useState } from "react";
import { collection, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "../firebase-config";
import { useParams, useNavigate } from "react-router-dom";

function ViewSubmittedAssignment() {
  const { classroomName } = useParams();
  const navigate = useNavigate();

  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState([]);
  const [evaluationStatus, setEvaluationStatus] = useState({});
  const [isCorrectAnswerModalOpen, setCorrectAnswerModalOpen] = useState(false);
  const [currentAnswerId, setCurrentAnswerId] = useState(null);
  const [correctAnswerText, setCorrectAnswerText] = useState("");

  useEffect(() => {
    const fetchAssignmentAnswers = async () => {
      try {
        const answersRef = collection(db, "assignmentAnswers");
        const querySnapshot = await getDocs(answersRef);
        const fetchedAnswers = querySnapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() }))
          .filter((answer) => answer.classroom === classroomName);

        setAnswers(fetchedAnswers);
      } catch (error) {
        console.error("Error fetching assignment answers:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignmentAnswers();
  }, [classroomName]);

  const toggleExpand = (id) => {
    setExpandedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleMarkCorrect = (id) => {
    setEvaluationStatus((prev) => ({ ...prev, [id]: "correct" }));
    updateAnswerEvaluation(id, "correct");
  };

  const handleMarkIncorrect = (id) => {
    setEvaluationStatus((prev) => ({ ...prev, [id]: "incorrect" }));
    updateAnswerEvaluation(id, "incorrect");
  };

  const updateAnswerEvaluation = async (id, status) => {
    try {
      const answerRef = doc(db, "assignmentAnswers", id);
      await updateDoc(answerRef, { evaluationStatus: status });
    } catch (error) {
      console.error("Error updating answer evaluation:", error);
    }
  };

  const handleCorrectAnswerSubmit = async (answerText) => {
    try {
      const answerRef = doc(db, "assignmentAnswers", currentAnswerId);
      await updateDoc(answerRef, { correctAnswer: answerText });
      setEvaluationStatus((prev) => ({
        ...prev,
        [currentAnswerId]: "correct",
      }));
    } catch (error) {
      console.error("Error submitting correct answer:", error);
    }
  };

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">
        Submitted Assignment Answers for {classroomName}
      </h2>

      <button
        onClick={() => navigate(-1)}
        className="mb-6 bg-gray-600 text-white px-4 py-2 rounded"
      >
        ← Back
      </button>

      {loading ? (
        <p className="text-center text-gray-500">Loading assignment answers...</p>
      ) : answers.length === 0 ? (
        <p className="text-center text-gray-500">No assignment answers available.</p>
      ) : (
        <div className="space-y-8">
          {answers.map((answer) => {
            const isExpanded = expandedIds.includes(answer.id);
            const status = evaluationStatus[answer.id] || answer.evaluationStatus;

            return (
              <div
                key={answer.id}
                className="border rounded-lg p-6 bg-gray-50 shadow-sm"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                  <div>
                    <p className="text-sm text-gray-500">Student Name</p>
                    <p className="font-medium text-gray-800">{answer.studentName}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Classroom</p>
                    <p className="font-medium text-gray-800">{answer.classroom}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Submitted At</p>
                    <p className="font-medium text-gray-800">
                      {new Date(answer.submittedAt).toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Status</p>
                    <span className="inline-block px-3 py-1 text-sm rounded-full bg-green-200 text-green-800">
                      Submitted
                    </span>
                  </div>
                </div>

                {isExpanded && (
                  <>
                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Question Title</p>
                      <h3 className="text-lg font-semibold text-gray-800 mb-2">
                        {answer.questionTitle || "Untitled"}
                      </h3>
                      <p className="text-sm text-gray-500">Question Content</p>
                      <p className="bg-white border p-4 rounded-md whitespace-pre-wrap text-gray-700">
                        {answer.questionContent}
                      </p>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm text-gray-500">Student Answer</p>
                      <div className="flex">
                        <p className="bg-green-50 border border-green-300 p-4 rounded-md whitespace-pre-wrap text-gray-800 flex-1">
                          {answer.answerText}
                        </p>
                        <div className="flex flex-col items-start space-y-2 ml-4">
                          <button
                            className={`px-2 py-1 rounded ${
                              status === "correct" ? "bg-green-500 text-white" : "bg-gray-200"
                            }`}
                            onClick={() => handleMarkCorrect(answer.id)}
                          >
                            ✅ Mark Right
                          </button>
                          <button
                            className={`px-2 py-1 rounded ${
                              status === "incorrect" ? "bg-red-500 text-white" : "bg-gray-200"
                            }`}
                            onClick={() => handleMarkIncorrect(answer.id)}
                          >
                            ❌ Mark Wrong
                          </button>
                          <button
                            className="px-2 py-1 bg-blue-500 text-white rounded"
                            onClick={() => {
                              setCurrentAnswerId(answer.id);
                              setCorrectAnswerText(answer.correctAnswer || "");
                              setCorrectAnswerModalOpen(true);
                            }}
                          >
                            ✏️ Write Correct
                          </button>
                        </div>
                      </div>
                    </div>

                    {answer.correctAnswer && (
                      <div className="mb-4">
                        <p className="text-sm text-gray-500">Correct Answer</p>
                        <p className="bg-blue-50 border border-blue-300 p-4 rounded-md whitespace-pre-wrap text-gray-800">
                          {answer.correctAnswer}
                        </p>
                      </div>
                    )}

                    {answer.files && answer.files.length > 0 && (
                      <div>
                        <p className="text-sm text-gray-500">Attached Files</p>
                        <ul className="list-disc pl-5 text-gray-700">
                          {answer.files.map((file, idx) => (
                            <li key={idx}>{file}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                <div className="mt-4 text-right">
                  <button
                    className="text-blue-600 hover:underline text-sm"
                    onClick={() => toggleExpand(answer.id)}
                  >
                    {isExpanded ? "Show Less" : "Show More"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {isCorrectAnswerModalOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center modal-overlay z-50"
          onClick={(e) =>
            e.target.classList.contains("modal-overlay") &&
            setCorrectAnswerModalOpen(false)
          }
        >
          <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
            <h3 className="text-xl font-semibold mb-4">Provide Correct Answer</h3>
            <textarea
              value={correctAnswerText}
              onChange={(e) => setCorrectAnswerText(e.target.value)}
              className="w-full p-2 border rounded-md mb-4"
              rows="4"
            />
            <div className="flex justify-end space-x-4">
              <button
                className="bg-gray-500 text-white px-4 py-2 rounded"
                onClick={() => setCorrectAnswerModalOpen(false)}
              >
                Cancel
              </button>
              <button
                className="bg-blue-600 text-white px-4 py-2 rounded"
                onClick={() => {
                  handleCorrectAnswerSubmit(correctAnswerText);
                  setCorrectAnswerModalOpen(false);
                  setCorrectAnswerText("");
                }}
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ViewSubmittedAssignment;
