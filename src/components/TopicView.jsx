import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";

const TopicView = () => {
  const { grade, subject, topicId } = useParams();
  const [topic, setTopic] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTopic = async () => {
      const topicRef = doc(db, "cbc", grade, "subjects", subject, "topics", topicId);
      const topicSnap = await getDoc(topicRef);
      if (topicSnap.exists()) {
        setTopic(topicSnap.data());
      }
    };

    fetchTopic();
  }, [grade, subject, topicId]);

  if (!topic) return <p className="text-center mt-10">Loading topic...</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* ✅ Go Back Button */}
      <div className="mb-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1 text-sm text-gray-600 hover:text-blue-600"
        >
          ← Go Back
        </button>
      </div>

      <h3 className="text-xl font-semibold mb-4">Now Watching: {topic.title}</h3>

      <video
        controls
        controlsList="nodownload"
        onContextMenu={(e) => e.preventDefault()}
        className="w-full h-64 sm:h-96 rounded-lg"
      >
        <source src={topic.videoUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default TopicView;
