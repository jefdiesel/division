import { createBrowserRouter, Navigate } from "react-router-dom";
import { Landing } from "./pages/Landing";
import AuthPage from "./pages/AuthPage";
import InvitePage from "./pages/InvitePage";
import CreateHouseholdPage from "./pages/CreateHouseholdPage";
import { SetupPage } from "./pages/SetupPage";
import MainApp from "./pages/MainApp";
import { LogView } from "./components/logging/LogView";
import { DashboardView } from "./components/dashboard/DashboardView";
import { HistoryView } from "./components/history/HistoryView";
import { RulesetView } from "./components/ruleset/RulesetView";

export const router = createBrowserRouter([
  { path: "/", element: <Landing /> },
  { path: "/auth", element: <AuthPage /> },
  { path: "/invite/:token", element: <InvitePage /> },
  { path: "/create-household", element: <CreateHouseholdPage /> },
  { path: "/setup", element: <SetupPage /> },
  {
    path: "/app",
    element: <MainApp />,
    children: [
      { index: true, element: <Navigate to="log" replace /> },
      { path: "log", element: <LogView /> },
      { path: "dashboard", element: <DashboardView /> },
      { path: "history", element: <HistoryView /> },
      { path: "rules", element: <RulesetView /> },
    ],
  },
]);
