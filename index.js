// Create / start a new round (simple version)
app.post("/round/start", async (req, res) => {
  try {
    const roundId = `round_${Date.now()}`;
    const startTime = Date.now();

    // For now we just store round meta (we'll add crash point + fairness next)
    const state = {
      status: "running",
      roundId,
      startTime
    };

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
