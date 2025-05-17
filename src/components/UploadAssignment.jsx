import React, { useState } from "react";

function UploadAssignment({ onClose, classroomName }) {
  const [text, setText] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = () => {
    if (!text && !file) {
      alert("Please write something or upload a file.");
      return;
    }

    // Here you can integrate Firebase file upload
    console.log("Assignment Submitted", { classroomName, text, file });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center modal-overlay z-50" onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Upload Assignment - {classroomName}</h2>
        <textarea
          className="w-full border p-2 mb-4 rounded"
          placeholder="Write your assignment..."
          rows={6}
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <input
          type="file"
          className="mb-4"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <div className="flex justify-end gap-4">
          <button className="bg-gray-600 text-white px-4 py-2 rounded" onClick={onClose}>
            Cancel
          </button>
          <button className="bg-green-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadAssignment;
