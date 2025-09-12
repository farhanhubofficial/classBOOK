import React, { useState, useEffect } from "react";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc, collection, getDocs } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { auth, db } from "../firebase-config";
import countries from "../components/countries.json"; // ✅ add this


function Signup() {
  const [formData, setFormData] = useState({
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  category: "",
  curriculum: "",
  grade: "",
  selectedCurricula: [],
  gradesByCurriculum: {},
  gradesByCurriculumSubjects: {},
  country: "",   // ✅ new
  phone: "",     // ✅ new
});

  const [error, setError] = useState("");
  const [subjects, setSubjects] = useState({});
  const navigate = useNavigate();

  const CBCGrades = [
    "Pre-Primary 1 (PP1)",
    "Pre-Primary 2 (PP2)",
    "Grade 1",
    "Grade 2",
    "Grade 3",
    "Grade 4",
    "Grade 5",
    "Grade 6",
    "Grade 7",
    "Grade 8",
    "Grade 9",
  ];

  const IGCSEGrades = [
    "Year 1",
    "Year 2",
    "Year 3",
    "Year 4",
    "Year 5",
    "Year 6",
    "Year 7",
    "Year 8",
    "Year 9",
    "Year 10",
    "Year 11",
    "Year 12",
    "Year 13",
  ];

  const EnglishLevels = [
    "A1 (Beginner)",
    "A2 (Elementary)",
    "B1 (Intermediate)",
    "B2 (Upper Intermediate)",
    "C1 (Advanced)",
    "C2 (Proficiency)",
  ];

  const SomaliLevels = [
    "Bilow (Beginner)",
    "Hoose (Elementary)",
    "Dhexdhexaad (Intermediate)",
    "Sare (Advanced)",
  ];

  const KiswahiliLevels = [
    "Kiwango cha Msingi (Beginner)",
    "Kiwango cha Kati (Intermediate)",
    "Kiwango cha Juu (Advanced)",
  ];

  const ArabicLevels = [
    "مبتدئ (Beginner)",
    "أساسي (Elementary)",
    "متوسط (Intermediate)",
    "متقدم (Advanced)",
    "إجادة (Proficiency)",
  ];

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    setError("");
  };

  const handleCurriculumSelect = (e) => {
    const { options } = e.target;
    const selected = [];
    for (let i = 0; i < options.length; i++) {
      if (options[i].selected) selected.push(options[i].value);
    }
    setFormData({
      ...formData,
      selectedCurricula: selected,
    });
  };


  const [showCountries, setShowCountries] = useState(false);
  const handleGradeSelect = (curriculum, selectedGrades) => {
    setFormData((prev) => ({
      ...prev,
      gradesByCurriculum: {
        ...prev.gradesByCurriculum,
        [curriculum]: selectedGrades,
      },
    }));
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      return setError("Passwords do not match");
    }

    // ✅ validation: teachers must have at least one subject per grade
  if (formData.category === "teacher") {
  for (const curr of formData.selectedCurricula) {
    // ✅ Only enforce subjects for CBC and IGCSE
    if (curr === "cbc" || curr === "igcse") {
      for (const grade of formData.gradesByCurriculum[curr] || []) {
        const subjectsInGrade =
          formData.gradesByCurriculumSubjects?.[curr]?.[grade] || [];
        if (subjectsInGrade.length === 0) {
          return setError(
            `Please select at least one subject for ${grade} in ${curr.toUpperCase()}`
          );
        }
      }
    }
  }
}


    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      const user = userCredential.user;

      await updateProfile(user, {
        displayName: formData.firstName,
      });

      const userDocRef = doc(db, "users", user.uid);
      const role = formData.category;

   await setDoc(userDocRef, {
  email: formData.email,
  firstName: formData.firstName,
  lastName: formData.lastName,
  role,
  category: formData.category,
  curriculum:
    role === "teacher"
      ? formData.selectedCurricula
      : formData.curriculum || null,
  grade:
    role === "teacher"
      ? formData.gradesByCurriculum
      : formData.grade || null,
  subjects: role === "teacher" ? formData.gradesByCurriculumSubjects || {} : null,
  country: formData.country, // ✅ save country
phone:
    (countries.find((c) => c.name === formData.country)?.dial_code || "") +
    formData.phone,   // ✅ save phone
  daysPresent: 0,
  daysAbsent: 0,
  courseDuration: 0,
  dateRegistered: new Date(),
  lastLogin: new Date(),
});


      if (role === "admin") {
        navigate("/admin");
      } else if (formData.category === "learner") {
        navigate("/students/dashboard");
      } else if (formData.category === "teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/");
      }
    } catch (error) {
      setError("Signup failed: " + error.message);
    }
  };

  const getGradeOptions = (curriculum) => {
    switch (curriculum) {
      case "cbc":
        return CBCGrades;
      case "igcse":
        return IGCSEGrades;
      case "english":
        return EnglishLevels;
      case "somali":
        return SomaliLevels;
      case "kiswahili":
        return KiswahiliLevels;
      case "arabic":
        return ArabicLevels;
      default:
        return [];
    }
  };

  useEffect(() => {
    const fetchSubjects = async () => {
      let allSubjects = {};
      for (const curr of formData.selectedCurricula) {
        allSubjects[curr] = {};
        const grades = formData.gradesByCurriculum[curr] || [];

        for (const grade of grades) {
          try {
            const path = `${curr}/${grade}/subjects`;
            const snap = await getDocs(collection(db, path));
            allSubjects[curr][grade] = snap.docs.map((d) => ({
              id: d.id,
              name: d.data().name,
            }));
          } catch (err) {
            console.error("Error fetching subjects for", curr, grade, err);
            allSubjects[curr][grade] = [];
          }
        }
      }
      setSubjects(allSubjects);
    };

    if (formData.selectedCurricula.length > 0) {
      fetchSubjects();
    }
  }, [formData.selectedCurricula, formData.gradesByCurriculum]);

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold text-center mb-6">Sign Up</h2>
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}
        <form onSubmit={handleSignup} className="space-y-4">
          <input
            type="text"
            name="firstName"
            placeholder="First Name"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="text"
            name="lastName"
            placeholder="Last Name"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <input
            type="password"
            name="confirmPassword"
            placeholder="Confirm Password"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />


{/* ✅ Country with Searchable Dropdown */}
<div className="relative">
  <input
    type="text"
    placeholder="Search country..."
    value={formData.country}
    onFocus={() => setShowCountries(true)} // open on focus
    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
    required
    className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />

  {showCountries && (
    <div className="absolute z-10 w-full max-h-40 overflow-y-auto bg-white border rounded-lg shadow">
      {countries
        .filter((c) =>
          c.name.toLowerCase().includes(formData.country.toLowerCase())
        )
        .map((c) => (
          <div
            key={c.name}
            onClick={() => {
              setFormData({ ...formData, country: c.name });
              setShowCountries(false); // ✅ close after selecting
            }}
            className="px-4 py-2 cursor-pointer hover:bg-indigo-100"
          >
            {c.name}
          </div>
        ))}
    </div>
  )}
</div>

<div className="flex space-x-2">
  <input
    type="text"
    readOnly
    value={countries.find((c) => c.name === formData.country)?.dial_code || ""}
    className="w-20 px-3 py-2 border rounded-lg bg-gray-100"
  />
  <input
    type="tel"
    name="phone"
    placeholder="Phone number"
    value={formData.phone}
    onChange={handleChange}
    required
    className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
  />
</div>


          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg bg-white"
          >
            <option value="">Select Category</option>
            <option value="teacher">Teacher</option>
            <option value="learner">Learner</option>
            <option value="parent">Parent</option>
          </select>


          {formData.category === "learner" && (
            <>
              <select
                name="curriculum"
                value={formData.curriculum}
                onChange={handleChange}
                required
                className="w-full px-4 py-2 border rounded-lg bg-white"
              >
                <option value="">Select Curriculum</option>
                <option value="cbc">CBC</option>
                <option value="igcse">IGCSE</option>
                <option value="english">English Course</option>
                <option value="arabic">Arabic Course</option>
                <option value="somali">Somali Course</option>
                <option value="kiswahili">Kiswahili Course</option>
              </select>

              {formData.curriculum && (
                <select
                  name="grade"
                  value={formData.grade}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg bg-white"
                >
                  <option value="">
                    {formData.curriculum === "cbc" ||
                    formData.curriculum === "igcse"
                      ? "Select Grade"
                      : "Select Level"}
                  </option>
                  {getGradeOptions(formData.curriculum).map((grade) => (
                    <option key={grade} value={grade}>
                      {grade}
                    </option>
                  ))}
                </select>
              )}
            </>
          )}

          {formData.category === "teacher" && (
            <>
              <label className="block font-medium">
                Select Curricula (multiple)
              </label>
              <div className="space-y-2">
                {["cbc", "igcse", "english", "arabic", "somali", "kiswahili"].map(
                  (curr) => (
                    <label key={curr} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        value={curr}
                        checked={formData.selectedCurricula.includes(curr)}
                        onChange={(e) => {
                          let updated = [...formData.selectedCurricula];
                          if (e.target.checked) {
                            updated.push(curr);
                          } else {
                            updated = updated.filter((c) => c !== curr);
                          }
                          setFormData({ ...formData, selectedCurricula: updated });
                        }}
                      />
                      <span className="capitalize">{curr}</span>
                    </label>
                  )
                )}
              </div>

              {formData.selectedCurricula.map((curr) => (
                <div key={curr} className="mt-3">
                  <label className="block font-medium">
                    Choose {curr === "cbc" || curr === "igcse" ? "Grades" : "Levels"} for {curr.toUpperCase()}
                  </label>
                  <select
                    multiple
                    value={formData.gradesByCurriculum[curr] || []}
                    onChange={(e) => {
                      const { options } = e.target;
                      const selectedGrades = [];
                      for (let i = 0; i < options.length; i++) {
                        if (options[i].selected) selectedGrades.push(options[i].value);
                      }
                      handleGradeSelect(curr, selectedGrades);
                    }}
                    className="w-full px-4 py-2 border rounded-lg bg-white"
                  >
                    {getGradeOptions(curr).map((g) => (
                      <option key={g} value={g}>
                        {g}
                      </option>
                    ))}
                  </select>

                  {(curr === "cbc" || curr === "igcse") &&
                    (formData.gradesByCurriculum[curr] || []).map((grade) => (
                      <div key={grade} className="mt-2 ml-4">
                        <label className="block font-medium">
                          Select Subjects for {grade}
                        </label>
                        <div className="space-y-1">
                          {(subjects[curr]?.[grade] || []).map((subj) => (
                            <label
                              key={subj.id}
                              className="flex items-center space-x-2 text-sm"
                            >
                              <input
                                type="checkbox"
                                value={subj.id}
                                checked={
                                  (formData.gradesByCurriculumSubjects?.[curr]?.[grade] || [])
                                    .some((s) => s.id === subj.id)
                                }
                                onChange={(e) => {
                                  setFormData((prev) => {
                                    const prevSubs =
                                      prev.gradesByCurriculumSubjects?.[curr]?.[grade] || [];
                                    let updatedSubs;

                                    if (e.target.checked) {
                                      updatedSubs = [
                                        ...prevSubs,
                                        { id: subj.id, name: subj.name },
                                      ];
                                    } else {
                                      updatedSubs = prevSubs.filter(
                                        (s) => s.id !== subj.id
                                      );
                                    }

                                    return {
                                      ...prev,
                                      gradesByCurriculumSubjects: {
                                        ...prev.gradesByCurriculumSubjects,
                                        [curr]: {
                                          ...(prev.gradesByCurriculumSubjects?.[curr] || {}),
                                          [grade]: updatedSubs,
                                        },
                                      },
                                    };
                                  });
                                }}
                              />
                              <span>{subj.name}</span>
                            </label>
                          ))}
                        </div>
                      </div>
                    ))}
                </div>
              ))}
            </>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition duration-300"
          >
            Sign Up
          </button>
        </form>
      </div>
    </div>
  );
}

export default Signup;
