import React from "react";
import ReactDOM from "react-dom/client";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import App from "./App";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
    <Toaster richColors />
  </React.StrictMode>
); 