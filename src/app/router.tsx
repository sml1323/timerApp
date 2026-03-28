import { createBrowserRouter } from "react-router";
import { AppShell } from "./layout";
import { HomeRoute } from "./routes/HomeRoute";
import { TopicsRoute } from "./routes/TopicsRoute";
import { StatsRoute } from "./routes/StatsRoute";
import { NotFoundRoute } from "./routes/NotFoundRoute";
import { SessionPage } from "../features/session/SessionPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <AppShell />,
    children: [
      {
        index: true,
        element: <HomeRoute />,
      },
      {
        path: "topics",
        element: <TopicsRoute />,
      },
      {
        path: "stats",
        element: <StatsRoute />,
      },
      {
        path: "session",
        element: <SessionPage />,
      },
      {
        path: "*",
        element: <NotFoundRoute />,
      },
    ],
  },
]);
