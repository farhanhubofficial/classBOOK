import React, { useState } from "react";

function UploadLesson({ onClose, classroomName }) {
  const [description, setDescription] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = () => {
    if (!description && !file) {
      alert("Please write a description or upload a file.");
      return;
    }

    // Handle file + description logic here
    console.log("Lesson Uploaded", { classroomName, description, file });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center modal-overlay z-50" onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}>
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-lg">
        <h2 className="text-xl font-bold mb-4">Upload Lesson - {classroomName}</h2>
        <textarea
          className="w-full border p-2 mb-4 rounded"
          placeholder="Lesson description..."
          rows={6}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
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
          <button className="bg-blue-600 text-white px-4 py-2 rounded" onClick={handleSubmit}>
            Submit
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadLesson;
