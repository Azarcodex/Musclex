import { Navigate } from "react-router-dom";
import { usevendorAuthStore } from "../../hooks/users/zustand/useAuth";

export default function VendorRoute({ children }) {
  const token = usevendorAuthStore((state) => state.token);
  if (!token) {
    return <Navigate to={"/vendor/login"} replace />;
  }
  return children;
}

export function VendorProtection({ children }) {
  const token = usevendorAuthStore((state) => state.token);
  if (token) {
    return <Navigate to={"/vendor/dashboard"} replace />;
  }
  return children;
}
