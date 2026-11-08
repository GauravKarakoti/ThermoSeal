import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import fs from "fs";
import { createRequire } from "module";
import nodePolyfills from "rollup-plugin-node-polyfills";
import stdLibBrowser from "node-stdlib-browser";
import path from "path";
import { defineConfig, type Plugin } from "vite";
import wasm from "vite-plugin-wasm";
import commonjs from "@rollup/plugin-commonjs";

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

/**
 * Production-only React ESM shim to ensure all named exports (like isValidElement)
 * are explicitly provided to Rollup during production builds.
 */
function reactBuildShimPlugin(): Plugin {
  const rDir = path.dirname(_require.resolve("react/package.json"));
  const rdDir = path.dirname(_require.resolve("react-dom/package.json"));
  const rdRequire = createRequire(path.join(rdDir, "package.json"));
  const schedDir = path.dirname(rdRequire.resolve("scheduler/package.json"));
  const rI18nDir = path.dirname(_require.resolve("react-i18next/package.json"));
  const rI18nRequire = createRequire(path.join(rI18nDir, "package.json"));
  const usseDir = path.dirname(
    rI18nRequire.resolve("use-sync-external-store/package.json"),
  );

  const REACT_ID = "\0virtual:react-build";
  const REACT_DOM_ID = "\0virtual:react-dom-build";
  const REACT_DOM_CLIENT_ID = "\0virtual:react-dom-client-build";
  const JSX_RUNTIME_ID = "\0virtual:jsx-runtime-build";
  const JSX_DEV_RUNTIME_ID = "\0virtual:jsx-dev-runtime-build";
  const USSE_SHIM_ID = "\0virtual:use-sync-external-store-shim-build";

  return {
    name: "react-build-shim",
    apply: "build",
    enforce: "pre",
    resolveId(id) {
      if (id === "react") return REACT_ID;
      if (id === "react-dom") return REACT_DOM_ID;
      if (id === "react-dom/client") return REACT_DOM_CLIENT_ID;
      if (id === "react/jsx-runtime") return JSX_RUNTIME_ID;
      if (id === "react/jsx-dev-runtime") return JSX_DEV_RUNTIME_ID;
      if (id === "use-sync-external-store/shim") return USSE_SHIM_ID;
    },
    load(id) {
      if (id === REACT_ID) {
        const cjsCode = fs.readFileSync(
          path.join(rDir, "cjs/react.production.js"),
          "utf-8",
        );
        return `
var _r = {};
(function(exports) {
${cjsCode}
})(_r);
export const {
  Activity, Children, Component, Fragment, Profiler, PureComponent,
  StrictMode, Suspense,
  __CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  __COMPILER_RUNTIME,
  cache, cacheSignal, cloneElement, createContext, createElement, createRef,
  forwardRef, isValidElement, lazy, memo, startTransition,
  unstable_useCacheRefresh, use, useActionState, useCallback, useContext,
  useDebugValue, useDeferredValue, useEffect, useEffectEvent, useId,
  useImperativeHandle, useInsertionEffect, useLayoutEffect, useMemo,
  useOptimistic, useReducer, useRef, useState, useSyncExternalStore,
  useTransition, version,
} = _r;
export default _r;
`;
      }
      if (id === REACT_DOM_ID) {
        const cjsCode = fs.readFileSync(
          path.join(rdDir, "cjs/react-dom.production.js"),
          "utf-8",
        );
        return `
import _react from "react";
var _rd = {};
(function(exports, require) {
${cjsCode}
})(_rd, function(id) {
  if (id === "react") return _react;
  throw new Error("[react-dom-build-shim] Unknown module: " + id);
});
export const {
  __DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,
  createPortal, flushSync, preconnect, prefetchDNS, preinit, preinitModule,
  preload, preloadModule, requestFormReset, unstable_batchedUpdates,
  useFormState, useFormStatus, version,
} = _rd;
export default _rd;
`;
      }
      if (id === REACT_DOM_CLIENT_ID) {
        const schedCode = fs.readFileSync(
          path.join(schedDir, "cjs/scheduler.production.js"),
          "utf-8",
        );
        const cjsCode = fs.readFileSync(
          path.join(rdDir, "cjs/react-dom-client.production.js"),
          "utf-8",
        );
        return `
import _react from "react";
import _rd from "react-dom";
var _sched = {};
(function(exports) {
${schedCode}
})(_sched);
var _rdc = {};
(function(exports, require) {
${cjsCode}
})(_rdc, function(id) {
  if (id === "react") return _react;
  if (id === "react-dom") return _rd;
  if (id === "scheduler") return _sched;
  throw new Error("[react-dom-client-build-shim] Unknown module: " + id);
});
export const { createRoot, hydrateRoot } = _rdc;
export default _rdc;
`;
      }
      if (id === JSX_RUNTIME_ID) {
        const cjsCode = fs.readFileSync(
          path.join(rDir, "cjs/react-jsx-runtime.production.js"),
          "utf-8",
        );
        return `
import _react from "react";
var _jsx = {};
(function(exports, require) {
${cjsCode}
})(_jsx, function(id) {
  if (id === "react") return _react;
  throw new Error("[react-jsx-runtime-build-shim] Unknown module: " + id);
});
export const { Fragment, jsx, jsxs } = _jsx;
export default _jsx;
`;
      }
      if (id === JSX_DEV_RUNTIME_ID) {
        const cjsCode = fs.readFileSync(
          path.join(rDir, "cjs/react-jsx-dev-runtime.production.js"),
          "utf-8",
        );
        return `
import _react from "react";
var _jsxd = {};
(function(exports, require) {
${cjsCode}
})(_jsxd, function(id) {
  if (id === "react") return _react;
  throw new Error("[react-jsx-dev-runtime-build-shim] Unknown module: " + id);
});
export const { Fragment, jsxDEV } = _jsxd;
export default _jsxd;
`;
      }
      if (id === USSE_SHIM_ID) {
        const cjsCode = fs.readFileSync(
          path.join(usseDir, "cjs/use-sync-external-store-shim.production.js"),
          "utf-8",
        );
        return `
import _react from "react";
var _usse = {};
(function(exports, require) {
${cjsCode}
})(_usse, function(id) {
  if (id === "react") return _react;
  throw new Error("[use-sync-external-store-shim-build] Unknown module: " + id);
});
export const { useSyncExternalStore } = _usse;
export default _usse;
`;
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
    reactBuildShimPlugin(),
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
      {
        find: "cross-fetch",
        replacement: _require.resolve("cross-fetch/dist/browser-ponyfill.js"),
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
      plugins: [
        nodePolyfills() as any,
        commonjs({
          include: [
            /node_modules\/cookie/,
            /node_modules\/set-cookie-parser/,
            /node_modules\/react-router/,
            /node_modules\/object-inspect/,
            /node_modules\/cross-fetch/,
          ],
          transformMixedEsModules: true,
        }),
      ],
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