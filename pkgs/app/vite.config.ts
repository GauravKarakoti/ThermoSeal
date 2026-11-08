import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import { createRequire } from "module";
import nodePolyfills from "rollup-plugin-node-polyfills";
import stdLibBrowser from "node-stdlib-browser";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import wasm from "vite-plugin-wasm";

const _require = createRequire(import.meta.url);

const _crPkgPath = _require.resolve(
  "@midnight-ntwrk/compact-runtime/package.json",
);
const _crNodeModules = path.dirname(path.dirname(path.dirname(_crPkgPath)));
const _candidateOnchainPath = path.join(
  _crNodeModules,
  "@midnight-ntwrk",
  "onchain-runtime-v3",
  "midnight_onchain_runtime_wasm.js",
);
const onchainRuntimeBrowserPath = fs.existsSync(_candidateOnchainPath)
  ? _candidateOnchainPath
  : path.resolve(
      __dirname,
      "../../node_modules/@midnight-ntwrk/onchain-runtime-v3/midnight_onchain_runtime_wasm.js",
    );

function onchainRuntimeV3ShimPlugin(onchainRuntimePath: string): Plugin {
  const ONCHAIN_RUNTIME_V3_ID = "@midnight-ntwrk/onchain-runtime-v3";
  return {
    name: "onchain-runtime-v3-shim",
    enforce: "pre",
    resolveId(id) {
      if (id === ONCHAIN_RUNTIME_V3_ID) {
        return onchainRuntimePath;
      }
    },
  };
}

function safeCjsWrapperPlugin(): Plugin {
  return {
    name: "safe-cjs-wrapper",
    transform(code, id) {
      if (
        (id.includes("@midnight-ntwrk") || id.includes("pkgs/")) &&
        !id.includes("cross-fetch") &&
        (code.includes("exports.") || code.includes("module.exports")) &&
        !code.includes("export default") &&
        !code.includes("export const")
      ) {
        return `
          var module = { exports: {} };
          var exports = module.exports;
          (function(module, exports) {
            ${code}
          })(module, module.exports);
          export default module.exports;
          export const { ${
            [...code.matchAll(/exports\.([a-zA-Z0-9_$]+)\s*=/g)]
              .map((m) => m[1])
              .filter((v, i, a) => a.indexOf(v) === i)
              .join(", ")
          } } = module.exports;
        `;
      }
      return null;
    },
  };
}

export default defineConfig({
  plugins: [
    safeCjsWrapperPlugin(),
    onchainRuntimeV3ShimPlugin(onchainRuntimeBrowserPath),
    react(),
    tailwindcss(),
    wasm(),
  ],
  server: {
    proxy: {
      "/proof-server": {
        target: "http://127.0.0.1:6300",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/proof-server/, ""),
      },
    },
    watch: {
      usePolling: true,
      interval: 100,
    },
  },
  resolve: {
    dedupe: [
      "react",
      "react-dom",
      "@midnight-ntwrk/compact-runtime",
      "@midnight-ntwrk/onchain-runtime-v3",
    ],
    alias: [
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      {
        find: "@midnight-ntwrk/compact-runtime",
        replacement: path.dirname(_crPkgPath),
      },
      ...Object.entries(stdLibBrowser).map(([find, replacement]) => ({
        find,
        replacement: replacement as string,
      })),
    ],
  },
  optimizeDeps: {
    exclude: [
      "@midnight-ntwrk/onchain-runtime",
      "@midnight-ntwrk/onchain-runtime-v3",
    ],
    include: ["contract", "react", "react-dom", "react-dom/client"],
  },
  build: {
    target: "esnext",
    rollupOptions: {
      plugins: [nodePolyfills() as any],
    },
    commonjsOptions: {
      transformMixedEsModules: true,
      include: [],
    },
  },
  define: {
    global: "globalThis",
  },
  worker: {
    format: "es",
    plugins: () => [wasm()],
  },
});