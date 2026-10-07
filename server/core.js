// Runs on the server only. The API key and password live in environment variables
// (GEMINI_API_KEY, APP_PASSWORD) and are never sent to the browser.
import { createHash, timingSafeEqual } from 'node:crypto';

const MODEL = process.env.GEMINI_MODEL || 'gemini-3.1-flash-lite';
const MAX_IMAGES = 6;

const STYLES = {
  scalp: 'Scalping: very short-term trades with tight stops.',
  day: 'Day trading: positions are closed the same day.',
  swing: 'Swing trading: positions are held for several days.',
};

const SYSTEM = `You are a disciplined technical analyst reading trading chart screenshots.
Read the instrument, timeframe and the price axis from the image. Base every price on what is visible on the price axis, and write prices as plain numbers (no commas, no currency symbols).
If you cannot read the prices reliably, set price fields to null and describe the level in words instead of guessing.
Pick the single best setup. If there is no clean setup, set bias to "no_trade" and explain what you would wait for.
Be specific about the entry trigger (for example "buy on a 15m close above the level" or "limit order at the retest").
For a long, the stop must be below the entry and targets above it. For a short, the stop must be above the entry and targets below it.
Never promise outcomes. Reply with ONLY one JSON object, no markdown, in this shape:
{
 "instrument": string|null, "timeframe": string|null,
 "bias": "long"|"short"|"no_trade", "confidence": number 0-100,
 "summary": string,
 "entry": {"price": number|null, "type": "limit"|"market"|"breakout"|null, "trigger": string},
 "stop_loss": {"price": number|null, "reason": string},
 "take_profits": [{"price": number|null, "note": string}],
 "risk_reward": number|null,
 "key_levels": [{"price": number|null, "kind": "support"|"resistance", "note": string}],
 "reasoning": [string],
 "invalidation": string,
 "warnings": [string],
 "simple_explanation": string
}
For "simple_explanation", explain the trade the way you would to a 7-year-old: 2 to 3 short sentences, everyday words, no trading jargon. It must stay accurate: say where to get in, where to get out if it goes wrong, and where to take profit. If bias is "no_trade", say plainly to wait and what you are waiting for.`;

function buildPrompt(n, note, style) {
  const parts = [
    n > 1
      ? `These ${n} screenshots show the same instrument, probably on different timeframes. Analyze them together as one setup.`
      : 'Analyze this chart screenshot.',
  ];
  if (STYLES[style]) parts.push(`Trading style: ${STYLES[style]}`);
  if (note) parts.push(`Trader notes: ${note}`);
  parts.push('Return the JSON now.');
  return parts.join(' ');
}

const digest = (s) => createHash('sha256').update(String(s)).digest();

function passwordOk(given) {
  const real = process.env.APP_PASSWORD;
  if (!real || typeof given !== 'string') return false;
  return timingSafeEqual(digest(given), digest(real));
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const out = (status, json) => ({ status, json });

export async function handle({ password, body }) {
  if (!process.env.APP_PASSWORD || !process.env.GEMINI_API_KEY) {
    return out(500, { error: 'The server is not set up yet. Add APP_PASSWORD and GEMINI_API_KEY in your host settings.', code: 'SERVER_CONFIG' });
  }
  if (!passwordOk(password)) {
    await sleep(700); // slows down password guessing
    return out(401, { error: 'Wrong password.', code: 'BAD_PASSWORD' });
  }
  if (body?.action === 'login') return out(200, { ok: true });

  const { images, note, style } = body || {};
  if (!Array.isArray(images) || images.length < 1 || images.length > MAX_IMAGES) {
    return out(400, { error: `Send between 1 and ${MAX_IMAGES} screenshots.`, code: 'HTTP' });
  }
  const parts = [];
  for (const d of images) {
    const m = typeof d === 'string' && d.match(/^data:image\/jpeg;base64,([A-Za-z0-9+/=]+)$/);
    if (!m) return out(400, { error: 'One of the screenshots is not a valid image.', code: 'HTTP' });
    parts.push({ inlineData: { mimeType: 'image/jpeg', data: m[1] } });
  }
  const prompt = buildPrompt(images.length, typeof note === 'string' ? note.slice(0, 1000) : '', style);
  parts.push({ text: prompt });

  let res;
  try {
    res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(MODEL)}:generateContent`, {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-goog-api-key': process.env.GEMINI_API_KEY },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM }] },
        contents: [{ role: 'user', parts }],
        generationConfig: { responseMimeType: 'application/json', maxOutputTokens: 4096 },
      }),
    });
  } catch {
    return out(502, { error: 'The server could not reach the AI service. Try again.', code: 'NETWORK' });
  }
  const data = await res.json().catch(() => ({}));
  if (data?.promptFeedback?.blockReason) {
    return out(422, { error: 'The AI blocked this request. Try a different screenshot.', code: 'BLOCKED' });
  }
  if (!res.ok) {
    const code = res.status === 429 ? 429 : 502;
    const msg = res.status === 429
      ? 'Too many requests, or the limit on the key is used up. Wait a minute, then try again.'
      : 'The AI service returned an error. Try again.';
    return out(code, { error: msg, code: 'HTTP' });
  }
  const text = (data.candidates?.[0]?.content?.parts || []).map((p) => p.text || '').join('');
  return out(200, { text });
}
