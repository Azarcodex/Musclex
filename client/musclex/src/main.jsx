import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import {GoogleOAuthProvider} from '@react-oauth/google'
const queryClient = new QueryClient();
const google_client_id=import.meta.env.CLIENT_ID
createRoot(document.getElementById("root")).render(
  <StrictMode>
<GoogleOAuthProvider clientId="61879331973-o2f1gnvivuc2npbs7ghuo4dt2qkjlvfi.apps.googleusercontent.com">
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
          <App />
          <Toaster richColors position="top-center" />
      </BrowserRouter>
    </QueryClientProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
