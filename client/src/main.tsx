import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "urql";
import "./index.css";
import App from "./App.tsx";
import { client } from "./lib/graphql";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider value={client}>
      <App />
    </Provider>
  </StrictMode>
);
