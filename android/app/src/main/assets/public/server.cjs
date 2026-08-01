var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
var import_dotenv = __toESM(require("dotenv"), 1);
import_dotenv.default.config();
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = Number(process.env.PORT) || 3e3;
  app.use(import_express.default.json());
  app.post("/api/coach", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is missing. Please configure it in environment settings."
        });
      }
      const { prompt, userContext, mode } = req.body;
      const ai = new import_genai.GoogleGenAI({ apiKey });
      let systemInstruction = `You are SARTHI, an elite AI Executive Life & Business Coach inspired by top leadership mentors, high-performance strategists, and mindful leaders. 
Your primary user is Mihir, a driven business leader and life optimizer.
Always communicate with clarity, high empathy, strategic precision, and actionable guidance. Keep tone professional, inspiring, and concise.`;
      if (mode === "daily_review") {
        systemInstruction += ` You are analyzing Mihir's current day metrics (habits completed, pending tasks, journal mood, and streaks). Provide a concise 3-part review:
1. \u{1F31F} **Daily Win & Praise**: Highlighting what went well.
2. \u{1F4A1} **Strategic Opportunity**: 1 actionable pivot or focus for remaining hours.
3. \u{1F525} **Mindset Spark**: 2-sentence empowering closing.`;
      } else if (mode === "habit_advice") {
        systemInstruction += ` Focus on habit psychology, behavioral loops, consistency tactics, and energy management.`;
      } else if (mode === "planner_boost") {
        systemInstruction += ` Focus on high-leverage time blocking, Pareto 80/20 task prioritization, and meeting management.`;
      }
      const fullPrompt = `${systemInstruction}

[USER CONTEXT]
${JSON.stringify(userContext || {}, null, 2)}

[USER QUESTION / MESSAGE]
${prompt || "Provide today's executive life summary and actionable coaching."}`;
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt
      });
      return res.json({
        reply: response.text || "Keep pushing forward with purpose and discipline, Mihir!"
      });
    } catch (error) {
      console.error("Error in /api/coach:", error);
      return res.status(500).json({
        error: error.message || "Failed to generate AI Coach insights."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = typeof __dirname !== "undefined" ? __dirname : import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SARTHI App server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
