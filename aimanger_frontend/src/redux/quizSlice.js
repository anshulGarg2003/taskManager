import { createSlice } from "@reduxjs/toolkit";

const quizSlice = createSlice({
  name: "quiz",
  initialState: {
    availableQuizzes: [],
    currentQuiz: null,
    currentAnswers: [],
    lastResult: null,
    attempts: [],
    loading: false,
  },
  reducers: {
    setAvailableQuizzes: (state, action) => {
      state.availableQuizzes = action.payload;
    },
    setCurrentQuiz: (state, action) => {
      state.currentQuiz = action.payload;
      state.currentAnswers = action.payload
        ? new Array(action.payload.questions?.length || 0).fill(null).map(() => ({
            selectedOption: null,
          }))
        : [];
    },
    setAnswer: (state, action) => {
      const { questionIndex, selectedOption } = action.payload;
      if (state.currentAnswers[questionIndex] !== undefined) {
        state.currentAnswers[questionIndex] = { selectedOption };
      }
    },
    setLastResult: (state, action) => {
      state.lastResult = action.payload;
      state.currentQuiz = null;
    },
    setAttempts: (state, action) => {
      state.attempts = action.payload;
    },
    setLoading: (state, action) => {
      state.loading = action.payload;
    },
    clearQuiz: (state) => {
      state.currentQuiz = null;
      state.currentAnswers = [];
      state.lastResult = null;
    },
  },
});

export const {
  setAvailableQuizzes,
  setCurrentQuiz,
  setAnswer,
  setLastResult,
  setAttempts,
  setLoading,
  clearQuiz,
} = quizSlice.actions;

export default quizSlice.reducer;
