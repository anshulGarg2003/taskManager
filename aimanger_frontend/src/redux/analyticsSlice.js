import { createSlice } from "@reduxjs/toolkit";

const analyticsSlice = createSlice({
  name: "analytics",
  initialState: {
    overview: null,
    weeklyData: [],
    subjectData: [],
    leaderboard: [],
    loading: false,
  },
  reducers: {
    setOverview: (state, action) => {
      state.overview = action.payload;
    },
    setWeeklyData: (state, action) => {
      state.weeklyData = action.payload;
    },
    setSubjectData: (state, action) => {
      state.subjectData = action.payload;
    },
    setLeaderboard: (state, action) => {
      state.leaderboard = action.payload;
    },
    setAnalyticsLoading: (state, action) => {
      state.loading = action.payload;
    },
  },
});

export const { setOverview, setWeeklyData, setSubjectData, setLeaderboard, setAnalyticsLoading } =
  analyticsSlice.actions;

export default analyticsSlice.reducer;
