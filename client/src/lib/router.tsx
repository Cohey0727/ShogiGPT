import type { ComponentType, JSX, ReactNode } from "react";
import urlJoin from "url-join";
import { Route, Switch, type RouteComponentProps } from "wouter";

export type RouteConfig = RouteConfigWithoutChildren | RouteConfigWithChildren;

export interface RouteConfigWithoutChildren {
  path: string;
  component: ComponentType<RouteComponentProps>;
}

export interface RouteConfigWithChildren {
  path: string;
  component: ComponentType<RouteComponentProps & { children: ReactNode }>;
  children: RouteConfig[];
}

export interface NotFoundRouteConfig {
  component: ComponentType<RouteComponentProps>;
}

export interface RouteConfigWithNotFound {
  routes: (RouteConfig | RouteConfigWithChildren)[];
  notFound?: NotFoundRouteConfig;
}

export function renderRoutes(routeConfigs: RouteConfig[], parentPath?: string): JSX.Element[] {
  const routeElements: JSX.Element[] = [];

  routeConfigs.forEach((route) => {
    const fullPath = parentPath ? urlJoin(parentPath, route.path) : route.path;

    if ("children" in route) {
      const { component, children } = route;
      const Component = component as ComponentType<{ children: ReactNode }>;
      routeElements.push(
        <Route
          key={fullPath}
          path={`${fullPath}*`}
          component={() => (
            <Component>
              <Switch>{renderRoutes(children, fullPath)}</Switch>
            </Component>
          )}
        />,
      );
    } else {
      const { component } = route;
      const Component = component as ComponentType;
      routeElements.push(<Route key={fullPath} path={fullPath} component={() => <Component />} />);
    }
  });

  return routeElements;
}
