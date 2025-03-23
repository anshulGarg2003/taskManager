import { configureStore } from "@reduxjs/toolkit";
import pasteReducer from "./pasteSlice";
import UserReducer from "./userSlice";

export const store = configureStore({
  reducer: {
    paste: pasteReducer,
    user: UserReducer,
  },
});
