import { useState } from 'react';
import ResultCard from '../components/ResultCard.jsx';

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'long', label: 'Buy' },
  { id: 'short', label: 'Sell' },
  { id: 'no_trade', label: 'Wait' },
];

export default function History({ recs, loaded, cardProps, onGoAnalyze }) {
  const [f, setF] = useState('all');
  const count = (id) => (id === 'all' ? recs.length : recs.filter((r) => r.result?.bias === id).length);
  const shown = f === 'all' ? recs : recs.filter((r) => r.result?.bias === f);

  return (
    <div>
      <h2 className="h2 first">History</h2>
      {recs.length > 0 && (
        <div className="chips scroll" role="group" aria-label="Filter analyses">
          {FILTERS.map((x) => (
            <button key={x.id} className="chip" aria-pressed={f === x.id} onClick={() => setF(x.id)}>
              {x.label} {count(x.id)}
            </button>
          ))}
        </div>
      )}

      {!loaded && <p className="muted">Loading your saved analyses</p>}

      {loaded && recs.length === 0 && (
        <div className="empty">
          <p>No analyses yet. Every chart you analyze is saved on this phone, so you can come back to it later.</p>
          <button className="btn primary" onClick={onGoAnalyze}>
            Analyze a chart
          </button>
        </div>
      )}

      {loaded && recs.length > 0 && shown.length === 0 && <p className="muted">Nothing in this filter yet.</p>}

      {shown.map((rec) => (
        <ResultCard key={rec.id} rec={rec} defaultOpen={false} {...cardProps} />
      ))}
    </div>
  );
}
