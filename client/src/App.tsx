import { Route, Switch } from "wouter";
import {
  HomePage,
  SettingsPage,
  NotFoundPage,
  MatchesPage,
  MatchDetailPage,
} from "./components/pages";
import { RootLayout } from "./components/layouts";
import { renderRoutes, type RouteConfigWithNotFound } from "./lib/router";

const routeConfig: RouteConfigWithNotFound = {
  routes: [
    {
      path: "/",
      component: RootLayout,
      children: [
        {
          path: "/",
          component: HomePage,
        },
        {
          path: "/settings",
          component: SettingsPage,
        },
        {
          path: "/matches",
          component: MatchesPage,
        },
        {
          path: "/matches/:matchId",
          component: MatchDetailPage,
        },
      ],
    },
  ],
  notFound: {
    component: NotFoundPage,
  },
};

function App() {
  return (
    <Switch>
      {renderRoutes(routeConfig.routes)}
      {routeConfig.notFound && <Route component={routeConfig.notFound.component} />}
    </Switch>
  );
}

export default App;
