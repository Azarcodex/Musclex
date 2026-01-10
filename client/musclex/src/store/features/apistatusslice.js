import { createSlice } from "@reduxjs/toolkit";

const apiStatusSlice = createSlice({
  name: "apiStatus",
  initialState: {
    serverDown: false,
  },
  reducers: {
    setServerDown: (state) => {
      state.serverDown = true;
    },
    clearServerDown: (state) => {
      state.serverDown = false;
    },
  },
});

export const { setServerDown, clearServerDown } = apiStatusSlice.actions;
export default apiStatusSlice.reducer;
