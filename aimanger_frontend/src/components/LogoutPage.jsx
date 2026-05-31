import { useAuth0 } from "@auth0/auth0-react";
import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { clearUserInfo } from "../redux/userSlice";

const LogoutPage = () => {
  const { logout } = useAuth0();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(clearUserInfo());
    logout({
      logoutParams: {
        returnTo: `${window.location.origin}/logged-out`,
      },
    });
  }, [dispatch, logout]);

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 bg-slate-50">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-slate-700 shadow-sm">
        Logging out securely...
      </div>
    </div>
  );
};

export default LogoutPage;
