import React, { useState } from "react";
import "./App.css"; // we'll add styles here

function App() {
  const [text, setText] = useState("");
  const [result, setResult] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const analyzeText = async () => {
    setLoading(true);
    setError("");
    setResult("");

    try {
      const response = await fetch("http://localhost:5000/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });

      const data = await response.json();
      if (response.ok) {
        const predictions = data.result;
        if (Array.isArray(predictions) && predictions.length > 0) {
          const top = predictions[0].reduce((a, b) =>
            a.score > b.score ? a : b
          );
          setResult(top.label);
        } else {
          setError("Unexpected response format");
        }
      } else {
        setError(data.error || "Unknown error");
      }
    } catch (err) {
      setError("Failed to connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1>📰 Fake News Detector</h1>

        <textarea
          placeholder="Paste text here..."
          value={text}
          onChange={(e) => setText(e.target.value)}
        />

        <button onClick={analyzeText} disabled={loading || !text.trim()}>
          {loading ? "Analyzing..." : "Analyze"}
        </button>

        {error && <p className="error">{error}</p>}

        {result && (
          <p className={`result ${result.toLowerCase()}`}>
            Prediction: {result}
          </p>
        )}
      </div>
    </div>
  );
}

export default App;
