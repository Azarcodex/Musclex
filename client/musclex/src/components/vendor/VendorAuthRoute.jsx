import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";

export default function VendorAuthRoute({ children }) {
  const { isAuthenticated } = useSelector((state) => state.vendorAuth);
  if (isAuthenticated) {
    return <Navigate to={"/vendor/dashboard"} replace />;
  }
  return children;
}
