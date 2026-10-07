import { useMemo } from 'react';
import { fmt, layoutLevels } from '../lib/levels.js';

export default function Ladder({ result }) {
  const built = useMemo(() => layoutLevels(result), [result]);
  if (!built) return null;
  const { rows, height, risk, reward, hasR } = built;

  return (
    <div className="ladder-wrap">
      <div className="ladder" style={{ height }} role="list" aria-label="Price levels from highest to lowest">
        {risk && <span className="rail risk" style={{ top: risk.top, height: risk.h }} />}
        {reward && <span className="rail reward" style={{ top: reward.top, height: reward.h }} />}
        {rows.map((l, i) => (
          <div key={`${l.name}-${i}`} className={`lv ${l.kind}`} style={{ top: l.y }} role="listitem">
            <span className="price">{fmt(l.p)}</span>
            <span className="dot" />
            <span className="txt">
              <span className="nm">
                {l.name}
                {l.r != null && <span className="rr">{l.r.toFixed(1)}R</span>}
              </span>
              {l.note && <span className="nt">{l.note}</span>}
            </span>
          </div>
        ))}
      </div>
      {hasR && <p className="legend">1R is the amount you risk, from entry to stop. A 2R target pays twice that.</p>}
    </div>
  );
}
