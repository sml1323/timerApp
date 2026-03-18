import { createBrowserRouter } from "react-router";
import App from "../App";
import { HomeRoute } from "./routes/HomeRoute";
import { TopicsRoute } from "./routes/TopicsRoute";
import { StatsRoute } from "./routes/StatsRoute";
import { NotFoundRoute } from "./routes/NotFoundRoute";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
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
        path: "*",
        element: <NotFoundRoute />,
      },
    ],
  },
]);
