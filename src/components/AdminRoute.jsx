import { useDispatch, useSelector } from "react-redux";
import { Navigate } from "react-router-dom";
import { setError } from "../redux/error";

const AdminRoute = ({ children }) => {
  const userInfo = useSelector((state) => state.user); // Get user from Redux
  const dispatch = useDispatch();

  if (!userInfo || userInfo.id === "" || userInfo.role !== "admin") {
    dispatch(
      setError({
        isOpen: true,
        message: "You are not authorized to visit this section",
      })
    );
    return <Navigate to="/" replace />; // Redirect non-admins
  }

  return children;
};

export default AdminRoute;
