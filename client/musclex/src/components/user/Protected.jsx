import { Navigate } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { isAuth } = useSelector((state) => state.userAuth);

  if (!isAuth) {
    return <Navigate to="/user/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
