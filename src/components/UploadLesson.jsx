import React, { useState } from "react";

function UploadLesson({ onClose, classroomName }) {
  const [title, setTitle] = useState("");
  const [lessonContent, setLessonContent] = useState("");
  const [files, setFiles] = useState([]);

  const handleFileChange = (e) => {
    setFiles(Array.from(e.target.files));
  };

  const handleSubmit = () => {
    if (!title.trim()) {
      alert("Please enter a lesson title.");
      return;
    }

    if (!lessonContent && files.length === 0) {
      alert("Please provide lesson content or upload files.");
      return;
    }

    console.log("Lesson Submitted", {
      classroomName,
      title,
      lessonContent,
      files,
    });

    // Firebase logic here

    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center modal-overlay z-50"
      onClick={(e) => e.target.classList.contains("modal-overlay") && onClose()}
    >
      <div className="bg-white p-8 rounded-lg shadow-2xl w-full max-w-6xl h-[80vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-6 text-center">
          Upload Lesson - {classroomName}
        </h2>

        {/* Title for Lesson Title */}
        

        {/* Flex Layout for Content and File Upload */}
        <div className="flex flex-col md:flex-row gap-6">
          {/* Section for Lesson Content */}
          <div className="flex-1">
            <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Lesson Title</h3>
          <input
            type="text"
            placeholder="Enter Lesson Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded"
          />
        </div>
            <h3 className="text-xl font-semibold mb-2">Lesson Content</h3>
            <textarea
              className="w-full border border-gray-300 p-4 rounded min-h-[200px]"
              placeholder="Write lesson content or summary..."
              value={lessonContent}
              onChange={(e) => setLessonContent(e.target.value)}
            />
          </div>

          {/* Section for File Upload */}
          <div className="flex-1">
            <div className="mb-6">
          <h3 className="text-xl font-semibold mb-2">Lesson Title</h3>
          <input
            type="text"
            placeholder="Enter Lesson Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded"
          />
        </div>
            <h3 className="text-xl font-semibold mb-2">Upload Lesson Files (optional)</h3>
            <div className="border border-gray-300 p-4 rounded bg-gray-50">
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
            className="bg-blue-600 text-white px-6 py-3 rounded"
            onClick={handleSubmit}
          >
            Submit Lesson
          </button>
        </div>
      </div>
    </div>
  );
}

export default UploadLesson;
