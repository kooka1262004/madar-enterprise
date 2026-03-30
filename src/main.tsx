import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { seedDemoData } from "./utils/seedData";

// Seed demo data on first load
seedDemoData();

createRoot(document.getElementById("root")!).render(<App />);
