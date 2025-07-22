import { configureStore } from "@reduxjs/toolkit";
import pasteReducer from "./pasteSlice";
import UserReducer from "./userSlice";
import errorReducer from "./error";

export const store = configureStore({
  reducer: {
    paste: pasteReducer,
    user: UserReducer,
    error: errorReducer,
  },
});
