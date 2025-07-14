import React from "react";
import { useNavigate } from "react-router-dom";

const IGCSEGrades = [
  "Year 1", "Year 2", "Year 3", "Year 4", "Year 5", "Year 6",
  "Year 7", "Year 8", "Year 9", "Year 10", "Year 11", "Year 12", "Year 13"
];

const IgcseHome = () => {
  const navigate = useNavigate();

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h3 className="text-xl font-bold mb-4 text-center">Select an IGCSE Grade</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-6 gap-4">
        {IGCSEGrades.map((grade) => (
          <div
            key={grade}
            onClick={() => navigate(`/admin/curriculum/igcse/${grade}`)}
            className="bg-green-200 p-4 rounded-lg cursor-pointer text-center hover:bg-green-300"
          >
            <h3 className="font-semibold">{grade}</h3>
          </div>
        ))}
      </div>
    </div>
  );
};

export default IgcseHome;
