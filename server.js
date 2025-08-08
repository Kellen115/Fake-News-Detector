import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(express.json());

// ✅ Allow only your frontend domain
app.use(
  cors({
    origin: "https://kellen115.github.io",
  })
);

const MODEL_URL =
  "https://api-inference.huggingface.co/models/distilbert/distilbert-base-uncased-finetuned-sst-2-english";

app.get("/", (req, res) => {
  res.send("Backend alive - POST /api/analyze");
});

app.post("/api/analyze", async (req, res) => {
  try {
    const { text } = req.body;
    console.log("Request received. text length:", text ? text.length : 0);

    if (!text || text.trim() === "") {
      console.log("No text provided");
      return res.status(400).json({ error: "No text provided" });
    }

    const hfResp = await fetch(MODEL_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.HF_API_KEY}`,
      },
      body: JSON.stringify({ inputs: text }),
    });

    const status = hfResp.status;
    const statusText = hfResp.statusText;
    const raw = await hfResp.text();

    console.log("HuggingFace status:", status, statusText);
    console.log(
      "HuggingFace raw response (first 1000 chars):",
      raw.slice(0, 1000)
    );

    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch (err) {
      console.error("Hugging Face returned non-JSON:", err.message);
      return res.status(502).json({
        error: "Hugging Face returned non-JSON response",
        hfStatus: status,
        hfStatusText: statusText,
        hfRaw: raw,
      });
    }

    return res.json({ result: parsed, hfStatus: status });
  } catch (err) {
    console.error("Server error:", err);
    return res
      .status(500)
      .json({ error: "Server error", message: err.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
