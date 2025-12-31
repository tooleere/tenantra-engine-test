import express from "express";
import { Redis } from "@upstash/redis";

const app = express();
app.use(express.json()); // IMPORTANT for POST body (safe to keep)

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.UPSTASH_REDIS_REST_TOKEN
});

app.get("/", (req, res) => {
  res.send("Engine is running");
});

// Redis test endpoint
app.get("/redis-test", async (req, res) => {
  try {
    const key = "tenantra:ping";
    const value = `pong-${Date.now()}`;

    await redis.set(key, value, { ex: 60 });
    const readBack = await redis.get(key);

    res.json({ ok: true, wrote: value, readBack });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Start a new round (simple)
app.post("/round/start", async (req, res) => {
  try {
    const roundId = `round_${Date.now()}`;
    const startTime = Date.now();

    const state = { status: "running", roundId, startTime };

    await redis.set("crash:state", state);
    res.json({ ok: true, state });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

// Read current round state
app.get("/round/state", async (req, res) => {
  try {
    const state = (await redis.get("crash:state")) || { status: "idle" };
    res.json({ ok: true, state });
  } catch (err) {
    res.status(500).json({ ok: false, error: String(err) });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server started");
});
