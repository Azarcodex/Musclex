import { createSlice } from "@reduxjs/toolkit";
const savedToken = localStorage.getItem("user") || null;

const userSlice = createSlice({
  name: "user",
  initialState: {
    token: savedToken,
    isAuth: !!savedToken,
  },
  reducers: {
    setUserAuthToken: (state, action) => {
      state.token = action.payload;
      state.isAuth = true;
      localStorage.setItem("user", action.payload);
    },
    clearUserToken: (state) => {
      state.token = null;
      state.isAuth = false;
      localStorage.removeItem("user");
    },
  },
});
export const { setUserAuthToken, clearUserToken } = userSlice.actions;
export default userSlice.reducer;
