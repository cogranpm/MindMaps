import React, { useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { App } from "./App";
import "./index.css";
import "./public/fonts/IBMPlexMono-Thin.css"
import "bootstrap/dist/css/bootstrap.min.css";
import { startDatabaseWorker, initializeLocalDatabases, closeLocalDatabases } from "./shared/workerClient";
import { logMessage } from "./shared/errorHandling";
import * as registerWorker from "./public/workers/register-worker";


// service worker registration
registerWorker.registerWorker();

// init the database
startDatabaseWorker().then(() => {
  logMessage("Database worker Initialized");
  initializeLocalDatabases().then(() => {
    logMessage("Local Databases Initialized");
  });
});


window.addEventListener("beforeunload", () => {
  closeLocalDatabases().then(() => {
    logMessage("Closed Local Databases");
  });
});

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

/*

strict mode makes effects run twice, by design
which confused me greatly when testing
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
*/
