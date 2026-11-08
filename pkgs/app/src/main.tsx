import "@/i18n";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import { Toaster } from "./components/ui/sonner";
import { NetworkProvider } from "./contexts/NetworkContext";
import { WalletProvider } from "./contexts/WalletContext";
import "./css/index.css";
import "./shims/process-init";
import { Buffer } from "buffer";
(globalThis as any).Buffer ??= Buffer;

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <NetworkProvider>
      <WalletProvider>
        <App />
        <Toaster theme="dark" position="bottom-right" richColors />
      </WalletProvider>
    </NetworkProvider>
  </StrictMode>,
);