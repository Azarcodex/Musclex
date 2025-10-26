import { Navigate } from "react-router-dom";

export function UserRoute({ children }) {
  const token = localStorage.getItem("user");
  if (!token) {
    return <Navigate to={"/user/login"} replace />;
  }
  {
    return children;
  }
}
