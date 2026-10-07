export const toNum = (v) => {
  if (typeof v === 'number' && Number.isFinite(v)) return v;
  if (typeof v === 'string' && v.trim()) {
    const n = Number(v.replace(/,/g, ''));
    if (Number.isFinite(n)) return n;
  }
  return null;
};

export const fmt = (n) => Number(n).toLocaleString(undefined, { maximumFractionDigits: 5 });

// Turns the AI reply into a list of price levels, with each target measured in R
// (R = the distance you risk, from entry to stop).
export function buildLevels(r) {
  const entry = toNum(r.entry?.price);
  const stop = toNum(r.stop_loss?.price);
  const risk = entry != null && stop != null && entry !== stop ? Math.abs(entry - stop) : null;
  const rows = [];
  const push = (p, kind, name, note, mult) => {
    const n = toNum(p);
    if (n != null) rows.push({ p: n, kind, name, note: note || '', r: mult ?? null });
  };
  push(r.entry?.price, 'entry', 'Entry', r.entry?.trigger);
  push(r.stop_loss?.price, 'stop', 'Stop', r.stop_loss?.reason);
  (r.take_profits || []).slice(0, 4).forEach((t, i) => {
    const p = toNum(t?.price);
    push(p, 'tp', `Target ${i + 1}`, t?.note, risk != null && entry != null && p != null ? Math.abs(p - entry) / risk : null);
  });
  (r.key_levels || []).slice(0, 4).forEach((k) => {
    push(k?.price, 'key', k?.kind === 'support' ? 'Support' : 'Resistance', k?.note);
  });
  return rows;
}

export function layoutLevels(r) {
  const rows = buildLevels(r);
  if (rows.length < 2) return null;
  rows.sort((a, b) => b.p - a.p);
  const hi = rows[0].p;
  const lo = rows[rows.length - 1].p;
  const span = hi - lo || 1;
  const GAP = 52;
  const usable = Math.max(180, (rows.length - 1) * GAP);
  let prev = -Infinity;
  for (const l of rows) {
    l.y = Math.max(26 + ((hi - l.p) / span) * usable, prev + GAP);
    prev = l.y;
  }
  const height = prev + 34;
  const entry = rows.find((x) => x.kind === 'entry');
  const stop = rows.find((x) => x.kind === 'stop');
  const tps = rows.filter((x) => x.kind === 'tp');
  const band = (a, b) => ({ top: Math.min(a.y, b.y), h: Math.abs(a.y - b.y) });
  let risk = null;
  let reward = null;
  if (entry && stop) risk = band(entry, stop);
  if (entry && tps.length) {
    const far = tps.reduce((m, t) => (Math.abs(t.y - entry.y) > Math.abs(m.y - entry.y) ? t : m));
    reward = band(entry, far);
  }
  return { rows, height, risk, reward, hasR: tps.some((t) => t.r != null) };
}

// Catches replies where the levels contradict the direction (for example a long with the stop above the entry).
export function levelIssues(r) {
  const issues = [];
  if (r.bias !== 'long' && r.bias !== 'short') return issues;
  const dir = r.bias === 'long' ? 1 : -1;
  const word = r.bias === 'long' ? 'buy' : 'sell';
  const e = toNum(r.entry?.price);
  const s = toNum(r.stop_loss?.price);
  const tps = (r.take_profits || []).map((t) => toNum(t?.price)).filter((x) => x != null);
  if (e != null && s != null && (e - s) * dir <= 0) {
    issues.push(`For a ${word}, the stop should be ${dir === 1 ? 'below' : 'above'} the entry.`);
  }
  if (e != null && tps.some((t) => (t - e) * dir <= 0)) {
    issues.push(`For a ${word}, targets should be ${dir === 1 ? 'above' : 'below'} the entry.`);
  }
  return issues;
}
