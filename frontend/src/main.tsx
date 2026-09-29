import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./app/globals.css";
import { AuthProvider } from "./contexts/AuthContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { ToastHost } from "./components/ui";

// Global fetch interceptor: dynamically attaches VITE_API_URL and Bearer auth token
const originalFetch = window.fetch;
window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  let url = input;
  const customApiUrl = ((import.meta.env.VITE_API_URL as string | undefined) || "").replace(/\/+$/, "");

  if (typeof url === "string") {
    if (customApiUrl && url.startsWith("/api/")) {
      url = `${customApiUrl}${url}`;
    }
  } else if (url instanceof URL && customApiUrl && url.pathname.startsWith("/api/")) {
    url = new URL(`${customApiUrl}${url.pathname}${url.search}`);
  }

  const token = typeof window !== "undefined" ? localStorage.getItem("finovo_token") : null;
  if (token) {
    init = init || {};
    const headers = new Headers(init.headers || {});
    if (!headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${token}`);
    }
    init.headers = headers;
  }

  return originalFetch(url, init);
};

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error("Failed to find the root element");

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          <ToastHost />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
