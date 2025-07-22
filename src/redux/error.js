import { createSlice } from "@reduxjs/toolkit";

const errorSlice = createSlice({
  name: "error",
  initialState: {
    isOpen: false,
    message: "",
  },
  reducers: {
    setError: (state, action) => {
      const { isOpen, message } = action.payload;
      state.isOpen = isOpen;
      state.message = message;
    },
    setErrorStatus: (state, action) => {
      const { isOpen } = action.payload;
      state.isOpen = isOpen;
    },
  },
});

export const { setError, setErrorStatus } = errorSlice.actions;
export default errorSlice.reducer;
