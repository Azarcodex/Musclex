import { createSlice } from "@reduxjs/toolkit";

const savedtoken = localStorage.getItem("admin") || null;
const adminSlice = createSlice({
  name: "admin",
  initialState: {
    token: savedtoken,
    isAuth: !!savedtoken,
  },
  reducers: {
    setAdminToken: (state, action) => {
      state.token = action.payload;
      state.isAuth = true;
      localStorage.setItem("admin", action.payload);
    },
    clearAdminToken: (state) => {
      state.token = null;
      state.isAuth = false;
      localStorage.removeItem("admin");
    },
  },
});

export const { setAdminToken, clearAdminToken } = adminSlice.actions;
export default adminSlice.reducer;
