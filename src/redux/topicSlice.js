import { createSlice } from "@reduxjs/toolkit";

const topicsSlice = createSlice({
  name: "topic",
  initialState: {
    subject: "",
    chapter: "",
    subtopic: "",
    duration: 0,
    difficulty: "",
  },
  reducers: {
    setSelectedTopic: (state, action) => {
      const { subject, chapter, subtopic, duration, difficulty } =
        action.payload;
      state.subject = subject;
      state.chapter = chapter;
      state.subtopic = subtopic;
      state.duration = duration;
      state.difficulty = difficulty;
    },
  },
});

export const { setSelectedTopic } = topicsSlice.actions;
export default topicsSlice.reducer;
