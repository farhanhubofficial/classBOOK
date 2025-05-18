import React, { useState } from "react";

function UploadAssignment({ onClose, classroomName }) {
  const [title, setTitle] = useState("");
  const [text, setText] = useState("");
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Please enter a title.");
      return;
    }

    if (!text && files.length === 0) {
      alert("Please write something or upload files.");
      return;
    }

    console.log("Assignment Submitted", {
      classroomName,
      title,
      text,
      files,
    });

    // Firebase logic goes here...

    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center modal-overlay z-50"
      onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}
    >
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Upload Assignment - {classroomName}
        </h2>

        {/* Title */}
        <input
          type="text"
          placeholder="Assignment Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full border border-gray-300 p-3 rounded mb-6"
        />

        {/* Flex Layout for Text and File Upload */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Textarea */}
          <textarea
            className="flex-1 border border-gray-300 p-4 rounded min-h-[200px]"
            placeholder="Write your assignment..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />

          {/* File Upload */}
          <div className="flex-1 border border-gray-300 p-4 rounded bg-gray-50">
            <label className="block text-sm font-medium mb-2">Upload Files (you can select multiple):</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="mb-4"
            />

            {files.length > 0 && (
              <ul className="text-sm text-gray-700 list-disc list-inside">
                {files.map((file, idx) => (
                  <li key={idx}>{file.name}</li>
                ))}
              </ul>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-end gap-4">
          <button
            className="bg-gray-600 text-white px-6 py-3 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="bg-green-600 text-white px-6 py-3 rounded"
            onClick={handleSubmit}
          >
            Submit Assignment
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadAssignment;
