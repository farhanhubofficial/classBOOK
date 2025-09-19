import { StrictMode } from "react";
import React from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider } from "./components/AuthContext.jsx";

// ✅ Add these imports
import { GiSpellBook } from "react-icons/gi";
import ReactDOMServer from "react-dom/server";

// ✅ Function to render favicon with given color
function updateFavicon(color = "black") {
  const svgString = ReactDOMServer.renderToStaticMarkup(
    <GiSpellBook size={64} color={color} />
  );
  const blob = new Blob([svgString], { type: "image/svg+xml" });
  const url = URL.createObjectURL(blob);

  let link = document.querySelector("link[rel='icon']");
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.href = url;
}

// ✅ Detect system theme and update favicon
function setFaviconByTheme() {
  const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  updateFavicon(darkMode ? "white" : "black");
}

// ✅ Render app
createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <App />
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>
);

// ✅ Run favicon update after app mounts
setFaviconByTheme();

// ✅ Listen for theme changes (live update)
window
  .matchMedia("(prefers-color-scheme: dark)")
  .addEventListener("change", setFaviconByTheme);

// ✅ Register service worker AFTER app is mounted
if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register("/service-worker.js")
      .then((registration) => {
        console.log("✅ Service Worker registered with scope:", registration.scope);
      })
      .catch((error) => {
        console.error("❌ Service Worker registration failed:", error);
      });
  });
}
