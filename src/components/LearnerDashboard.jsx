import React, { useEffect, useState } from 'react';
import { db, auth } from '../firebase-config'; // Adjust path to where your firebase config is
import { doc, getDoc } from 'firebase/firestore';

function LearnerDashboard() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const formattedDate = new Date('2025-09-04').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const user = auth.currentUser;
        if (user) {
          const userRef = doc(db, 'users', user.uid); // Assumes data stored in 'users' collection by uid
          const userSnap = await getDoc(userRef);

          if (userSnap.exists()) {
            setUserData(userSnap.data());
          } else {
            console.log('No such user!');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  return (
    <div className="p-6 space-y-6 flex justify-center">
      {/* Green Card with smaller width */}
      <div className="bg-blue-700 text-white p-6 rounded-lg shadow-md max-w-sm w-full">
        {/* Date inside the card */}
        <p className="text-gray-200 text-sm">{formattedDate}</p>

        <h1 className="text-2xl font-bold mb-2">
          {loading
            ? 'Loading...'
            : `Welcome back, ${userData?.firstName || 'Student'}`}
        </h1>
        <p className="text-sm">Always stay updated in your student portal</p>
      </div>
    </div>
  );
}

export default LearnerDashboard;
