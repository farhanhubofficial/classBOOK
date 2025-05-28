// src/components/AuthRedirector.js
import { useEffect } from "react";
import { useNavigate, Outlet } from "react-router-dom";
import { auth, db } from "../firebase-config";
import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

function AuthRedirector() {
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userDocRef = doc(db, "users", user.uid);
        const userDoc = await getDoc(userDocRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();

          if (userData.role === "learner") {
            navigate("/students/dashboard");
          } else if (userData.role === "admin") {
            navigate("/admin/dashboard");
          } else if (userData.role === "operator") {
            navigate("/users");
          } else {
            navigate("/");
          }
        }
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  return <Outlet />;
}

export default AuthRedirector;
