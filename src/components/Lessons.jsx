import React, { useState, useEffect } from 'react';

// Simulated uploaded files from teacher
const sampleLessons = [
  {
    id: 1,
    title: 'React Basics',
    fileUrl: '/documents/react-basics.pdf',
    fileType: 'pdf',
    uploadedAt: new Date('2025-05-15T14:30:00'),
  },
  {
    id: 2,
    title: 'JavaScript Deep Dive',
    fileUrl: '/documents/js-deep-dive.pptx',
    fileType: 'pptx',
    uploadedAt: new Date('2025-05-14T09:00:00'),
  },
];

function Lessons() {
  const [lessons, setLessons] = useState([]);

  useEffect(() => {
    // Simulated API call
    setLessons(sampleLessons);
  }, []);

  const formatDate = (date) =>
    date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <h2 className="text-3xl font-bold text-gray-900 mb-6">📂 Uploaded Lessons</h2>

      <div className="space-y-6">
        {lessons.map((lesson) => (
          <div
            key={lesson.id}
            className="bg-white border border-gray-200 rounded-lg p-6 shadow hover:shadow-md transition"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-semibold text-gray-800">{lesson.title}</h3>
              <span className="text-sm text-gray-500">{formatDate(lesson.uploadedAt)}</span>
            </div>

            <div className="mt-4">
              <a
                href={lesson.fileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
              >
                View {lesson.fileType.toUpperCase()}
              </a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Lessons;
