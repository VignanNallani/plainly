# Plainly

A calm communication aid that helps neurodiverse people **understand** messages they
receive and **compose** clear ones to send. Built for the "AI That Actually Helps People"
track — accessibility-first, low-sensory by design.

---

## Why it's built the way it is (so you can defend every choice)

- **Two real jobs, one calm surface.** Decoding hidden subtext and composing clearly are
  two of the most-cited communication challenges for autistic adults. Plainly does exactly
  those two, and nothing else — focus beats feature-sprawl in a demo.
- **The design *is* the accessibility claim.** Low-saturation palette, generous spacing, a
  built-in text-size control, visible keyboard focus, and `prefers-reduced-motion` support.
  Nothing flashes or shouts.
- **Typography is a deliberate, defensible choice.** Body/UI is **Atkinson Hyperlegible**
  (built by the Braille Institute for low-vision readability); headings are **Lexend**
  (designed to reduce reading effort). The fonts aren't decoration — they're the thesis.
- **The API key never touches the browser.** A serverless function (`api/chat.js`) proxies
  to Groq, reading `GROQ_API_KEY` from a server-side env var. The front end only ever calls
  your own `/api/chat`.
- **Model is swappable.** Groq deprecated `llama-3.3-70b-versatile` on 2026-06-17, so the
  default is `openai/gpt-oss-120b` (current production model, native JSON mode). Change
  `GROQ_MODEL` to swap — no code edit.

## Architecture (30-second version)

```
Browser (React)  ──POST /api/chat──►  Vercel serverless function  ──►  Groq (gpt-oss-120b)
   App.jsx                                api/chat.js                    JSON mode on
   renders calm cards   ◄──── { content: "<json>" } ────┘
```

The serverless function forces `response_format: { type: "json_object" }`, so the model
returns structured JSON the UI maps straight onto cards. No parsing guesswork.

---

## Run locally

```bash
npm install
cp .env.example .env        # then paste your real Groq key into .env
```

Vite's dev server alone won't run the `/api` function. Two options:

- **Easiest:** install the Vercel CLI and run the whole thing (UI + function) together:
  ```bash
  npm i -g vercel
  vercel dev
  ```
- Or just deploy (below) and test on the live URL.

## Deploy to Vercel (the fast path — ~4 minutes)

1. Push this folder to a new GitHub repo.
2. Go to **vercel.com → Add New → Project → import the repo.**
3. Vercel auto-detects Vite. Leave build settings as-is.
4. Open **Settings → Environment Variables** and add:
   - `GROQ_API_KEY` = your key from https://console.groq.com/keys
   - `GROQ_MODEL` = `openai/gpt-oss-120b` (optional)
5. **Deploy.** You'll get a public `https://plainly-xxxx.vercel.app` URL — that's your
   submission link.

> Get the free Groq key first (no card needed): https://console.groq.com/keys

## What to submit on Devpost

- The live Vercel URL
- This repo link
- A 60-second demo video (script provided separately)
- The project write-up (provided separately)
