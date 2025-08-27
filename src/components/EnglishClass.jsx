import React from "react";
import { useNavigate } from "react-router-dom";

const englishLevels = [
  { name: "A1 (Beginner)", route: "/admin/curriculum/english-course/beginner" },
  { name: "A2 (Elementary)", route:"/admin/curriculum/english-course/elementary" },
  { name: "B1 (Intermediate)", route: "/admin/curriculum/english-course/intermediate" },
  { name: "B2 (Upper Intermediate)", route: "/admin/curriculum/english-course/upper-intermediate" },
  { name: "C1 (Advanced)", route: "/admin/curriculum/english-course/advanced" },
  { name: "C2 (Proficiency)", route: "/admin/curriculum/english-course/proficiency" },
];

function EnglishClass() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        📚 English Class Overview
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {englishLevels.map((level) => (
          <div
            key={level.name}
            className="bg-white p-6 rounded shadow cursor-pointer hover:bg-indigo-50"
            onClick={() => navigate(level.route)}
          >
            <h3 className="text-xl font-semibold text-indigo-700">
              {level.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EnglishClass;
