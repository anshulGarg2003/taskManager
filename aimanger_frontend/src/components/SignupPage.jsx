import { useAuth0 } from "@auth0/auth0-react";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { BASIC_URL } from "../utlis/API_calls";
import { setUserInfo } from "../redux/userSlice";
import { Sparkles, ShieldCheck, ArrowRight } from "lucide-react";

const SignupPage = () => {
  const { user, loginWithRedirect, isLoading } = useAuth0();
  const userInfo = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isSaving, setIsSaving] = useState(false);

  const redirectTarget = location.state?.from || "/dashboard";

  useEffect(() => {
    if (!user) return;

    setIsSaving(true);
    fetch(`${BASIC_URL}/api/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        auth0Id: user.sub,
        name: user.name,
        email: user.email,
        picture: user.picture,
        isPaid: false,
        role: "student",
      }),
    })
      .then((res) => {
        if (!res.ok) {
          throw new Error("Failed to initialize account");
        }
        return res.json();
      })
      .then((data) => {
        dispatch(setUserInfo(data));
        navigate(redirectTarget, { replace: true });
      })
      .catch(() => {
        navigate("/server-unavailable", { replace: true });
      })
      .finally(() => setIsSaving(false));
  }, [user, dispatch, navigate, redirectTarget]);

  useEffect(() => {
    if (userInfo?.id) {
      navigate(redirectTarget, { replace: true });
    }
  }, [userInfo?.id, navigate, redirectTarget]);

  return (
    <div className="min-h-[calc(100vh-72px)] bg-[radial-gradient(circle_at_12%_22%,rgba(14,165,233,0.20),transparent_28%),radial-gradient(circle_at_88%_18%,rgba(245,158,11,0.18),transparent_30%),linear-gradient(130deg,#f8fafc,#ecfeff)] px-4 py-8">
      <div className="max-w-2xl mx-auto rounded-3xl border border-slate-200 bg-white/90 backdrop-blur p-6 md:p-8 shadow-xl">
        <p className="inline-flex items-center gap-2 rounded-full bg-sky-100 px-3 py-1 text-sm font-semibold text-sky-700">
          <Sparkles className="w-4 h-4" />
          Secure Sign Up
        </p>

        <h1 className="mt-4 text-3xl md:text-4xl font-black text-slate-900">Create your student account</h1>
        <p className="mt-2 text-slate-600">
          Continue with secure Auth0 sign in. Your session is protected and required before using planners, quizzes, analytics, and exam tools.
        </p>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700 inline-flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            Unauthenticated users cannot access protected platform routes.
          </p>
        </div>

        <button
          type="button"
          onClick={() => loginWithRedirect()}
          disabled={isLoading || isSaving}
          className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-sky-600 to-indigo-600 px-6 py-3 text-white font-semibold disabled:opacity-60"
        >
          {isLoading || isSaving ? "Setting up your account..." : "Continue Securely"}
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

export default SignupPage;
