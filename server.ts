import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  app.use(express.json());

  // AI Coach API Endpoint using Gemini 2.5 Flash
  app.post("/api/coach", async (req, res) => {
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY is missing. Please configure it in environment settings."
        });
      }

      const { prompt, userContext, mode } = req.body;
      const ai = new GoogleGenAI({ apiKey });

      let systemInstruction = `You are SARTHI, an elite AI Executive Life & Business Coach inspired by top leadership mentors, high-performance strategists, and mindful leaders. 
Your primary user is Mihir, a driven business leader and life optimizer.
Always communicate with clarity, high empathy, strategic precision, and actionable guidance. Keep tone professional, inspiring, and concise.`;

      if (mode === 'daily_review') {
        systemInstruction += ` You are analyzing Mihir's current day metrics (habits completed, pending tasks, journal mood, and streaks). Provide a concise 3-part review:
1. 🌟 **Daily Win & Praise**: Highlighting what went well.
2. 💡 **Strategic Opportunity**: 1 actionable pivot or focus for remaining hours.
3. 🔥 **Mindset Spark**: 2-sentence empowering closing.`;
      } else if (mode === 'habit_advice') {
        systemInstruction += ` Focus on habit psychology, behavioral loops, consistency tactics, and energy management.`;
      } else if (mode === 'planner_boost') {
        systemInstruction += ` Focus on high-leverage time blocking, Pareto 80/20 task prioritization, and meeting management.`;
      }

      const fullPrompt = `${systemInstruction}\n\n[USER CONTEXT]\n${JSON.stringify(userContext || {}, null, 2)}\n\n[USER QUESTION / MESSAGE]\n${prompt || "Provide today's executive life summary and actionable coaching."}`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: fullPrompt,
      });

      return res.json({
        reply: response.text || "Keep pushing forward with purpose and discipline, Mihir!"
      });
    } catch (error: any) {
      console.error("Error in /api/coach:", error);
      return res.status(500).json({
        error: error.message || "Failed to generate AI Coach insights."
      });
    }
  });

  // Serve static assets or Vite middleware
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SARTHI App server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
