import React from "react";
import { useNavigate } from "react-router-dom";

const kiswahiliLevels = [
  { name: "Kiwango cha Msingi (Beginner)", route: "/admin/curriculum/kiswahili-course/beginner" },
  { name: "Kiwango cha Kati (Intermediate)", route: "/admin/curriculum/kiswahili-course/intermediate" },
  { name: "Kiwango cha Juu (Advanced)", route: "/admin/curriculum/kiswahili-course/advanced" },
];

function Kiswahili() {
  const navigate = useNavigate();

  return (
    <div className="max-w-5xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-6">
        📗 Kiswahili Class Overview
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {kiswahiliLevels.map((level) => (
          <div
            key={level.name}
            className="bg-white p-6 rounded shadow cursor-pointer hover:bg-green-50"
            onClick={() => navigate(level.route)}
          >
            <h3 className="text-xl font-semibold text-green-700">
              {level.name}
            </h3>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Kiswahili;
