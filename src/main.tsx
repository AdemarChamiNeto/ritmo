import "@fontsource/inter/latin-400.css";
import "@fontsource/inter/latin-600.css";
import "@fontsource/inter/latin-700.css";
import "@fontsource/lora/latin-600.css";
import "@fontsource/lora/latin-700.css";
import React from "react";
import { createRoot } from "react-dom/client";
import { Provider } from "react-redux";
import { registerSW } from "virtual:pwa-register";
import App from "./App";
import { makeStore } from "./store";
import { loadData } from "./store/persistence";
import "./styles.css";

registerSW({ immediate: true });

// carrega os dados do IndexedDB antes de montar, para não piscar a tela de "configure"
loadData().then((data) => {
  createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <Provider store={makeStore(data)}>
        <App />
      </Provider>
    </React.StrictMode>,
  );
});
