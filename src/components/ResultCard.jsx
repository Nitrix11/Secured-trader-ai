import { useState } from 'react';
import Ladder from './Ladder.jsx';
import { fmt, levelIssues, toNum } from '../lib/levels.js';
import { planText, when } from '../lib/format.js';
import { useToast } from '../toast.jsx';

const VERDICT = {
  long: { word: 'Buy', sub: 'long', color: 'var(--long)' },
  short: { word: 'Sell', sub: 'short', color: 'var(--short)' },
  no_trade: { word: 'Wait', sub: 'no trade', color: 'var(--muted)' },
};

function Quick({ r }) {
  const items = [
    ['Entry', toNum(r.entry?.price)],
    ['Stop', toNum(r.stop_loss?.price)],
    ['Target', toNum(r.take_profits?.[0]?.price)],
  ].filter(([, v]) => v != null);
  if (!items.length) return null;
  return (
    <div className="quick">
      {items.map(([k, v]) => (
        <div key={k}>
          <span>{k}</span>
          <b>{fmt(v)}</b>
        </div>
      ))}
    </div>
  );
}

function Detail({ r }) {
  const issues = levelIssues(r);
  const warnings = Array.isArray(r.warnings) ? r.warnings.filter(Boolean) : [];
  const reasons = Array.isArray(r.reasoning) ? r.reasoning.filter(Boolean) : [];
  return (
    <div className="detail">
      {r.summary && <p className="summary">{r.summary}</p>}
      {issues.length > 0 && (
        <div className="callout warn">
          <b>Check these levels before you trade</b>
          <ul>
            {issues.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </div>
      )}
      <Ladder result={r} />
      {(r.entry?.trigger || r.entry?.type) && (
        <section>
          <h3>How to enter{r.entry.type ? ` (${r.entry.type})` : ''}</h3>
          <p>{r.entry.trigger}</p>
        </section>
      )}
      {r.stop_loss?.reason && (
        <section>
          <h3>Why the stop goes there</h3>
          <p>{r.stop_loss.reason}</p>
        </section>
      )}
      {r.invalidation && (
        <section>
          <h3>You are wrong if</h3>
          <p>{r.invalidation}</p>
        </section>
      )}
      {reasons.length > 0 && (
        <details>
          <summary>Why this setup</summary>
          <ul>
            {reasons.map((t, i) => (
              <li key={i}>{t}</li>
            ))}
          </ul>
        </details>
      )}
      {warnings.length > 0 && <div className="callout warn">{warnings.join(' ')}</div>}
      {r.simple_explanation && (
        <div className="kid">
          <h3>In simple words</h3>
          <p>{r.simple_explanation}</p>
        </div>
      )}
    </div>
  );
}

export default function ResultCard({ rec, defaultOpen = true, onRetry, onRemove, onZoom }) {
  const [open, setOpen] = useState(defaultOpen);
  const toast = useToast();
  const busy = rec.status === 'queued' || rec.status === 'working';
  const r = rec.result;
  const done = rec.status === 'done' && r;
  const v = VERDICT[r?.bias] || VERDICT.no_trade;
  const c = toNum(r?.confidence);
  const conf = c == null ? null : Math.round(Math.min(100, Math.max(0, c)));
  const canShare = typeof navigator !== 'undefined' && !!navigator.share;

  const share = async () => {
    const text = planText(rec);
    try {
      if (canShare) {
        await navigator.share({ title: 'Nitrix AI Trader', text });
        return;
      }
      await navigator.clipboard.writeText(text);
      toast('Plan copied');
    } catch (e) {
      if (e?.name !== 'AbortError') toast('Could not share the plan');
    }
  };

  return (
    <article className="result">
      <div className={done && !open ? 'thumbs small' : 'thumbs'}>
        {rec.images.map((src, i) => (
          <button key={i} className="thumb" onClick={() => onZoom(src)} aria-label={`View screenshot ${i + 1} full size`}>
            <img src={src} alt="" />
          </button>
        ))}
      </div>

      {busy && (
        <div className="pad" aria-live="polite">
          <p className="working">{rec.status === 'queued' ? 'Waiting in line' : 'Reading the chart'}</p>
          <div className="skeleton" />
          <div className="skeleton short" />
        </div>
      )}

      {rec.status === 'error' && (
        <div className="pad">
          <p className="errtext">{rec.error}</p>
        </div>
      )}

      {done && (
        <>
          <div className="verdict" style={{ '--c': v.color }}>
            <div className="vword">
              <strong>{v.word}</strong>
              <span>{v.sub}</span>
            </div>
            <div className="vmeta">
              <div className="pair">{[r.instrument, r.timeframe].filter(Boolean).join(' on ') || 'Instrument not read'}</div>
              <div className="when">{when(rec.createdAt)}</div>
            </div>
            {conf != null && (
              <div className="conf">
                <div className="meter" role="meter" aria-label="Confidence" aria-valuemin={0} aria-valuemax={100} aria-valuenow={conf}>
                  <i style={{ width: `${conf}%` }} />
                </div>
                <span>{conf}% confident</span>
              </div>
            )}
          </div>
          {open ? <Detail r={r} /> : <Quick r={r} />}
        </>
      )}

      <div className="actions">
        {done && (
          <button className="btn small" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
            {open ? 'Hide details' : 'Show details'}
          </button>
        )}
        {!busy && (
          <button className="btn small" onClick={() => onRetry(rec.id)}>
            Analyze again
          </button>
        )}
        {done && (
          <button className="btn small" onClick={share}>
            {canShare ? 'Share plan' : 'Copy plan'}
          </button>
        )}
        {!busy && (
          <button className="btn small danger" onClick={() => onRemove(rec)}>
            Delete
          </button>
        )}
      </div>
    </article>
  );
}
