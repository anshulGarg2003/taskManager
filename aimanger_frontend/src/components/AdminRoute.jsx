/* eslint-disable react/prop-types */
import { useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import ProtectedRoute from "./ProtectedRoute";

const AdminRoute = ({ children }) => {
  const userInfo = useSelector((state) => state.user); // Get user from Redux

  if (!userInfo || userInfo.id === "" || (userInfo.role !== "admin" && userInfo.role !== "teacher")) {
    return <Navigate to="/unauthorized" replace />;
  }

  return <ProtectedRoute>{children}</ProtectedRoute>;
};

export default AdminRoute;
