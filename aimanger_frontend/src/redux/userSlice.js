import { createSlice } from "@reduxjs/toolkit";

const userSlice = createSlice({
  name: "user",
  initialState: {
    auth0Id: "",
    id: "",
    email: "",
    isPaid: false,
    name: "",
    picture: "",
    school: "",
    grade: "",
    phone: "",
    bio: "",
    subjects: [],
    department: "",
    qualification: "",
    yearsExperience: 0,
    teacherCode: "",
    role: "",
  },
  reducers: {
    setUserInfo: (state, action) => {
      const {
        auth0Id,
        _id,
        email,
        isPaid,
        name,
        picture,
        school,
        grade,
        role,
        phone,
        bio,
        subjects,
        department,
        qualification,
        yearsExperience,
        teacherCode,
      } = action.payload;
      state.auth0Id = auth0Id;
      state.id = _id;
      state.isPaid = isPaid;
      state.email = email;
      state.name = name;
      state.picture = picture;
      state.school = school;
      state.grade = grade;
      state.role = role;
      state.phone = phone || "";
      state.bio = bio || "";
      state.subjects = Array.isArray(subjects) ? subjects : [];
      state.department = department || "";
      state.qualification = qualification || "";
      state.yearsExperience = Number(yearsExperience) || 0;
      state.teacherCode = teacherCode || "";
    },
    setUserEduInfo: (state, action) => {
      const { school, grade } = action.payload;
      state.school = school;
      state.grade = grade;
    },
    clearUserInfo: (state) => {
      state.auth0Id = "";
      state.id = "";
      state.email = "";
      state.isPaid = false;
      state.name = "";
      state.picture = "";
      state.school = "";
      state.grade = "";
      state.phone = "";
      state.bio = "";
      state.subjects = [];
      state.department = "";
      state.qualification = "";
      state.yearsExperience = 0;
      state.teacherCode = "";
      state.role = "";
    },
  },
});

export const { setUserInfo, setUserEduInfo, clearUserInfo } = userSlice.actions;
export default userSlice.reducer;
