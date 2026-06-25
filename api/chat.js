// Serverless proxy to Groq's OpenAI-compatible endpoint.
// The GROQ_API_KEY never reaches the browser — it lives only in Vercel env vars.
// Model is env-overridable: set GROQ_MODEL to swap without touching code.

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Use POST." });
  }

  const { system, user } = req.body || {};
  if (!user) {
    return res.status(400).json({ error: "Missing message text." });
  }
  if (!process.env.GROQ_API_KEY) {
    return res.status(500).json({ error: "Server is missing its GROQ_API_KEY." });
  }

  const messages = [];
  if (system) messages.push({ role: "system", content: system });
  messages.push({ role: "user", content: user });

  try {
    const upstream = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
        temperature: 0.4,
        max_tokens: 1000,
        reasoning_effort: "low",
        response_format: { type: "json_object" },
        messages,
      }),
    });

    if (!upstream.ok) {
      const detail = await upstream.text();
      return res.status(502).json({ error: "The AI service returned an error.", detail });
    }

    const data = await upstream.json();
    const content = data.choices?.[0]?.message?.content || "";
    return res.status(200).json({ content });
  } catch (e) {
    return res.status(500).json({ error: "The request could not be completed." });
  }
}
