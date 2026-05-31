const HOST_URL = "https://aimanager-backend.onrender.com";
const LOCAL_URL = "http://localhost:5001";

export const BASIC_URL = import.meta.env.VITE_ENVIRONMENT === "local" ? LOCAL_URL : HOST_URL;