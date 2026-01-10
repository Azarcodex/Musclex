import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { Provider } from "react-redux";
import { store } from "./store/store.js";
import ScrollToTop from "./components/utils/ScrolltoTop.jsx";
// import Modal from "react-modal";
// Modal.setAppElement("#root");
const queryClient = new QueryClient();
const google_client_id = import.meta.env.VITE_CLIENT_ID;
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <GoogleOAuthProvider clientId={google_client_id}>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>
            <ScrollToTop />
            <App />
            <Toaster richColors position="top-center" />
          </BrowserRouter>
        </QueryClientProvider>
      </GoogleOAuthProvider>
    </Provider>
  </StrictMode>
);
