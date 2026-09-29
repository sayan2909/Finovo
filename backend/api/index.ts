import app from "../src/server";

// Export for ES Module loaders
export default app;

// Ensure CommonJS module.exports compatibility for Vercel Serverless Function runner
if (typeof module !== "undefined" && module.exports) {
  module.exports = app;
  (module.exports as any).default = app;
}
