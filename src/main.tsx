import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { createHashRouter, RouterProvider } from "react-router-dom";
import "./index.css";
import { AppProvider } from "./state/AppContext";
import { PasscodeGate } from "./components/PasscodeGate";
import { PrankOverlay } from "./components/PrankOverlay"; // TEMP joke — remove later
import { Layout } from "./components/Layout";
import { Dashboard } from "./pages/Dashboard";
import { Tasks } from "./pages/Tasks";
import { ContentChecklist } from "./pages/ContentChecklist";
import { RecipeLibrary } from "./pages/RecipeLibrary";
import { Calendar } from "./pages/Calendar";
import { Shopping } from "./pages/Shopping";
import { Later } from "./pages/Later";

// HashRouter keeps deep links working on static hosting without server config —
// handy for Phase 2 deploy.
const router = createHashRouter([
  {
    path: "/",
    element: <Layout />,
    children: [
      { index: true, element: <Dashboard /> },
      { path: "tasks", element: <Tasks /> },
      { path: "content", element: <ContentChecklist /> },
      { path: "recipes", element: <RecipeLibrary /> },
      { path: "calendar", element: <Calendar /> },
      { path: "shopping", element: <Shopping /> },
      { path: "later", element: <Later /> },
    ],
  },
]);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <PasscodeGate>
      <AppProvider>
        <RouterProvider router={router} />
      </AppProvider>
      <PrankOverlay />{/* TEMP joke — remove later */}
    </PasscodeGate>
  </StrictMode>,
);
