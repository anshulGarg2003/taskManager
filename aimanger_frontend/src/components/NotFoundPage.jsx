import { useNavigate } from "react-router-dom";

const NotFoundPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[calc(100vh-72px)] flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-lg w-full rounded-3xl border border-slate-200 bg-white p-6 shadow-xl">
        <h1 className="text-3xl font-black text-slate-900">404 - Invalid Page</h1>
        <p className="mt-2 text-slate-600">
          The route you entered does not exist in this platform.
        </p>
        <button
          className="mt-6 rounded-xl bg-sky-600 text-white px-5 py-2.5 font-semibold"
          onClick={() => navigate("/")}
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFoundPage;
