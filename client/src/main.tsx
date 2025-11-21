import { StrictMode, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "urql";
import "./index.css";
import App from "./App.tsx";
import { client } from "./lib/graphql";
import { ErrorBoundary } from "./components/atoms";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <ErrorBoundary>
      <Suspense fallback={<div>Loading...</div>}>
        <Provider value={client}>
          <App />
        </Provider>
      </Suspense>
    </ErrorBoundary>
  </StrictMode>
);
