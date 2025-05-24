import React from "react";
import { useNavigate } from "react-router-dom";

const arabicLevels = [
  { name: "مبتدئ (Beginner)", route: "/admin/curriculum/arabic-course/beginner" },
  { name: "أساسي (Elementary)", route: "/admin/curriculum/arabic-course/elementary" },
  { name: "متوسط (Intermediate)", route: "/admin/curriculum/arabic-course/intermediate" },
  { name: "متقدم (Advanced)", route: "/admin/curriculum/arabic-course/advanced" },
  { name: "إجادة (Proficiency)", route: "/admin/curriculum/arabic-course/proficiency" },
];

function Arabic() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        📖 Arabic Class Overview
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {arabicLevels.map((level) => (
          <div
            key={level.name}
            className="bg-white p-6 rounded shadow cursor-pointer hover:bg-yellow-50"
            onClick={() => navigate(level.route)}
          >
            <h3 className="text-xl font-semibold text-yellow-700">
              {level.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Arabic;
