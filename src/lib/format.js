import { fmt, toNum } from './levels.js';

export function when(ts) {
  return new Date(ts).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export function planText(rec) {
  const r = rec.result || {};
  const verdict = { long: 'BUY (long)', short: 'SELL (short)', no_trade: 'WAIT (no trade)' }[r.bias] || 'WAIT (no trade)';
  const name = [r.instrument, r.timeframe].filter(Boolean).join(' ');
  const lines = [`Nitrix AI Trader: ${name ? name + ' - ' : ''}${verdict}`];
  const line = (label, price, note) => {
    const p = toNum(price);
    if (p != null || note) lines.push(`${label}: ${p != null ? fmt(p) : '-'}${note ? ' (' + note + ')' : ''}`);
  };
  line('Entry', r.entry?.price, r.entry?.trigger);
  line('Stop', r.stop_loss?.price, r.stop_loss?.reason);
  (r.take_profits || []).forEach((t, i) => line(`Target ${i + 1}`, t?.price, t?.note));
  if (r.invalidation) lines.push(`Wrong if: ${r.invalidation}`);
  if (r.simple_explanation) lines.push(`In simple words: ${r.simple_explanation}`);
  lines.push('Not financial advice.');
  return lines.join('\n');
}
