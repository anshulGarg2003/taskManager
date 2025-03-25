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
  },
  reducers: {
    setUserInfo: (state, action) => {
      const { auth0Id, _id, email, isPaid, name, picture, school, grade } =
        action.payload;
      state.auth0Id = auth0Id;
      state.id = _id;
      state.isPaid = isPaid;
      state.email = email;
      state.name = name;
      state.picture = picture;
      state.school = school;
      state.grade = grade;
    },
    setUserEduInfo: (state, action) => {
      const { school, grade } = action.payload;
      state.school = school;
      state.grade = grade;
    },
  },
});

export const { setUserInfo, setUserEduInfo } = userSlice.actions;
export default userSlice.reducer;
