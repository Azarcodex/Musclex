import { createSlice } from "@reduxjs/toolkit";
 const savedtoken = localStorage.getItem("vendor") || null;
const vendorSlice = createSlice({
  name: "vendor",
  initialState: {
    token:savedtoken,
    isAuthenticated: !!savedtoken,
  },
  reducers: {
    setVendorToken: (state, action) => {
      state.token = action.payload;
      state.isAuthenticated = true;
      localStorage.setItem("vendor", action.payload);
    },
    clearToken: (state) => {
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem("vendor");
    },
  },
});

export const { setVendorToken, clearToken } = vendorSlice.actions;
export default vendorSlice.reducer;
