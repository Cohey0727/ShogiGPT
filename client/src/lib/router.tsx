import { Suspense, type ComponentType, type JSX, type ReactNode } from "react";
import urlJoin from "url-join";
import { Route, Switch, type RouteComponentProps } from "wouter";

export type RouteConfig = RouteConfigWithoutChildren | RouteConfigWithChildren;

export interface RouteConfigWithoutChildren {
  path: string;
  component: ComponentType<RouteComponentProps>;
  fallback?: ReactNode;
}

export interface RouteConfigWithChildren {
  path: string;
  component: ComponentType<RouteComponentProps & { children: ReactNode }>;
  children: RouteConfig[];
  fallback?: ReactNode;
}

export interface NotFoundRouteConfig {
  component: ComponentType<RouteComponentProps>;
}

export interface RouteConfigWithNotFound {
  routes: (RouteConfig | RouteConfigWithChildren)[];
  notFound?: NotFoundRouteConfig;
}

export function renderRoutes(
  routeConfigs: RouteConfig[],
  defaultFallback?: ReactNode,
  parentPath?: string
): JSX.Element[] {
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
              <Switch>
                {renderRoutes(children, defaultFallback, fullPath)}
              </Switch>
            </Component>
          )}
        />
      );
    } else {
      const { component, fallback } = route;
      const Component = component as ComponentType;
      const suspenseFallback = fallback || defaultFallback;
      routeElements.push(
        <Route
          key={fullPath}
          path={fullPath}
          component={() => (
            <Suspense fallback={suspenseFallback}>
              <Component />
            </Suspense>
          )}
        />
      );
    }
  });

  return routeElements;
}
