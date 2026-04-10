import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { BRAND_PAGE_TITLE } from "@/lib/branding";

document.title = BRAND_PAGE_TITLE;

createRoot(document.getElementById("root")!).render(<App />);
