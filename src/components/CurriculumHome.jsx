import React from "react";
import { useParams } from "react-router-dom";
import CbcHome from "./CbcHome";
import IgcseHome from "./IgcseHome";

const CurriculumHome = () => {
  const { curriculum } = useParams();

  if (curriculum === "cbc") return <CbcHome />;
  if (curriculum === "igcse") return <IgcseHome />;

  return <div className="p-6 text-center text-red-600">⚠️ Unknown curriculum: {curriculum}</div>;
};

export default CurriculumHome;
