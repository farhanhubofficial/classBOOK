import React, { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";

function AssignmentAnswers({ onClose, classroomName }) {
  const [answers, setAnswers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState([]); // Track expanded cards

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

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center modal-overlay z-50"
      onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}
    >
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Submitted Assignment Answers for {classroomName}
        </h2>

        {loading ? (
          <p className="text-center text-gray-500">Loading assignment answers...</p>
        ) : answers.length === 0 ? (
          <p className="text-center text-gray-500">No assignment answers available.</p>
        ) : (
          <div className="space-y-8">
            {answers.map((answer) => {
              const isExpanded = expandedIds.includes(answer.id);
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
                        <p className="bg-green-50 border border-green-300 p-4 rounded-md whitespace-pre-wrap text-gray-800">
                          {answer.answerText}
                        </p>
                      </div>

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

        <div className="mt-8 flex justify-end">
          <button
            className="bg-gray-600 text-white px-6 py-3 rounded"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

export default AssignmentAnswers;
