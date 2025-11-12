import { configureStore } from "@reduxjs/toolkit";
import productReducer from "../store/features/productSlice";
import logger from "redux-logger";
export const store = configureStore({
  reducer: {
    product: productReducer,
  },
  middleware: (getDefaultMiddleware) =>
    process.env.NODE_ENV === "development"
      ? [...getDefaultMiddleware(), logger]
      : getDefaultMiddleware(),
});
