import { calculateSignals } from "../lib/insights.js";
const INSTRUCTIONS = "You are MatchMind, a concise live-cricket analyst. Use only the supplied match facts and calculated signals. Never invent scores, players, events, or historical facts. Explain in simple fan language and cite two or three evidence points.";
export default async function handler(request, response) {
  if (request.method !== "POST") return response.status(405).json({ error: "Method not allowed" });
  if (!process.env.OPENAI_API_KEY) return response.status(500).json({ error: "OPENAI_API_KEY is not configured" });
  const { question, match } = request.body || {};
  if (!question || typeof question !== "string" || !match || typeof match !== "object") return response.status(400).json({ error: "A question and normalised match data are required" });
  const signals = calculateSignals(match);
  const input = `MATCH DATA:\n${JSON.stringify({ name: match.name, status: match.status, teams: match.teams, currentScore: match.currentScore, target: match.target }, null, 2)}\n\nCALCULATED SIGNALS:\n${JSON.stringify(signals, null, 2)}\n\nFAN QUESTION:\n${question}`;
  try {
    const result = await fetch("https://api.openai.com/v1/responses", { method: "POST", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env.OPENAI_API_KEY}` }, body: JSON.stringify({ model: process.env.OPENAI_MODEL || "gpt-5.5", instructions: INSTRUCTIONS, input, max_output_tokens: 220 }) });
    const payload = await result.json(); if (!result.ok) throw new Error(payload?.error?.message || `OpenAI returned ${result.status}`);
    return response.status(200).json({ answer: payload.output_text, signals });
  } catch (error) { return response.status(502).json({ error: "Unable to generate an AI insight", detail: error.message, signals }); }
}

