import { configureStore } from "@reduxjs/toolkit";
// import productReducer from "../store/features/productSlice";
import searchReducer from "../store/features/searchSlice.js";
// import logger from "redux-logger";
import vendorSlice from "../store/features/vendorSlice.js";
import adminSlice from "../store/features/adminSlice.js";
import userSlice from "../store/features/userSlice.js";
import apiStatusReducer from "../store/features/apistatusslice.js";
export const store = configureStore({
  reducer: {
    // product: productReducer,
    search: searchReducer,
    vendorAuth: vendorSlice,
    adminAuth: adminSlice,
    userAuth: userSlice,
    apiStatus: apiStatusReducer,
  },
  // middleware: (getDefaultMiddleware) =>
  //   process.env.NODE_ENV === "development"
  //     ? [...getDefaultMiddleware(), logger]
  //     : getDefaultMiddleware(),
});
