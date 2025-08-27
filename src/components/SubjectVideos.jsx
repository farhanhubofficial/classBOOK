import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getAuth } from "firebase/auth";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebase-config";

const SubjectVideos = () => {
  const { subject } = useParams();
  const [videos, setVideos] = useState([]);
  const [grade, setGrade] = useState("");

  useEffect(() => {
    const fetchVideos = async () => {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);

        if (userSnap.exists()) {
          const userGrade = userSnap.data().grade;
          setGrade(userGrade);

          const videoSnapshot = await getDocs(
            collection(db, "cbc", userGrade, "subjects", subject, "videos")
          );

          const videoList = videoSnapshot.docs.map((doc) => doc.data());
          setVideos(videoList);
        }
      }
    };

    fetchVideos();
  }, [subject]);

  return (
    <div>
      <h2 className="text-xl font-bold mb-4">{subject.toUpperCase()} - Videos</h2>
      <div className="space-y-4">
        {videos.length === 0 ? (
          <p>No videos found for this subject.</p>
        ) : (
          videos.map((video, index) => (
            <div key={index} className="p-4 border rounded shadow">
              <h3 className="text-lg font-semibold">{video.title}</h3>
              <video className="w-full mt-2" controls src={video.videoUrl}></video>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SubjectVideos;
