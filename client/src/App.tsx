import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import styles from "./styles/app.css.ts";

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className={styles.container}>
      <div className={styles.logos}>
        <a href="https://vite.dev" target="_blank">
          <img src={viteLogo} className={styles.logo} alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src={reactLogo}
            className={`${styles.reactLogo} ${styles.animatedReactLogo}`}
            alt="React logo"
          />
        </a>
      </div>
      <h1>Vite + React</h1>
      <div className={styles.card}>
        <button onClick={() => setCount((prev) => prev + 1)}>
          count is {count}
        </button>
        <p>
          Edit <code>src/App.tsx</code> and save to test HMR
        </p>
      </div>
      <p className={styles.readTheDocs}>
        Click on the Vite and React logos to learn more
      </p>
    </div>
  );
}

export default App;
