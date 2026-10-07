import { clearPassword, getPassword } from './auth.js';

export const MAX_TOGETHER = 6;

export const STYLES = [
  { id: 'scalp', label: 'Scalp', hint: 'Trades last minutes', text: 'Scalping: very short-term trades with tight stops.' },
  { id: 'day', label: 'Day trade', hint: 'Closed the same day', text: 'Day trading: positions are closed the same day.' },
  { id: 'swing', label: 'Swing', hint: 'Held for days', text: 'Swing trading: positions are held for several days.' },
];

export class AIError extends Error {
  constructor(message, code) {
    super(message);
    this.code = code;
  }
}

function parseResult(text) {
  const m = text.match(/\{[\s\S]*\}/);
  if (!m) throw new AIError('The analyst did not return a readable result. Tap Analyze again.', 'PARSE');
  let out;
  try {
    out = JSON.parse(m[0]);
  } catch {
    throw new AIError('The analyst reply was cut off. Tap Analyze again.', 'PARSE');
  }
  if (!['long', 'short', 'no_trade'].includes(out.bias)) out.bias = 'no_trade';
  return out;
}

// The browser only talks to our own server. The API key never reaches the browser.
export async function analyzeImages({ images, note, style }) {
  let res;
  try {
    res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-app-password': getPassword() },
      body: JSON.stringify({ images, note, style }),
    });
  } catch {
    throw new AIError('Could not reach the server. Check your internet connection and try again.', 'NETWORK');
  }
  const data = await res.json().catch(() => ({}));
  if (res.status === 401) {
    clearPassword();
    window.dispatchEvent(new Event('nat:logout'));
    throw new AIError('Please sign in again.', 'BAD_PASSWORD');
  }
  if (res.status === 413) throw new AIError('The screenshots are too large. Try fewer or smaller ones.', 'HTTP');
  if (!res.ok) throw new AIError(data.error || `The server returned an error (${res.status}).`, data.code || 'HTTP');
  return parseResult(data.text || '');
}
