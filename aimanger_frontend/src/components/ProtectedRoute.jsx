/* eslint-disable react/prop-types */
import { useAuth0 } from "@auth0/auth0-react";
import { Navigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, isLoading, error } = useAuth0();
  const userInfo = useSelector((state) => state.user);
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 bg-slate-50">
        <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-slate-700 shadow-sm">
          Checking secure session...
        </div>
      </div>
    );
  }

  if (error) {
    return <Navigate to="/token-expired" replace state={{ from: location.pathname }} />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/session-expired" replace state={{ from: location.pathname }} />;
  }

  if (!userInfo?.id) {
    return <Navigate to="/signup" replace state={{ from: location.pathname }} />;
  }

  return children;
};

export default ProtectedRoute;
