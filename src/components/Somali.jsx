import React from "react";
import { useNavigate } from "react-router-dom";

const somaliLevels = [
  { name: "Bilow (Beginner)", route: "/admin/curriculum/somali-course/beginner" },
  { name: "Hoose (Elementary)", route: "/admin/curriculum/somali-course/elementary" },
  { name: "Dhexdhexaad (Intermediate)", route: "/admin/curriculum/somali-course/intermediate" },
  { name: "Sare (Advanced)", route: "/admin/curriculum/somali-course/advanced" },
];

function Somali() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        📘 Somali Class Overview
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {somaliLevels.map((level) => (
          <div
            key={level.name}
            className="bg-white p-6 rounded shadow cursor-pointer hover:bg-blue-50"
            onClick={() => navigate(level.route)}
          >
            <h3 className="text-xl font-semibold text-blue-700">
              {level.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Somali;
