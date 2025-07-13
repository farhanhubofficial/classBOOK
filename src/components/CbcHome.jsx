import React from "react";
import { useNavigate } from "react-router-dom";

const grades = ["pp1", "pp2", ...Array.from({ length: 12 }, (_, i) => `grade_${i + 1}`)];

const CbcHome = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center">Select a Grade</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {grades.map((grade) => (
          <div
            key={grade}
            onClick={() => navigate(`/admin/curriculum/cbc/${grade}`)}
            className="bg-blue-200 p-4 rounded-lg cursor-pointer text-center hover:bg-blue-300"
          >
            <h3 className="font-semibold">{grade.replace("_", " ").toUpperCase()}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CbcHome;
