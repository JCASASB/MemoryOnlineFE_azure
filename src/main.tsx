import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./observability/faro";

createRoot(document.getElementById("root")!).render(<App />);
