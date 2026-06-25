import React, { useState, useEffect } from "react";

// Plainly — a calm communication aid for neurodiverse people.
// Understand (decode a received message) + Compose (write a clear one).
// Low-sensory design, accessibility-research typefaces, reader controls.

const C = {
  mist: "#E8EDE8",
  paper: "#FCFCFA",
  ink: "#26332D",
  inkSoft: "#5C6B63",
  sage: "#5E8B73",
  peri: "#6E7FB0",
  clay: "#C98A5E",
  line: "#D7DED7",
};

const TONES = ["Friendly", "Neutral", "Firm but kind", "Apologetic"];

const UNDERSTAND_PRESETS = [
  "Hey, no worries if not, but were you still thinking of coming Saturday? totally fine either way!!",
  "Per my last email. Please advise.",
  "k.",
];
const COMPOSE_PRESETS = [
  "tell my prof i cant submit the assignment on time bc i was sick, ask for 2 more days",
  "i need to cancel plans with my friend tonight but i dont want them to be upset",
];

const UNDERSTAND_SYS = `You help neurodiverse people understand messages they receive. Many find indirect language, hidden expectations, and emotional subtext hard to read. Restate things plainly and literally, warmly, never condescendingly.
Return ONLY valid JSON, no markdown, no preamble. Schema:
{
 "plainMeaning": "1-2 sentences, literal plain-language restatement of what they actually mean",
 "tone": "a few words describing the emotional tone, calm and non-judgmental",
 "urgency": "low" | "medium" | "high",
 "urgencyReason": "one short sentence",
 "hiddenExpectations": ["things the sender may expect but did not say directly; empty array if none"],
 "replyDirection": "gentle guidance on what a good reply could do; not a full draft"
}`;

const COMPOSE_SYS = `You help neurodiverse people write clear, appropriately-toned messages. The user describes what they want to say, sometimes messily. Write something natural they can send.
Return ONLY valid JSON, no markdown, no preamble. Schema:
{
 "draft": "a clear, kind, appropriately-toned message ready to send",
 "whatChanged": ["2 to 4 short plain notes on choices you made and why"]
}`;

async function callAI(system, user) {
  const res = await fetch("/api/chat", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ system, user }),
  });
  if (!res.ok) throw new Error("request failed");
  const data = await res.json();
  const text = (data.content || "").replace(/```json|```/g, "").trim();
  return JSON.parse(text);
}

export default function App() {
  const [mode, setMode] = useState("understand");
  const [scale, setScale] = useState(1);
  const [input, setInput] = useState("");
  const [tone, setTone] = useState("Friendly");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");
  const [result, setResult] = useState(null);

  useEffect(() => {
    setInput("");
    setResult(null);
    setErr("");
  }, [mode]);

  async function run() {
    if (!input.trim()) {
      setErr("Add a message first, then I can help.");
      return;
    }
    setLoading(true);
    setErr("");
    setResult(null);
    try {
      if (mode === "understand") {
        setResult(await callAI(UNDERSTAND_SYS, input.trim()));
      } else {
        setResult(
          await callAI(COMPOSE_SYS, `Desired tone: ${tone}.\nWhat I want to say: ${input.trim()}`)
        );
      }
    } catch (e) {
      setErr("That didn't go through. Check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const accent = mode === "understand" ? C.sage : C.peri;
  const fs = (px) => ({ fontSize: px * scale });

  return (
    <div style={{ minHeight: "100vh", background: `radial-gradient(1200px 600px at 50% -10%, #EFF3EF 0%, ${C.mist} 62%)`, color: C.ink }}>
      <div style={{ maxWidth: 680, margin: "0 auto", padding: "32px 20px 80px" }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, marginBottom: 8 }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <svg width="30" height="30" viewBox="0 0 32 32" aria-hidden="true" style={{ flexShrink: 0 }}>
                <rect width="32" height="32" rx="9" fill={C.sage} />
                <path d="M9 11h14a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-7l-4 3v-3H9a2 2 0 0 1-2-2v-6a2 2 0 0 1 2-2z" fill="#FCFCFA" />
              </svg>
              <h1 style={{ fontFamily: "Lexend, sans-serif", fontWeight: 600, margin: 0, letterSpacing: "-0.5px", ...fs(34) }}>Plainly</h1>
            </div>
            <p style={{ color: C.inkSoft, margin: "6px 0 0", lineHeight: 1.5, ...fs(16) }}>
              A calm space to understand messages and say what you mean.
            </p>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 999, padding: "6px 10px" }}>
            <span style={{ color: C.inkSoft, ...fs(13) }}>Text</span>
            <button onClick={() => setScale((s) => Math.max(0.9, +(s - 0.1).toFixed(2)))} aria-label="Smaller text" style={btnRound}>−</button>
            <button onClick={() => setScale((s) => Math.min(1.4, +(s + 0.1).toFixed(2)))} aria-label="Larger text" style={btnRound}>+</button>
          </div>
        </header>

        <div role="tablist" aria-label="Mode" style={{ display: "flex", gap: 8, background: C.paper, border: `1px solid ${C.line}`, borderRadius: 14, padding: 6, margin: "22px 0 18px" }}>
          {[["understand", "Understand a message", C.sage], ["compose", "Help me write one", C.peri]].map(([m, label, col]) => (
            <button key={m} role="tab" aria-selected={mode === m} onClick={() => setMode(m)}
              style={{
                flex: 1, border: "none", borderRadius: 10, padding: "12px 10px", fontWeight: 700,
                background: mode === m ? col : "transparent",
                color: mode === m ? "#fff" : C.inkSoft, transition: "background .2s, color .2s", ...fs(15),
              }}>
              {label}
            </button>
          ))}
        </div>

        <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderRadius: 16, padding: 18 }}>
          <label style={{ display: "block", color: C.inkSoft, marginBottom: 8, ...fs(14) }}>
            {mode === "understand" ? "Paste the message you received" : "Tell me what you want to say — messy is fine"}
          </label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            rows={mode === "understand" ? 4 : 3}
            placeholder={mode === "understand" ? 'e.g. "per my last email, please advise"' : 'e.g. "ask my boss for monday off without sounding like a big deal"'}
            style={{
              width: "100%", resize: "vertical", border: `1px solid ${C.line}`, borderRadius: 12,
              padding: "12px 14px", lineHeight: 1.6, color: C.ink, background: "#fff", ...fs(16),
            }}
          />

          {mode === "compose" && (
            <div style={{ marginTop: 14 }}>
              <span style={{ color: C.inkSoft, ...fs(14) }}>How should it sound?</span>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
                {TONES.map((t) => (
                  <button key={t} onClick={() => setTone(t)}
                    style={{
                      border: `1px solid ${tone === t ? C.peri : C.line}`, background: tone === t ? "#EEF1F8" : "#fff",
                      color: tone === t ? C.peri : C.inkSoft, borderRadius: 999, padding: "7px 14px", fontWeight: 700, ...fs(14),
                    }}>
                    {t}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div style={{ marginTop: 14, display: "flex", flexWrap: "wrap", gap: 8 }}>
            {(mode === "understand" ? UNDERSTAND_PRESETS : COMPOSE_PRESETS).map((p, i) => (
              <button key={i} onClick={() => setInput(p)}
                style={{ border: `1px dashed ${C.line}`, background: "transparent", color: C.inkSoft, borderRadius: 10, padding: "8px 12px", textAlign: "left", maxWidth: "100%", ...fs(13) }}>
                Try: "{p.length > 46 ? p.slice(0, 46) + "…" : p}"
              </button>
            ))}
          </div>

          <button onClick={run} disabled={loading} className={loading ? "thinking" : undefined}
            style={{
              marginTop: 16, width: "100%", border: "none", borderRadius: 12, padding: "14px",
              background: loading ? C.inkSoft : accent, color: "#fff", fontWeight: 700, ...fs(16),
            }}>
            {loading ? "Thinking it through…" : mode === "understand" ? "Understand this" : "Write it for me"}
          </button>

          {err && <p style={{ color: C.clay, marginTop: 12, marginBottom: 0, ...fs(14) }}>{err}</p>}
        </div>

        {result && mode === "understand" && (
          <div className="fade" style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <Card accent={C.sage} label="What they actually mean" fs={fs}>
              <p style={{ margin: 0, lineHeight: 1.65, ...fs(17) }}>{result.plainMeaning}</p>
            </Card>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
              <Card accent={C.clay} label="Tone" fs={fs}>
                <p style={{ margin: 0, lineHeight: 1.5, ...fs(16) }}>{result.tone}</p>
              </Card>
              <Card accent={urgColor(result.urgency)} label="Urgency" fs={fs}>
                <p style={{ margin: "0 0 4px", fontWeight: 700, textTransform: "capitalize", ...fs(16) }}>{result.urgency}</p>
                <p style={{ margin: 0, color: C.inkSoft, lineHeight: 1.5, ...fs(13) }}>{result.urgencyReason}</p>
              </Card>
            </div>
            {result.hiddenExpectations?.length > 0 && (
              <Card accent={C.peri} label="They might be expecting" fs={fs}>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6, ...fs(15) }}>
                  {result.hiddenExpectations.map((h, i) => <li key={i} style={{ marginBottom: 4 }}>{h}</li>)}
                </ul>
              </Card>
            )}
            <Card accent={C.sage} label="A good reply could" fs={fs}>
              <p style={{ margin: 0, lineHeight: 1.65, ...fs(16) }}>{result.replyDirection}</p>
            </Card>
          </div>
        )}

        {result && mode === "compose" && (
          <div className="fade" style={{ marginTop: 18, display: "grid", gap: 12 }}>
            <Card accent={C.peri} label="Here's something you could send" fs={fs}>
              <p style={{ margin: 0, lineHeight: 1.7, whiteSpace: "pre-wrap", ...fs(17) }}>{result.draft}</p>
              <button onClick={() => navigator.clipboard?.writeText(result.draft)}
                style={{ marginTop: 14, border: `1px solid ${C.line}`, background: "#fff", color: C.peri, borderRadius: 10, padding: "8px 14px", fontWeight: 700, ...fs(14) }}>
                Copy
              </button>
            </Card>
            {result.whatChanged?.length > 0 && (
              <Card accent={C.clay} label="What I did, so you can decide" fs={fs}>
                <ul style={{ margin: 0, paddingLeft: 20, lineHeight: 1.6, ...fs(15) }}>
                  {result.whatChanged.map((w, i) => <li key={i} style={{ marginBottom: 4 }}>{w}</li>)}
                </ul>
              </Card>
            )}
          </div>
        )}

        <p style={{ textAlign: "center", color: C.inkSoft, marginTop: 40, lineHeight: 1.6, ...fs(13) }}>
          Plainly gives suggestions, not rules. You always decide what to send.
        </p>
      </div>
    </div>
  );
}

const btnRound = {
  width: 28, height: 28, borderRadius: 8, border: `1px solid ${C.line}`,
  background: "#fff", color: C.ink, fontWeight: 700, lineHeight: 1,
};

function urgColor(u) {
  if (u === "high") return "#C56A6A";
  if (u === "medium") return "#C98A5E";
  return "#5E8B73";
}

function Card({ accent, label, children, fs }) {
  return (
    <div style={{ background: C.paper, border: `1px solid ${C.line}`, borderLeft: `4px solid ${accent}`, borderRadius: 14, padding: 16 }}>
      <div style={{ fontFamily: "Lexend, sans-serif", color: accent, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8, ...fs(12) }}>
        {label}
      </div>
      {children}
    </div>
  );
}
