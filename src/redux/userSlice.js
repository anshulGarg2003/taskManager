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
  },
  reducers: {
    setUserInfo: (state, action) => {
      const { auth0Id, _id, email, isPaid, name, picture } = action.payload;
      state.auth0Id = auth0Id;
      state.id = _id;
      state.isPaid = isPaid;
      state.email = email;
      state.name = name;
      state.picture = picture;
    },
  },
});

export const { setUserInfo } = userSlice.actions;
export default userSlice.reducer;
