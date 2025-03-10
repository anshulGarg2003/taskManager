import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { Provider } from "react-redux";
import { store } from "./redux/store.js";
import { Toaster } from "react-hot-toast";
import { Auth0Provider } from "@auth0/auth0-react";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Auth0Provider
      domain="dev-b2c60oxe3p0xdmk0.us.auth0.com"
      clientId="TUZJ0eqYhVm8hrj9e741hg3DrmzOaYoz"
      authorizationParams={{
        redirect_uri: window.location.origin,
      }}
    >
      <Provider store={store}>
        <div className="min-h-screen w-screen overflow-hidden">
          <App />
          <Toaster position="top-right" />
        </div>
      </Provider>
    </Auth0Provider>
  </StrictMode>
);
