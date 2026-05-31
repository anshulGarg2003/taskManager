import { configureStore } from "@reduxjs/toolkit";
import pasteReducer from "./pasteSlice";
import UserReducer from "./userSlice";
import errorReducer from "./error";
import quizReducer from "./quizSlice";
import analyticsReducer from "./analyticsSlice";

const USER_STORAGE_KEY = "tm_user_v1";

const loadUserState = () => {
  try {
    const raw = localStorage.getItem(USER_STORAGE_KEY);
    if (!raw) return undefined;
    const parsed = JSON.parse(raw);
    return parsed && typeof parsed === "object" ? parsed : undefined;
  } catch {
    return undefined;
  }
};

export const store = configureStore({
  reducer: {
    paste: pasteReducer,
    user: UserReducer,
    error: errorReducer,
    quiz: quizReducer,
    analytics: analyticsReducer,
  },
  preloadedState: {
    user: loadUserState(),
  },
});

store.subscribe(() => {
  try {
    const user = store.getState().user;
    localStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
  } catch {
    // Ignore persistence errors to keep app usable.
  }
});
