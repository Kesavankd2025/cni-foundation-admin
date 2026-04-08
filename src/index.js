import React from "react";
import ReactDOM from "react-dom/client";
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import App from "./App";
import reportWebVitals from "./reportWebVitals";

// Suppress ResizeObserver loop error overlay (benign error common in modern UI libs)
window.addEventListener('error', (e) => {
  if (e.message && (e.message.includes('ResizeObserver loop') || e.message.includes('ResizeObserver loop limit exceeded'))) {
    const overlay = document.getElementById('webpack-dev-server-client-overlay');
    if (overlay) overlay.style.display = 'none';
    const overlayDiv = document.getElementById('webpack-dev-server-client-overlay-div');
    if (overlayDiv) overlayDiv.style.display = 'none';
    e.stopImmediatePropagation();
  }
});

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    <App />
  </>
);

reportWebVitals();
