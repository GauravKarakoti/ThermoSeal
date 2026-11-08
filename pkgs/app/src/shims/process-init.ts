import process from "process/browser";

(globalThis as any).process ??= process;
(globalThis as any).process.env ??= {};
(globalThis as any).process.browser = true;
(globalThis as any).process.version ??= "v18.0.0";
(globalThis as any).process.versions ??= {};