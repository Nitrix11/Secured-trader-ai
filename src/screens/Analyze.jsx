import { useCallback, useEffect, useState } from 'react';
import ResultCard from '../components/ResultCard.jsx';
import { CloseIcon, PlusIcon, UploadIcon } from '../components/Icons.jsx';
import { MAX_TOGETHER, STYLES } from '../lib/ai.js';
import { shrink, uid } from '../lib/image.js';
import { useToast } from '../toast.jsx';

const CTX_KEY = 'nat.context';

function loadCtx() {
  try {
    return JSON.parse(localStorage.getItem(CTX_KEY) || '{}');
  } catch {
    return {};
  }
}

export default function Analyze({ active, results, onSubmit, cardProps }) {
  const saved = loadCtx();
  const [shots, setShots] = useState([]);
  const [style, setStyle] = useState(saved.style || '');
  const [note, setNote] = useState(saved.note || '');
  const [together, setTogether] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [over, setOver] = useState(false);
  const toast = useToast();

  useEffect(() => {
    localStorage.setItem(CTX_KEY, JSON.stringify({ style, note }));
  }, [style, note]);

  const addFiles = useCallback(
    async (fileList) => {
      const files = [...fileList].filter((f) => f.type.startsWith('image/'));
      if (!files.length) {
        toast('Those files are not images');
        return;
      }
      setPreparing(true);
      const out = [];
      for (const f of files) {
        try {
          out.push({ id: uid(), src: await shrink(f) });
        } catch {
          /* skip unreadable files */
        }
      }
      setPreparing(false);
      if (out.length < files.length) toast('Some files could not be read');
      if (out.length) setShots((s) => [...s, ...out]);
    },
    [toast]
  );

  useEffect(() => {
    if (!active) return undefined;
    const onPaste = (e) => {
      const f = e.clipboardData?.files;
      if (f && f.length) addFiles(f);
    };
    document.addEventListener('paste', onPaste);
    return () => document.removeEventListener('paste', onPaste);
  }, [active, addFiles]);

  const n = shots.length;
  const tooMany = together && n > MAX_TOGETHER;
  const canGo = n > 0 && !preparing && !tooMany;
  const label = together && n > 1 ? 'Analyze as one setup' : n > 1 ? `Analyze ${n} charts` : 'Analyze chart';

  const go = () => {
    onSubmit(
      shots.map((s) => s.src),
      { note: note.trim(), style, together: together && n > 1 }
    );
    setShots([]);
    setTogether(false);
  };

  const onFile = (e) => {
    addFiles(e.target.files);
    e.target.value = '';
  };

  const dropProps = {
    onDragOver: (e) => {
      e.preventDefault();
      setOver(true);
    },
    onDragLeave: () => setOver(false),
    onDrop: (e) => {
      e.preventDefault();
      setOver(false);
      addFiles(e.dataTransfer.files);
    },
  };

  return (
    <div>
      <section className="panel">
        {n === 0 ? (
          <label className={over ? 'drop over' : 'drop'} {...dropProps}>
            <input className="sr" type="file" accept="image/*" multiple onChange={onFile} />
            <UploadIcon width={36} height={36} />
            <strong>{preparing ? 'Preparing your screenshots' : 'Add chart screenshots'}</strong>
            <span>Tap to choose, drop files here, or paste. Add as many as you like.</span>
          </label>
        ) : (
          <div className="staged" {...dropProps}>
            {shots.map((s) => (
              <div className="tile" key={s.id}>
                <img src={s.src} alt="Chart ready to analyze" />
                <button className="x" onClick={() => setShots((list) => list.filter((x) => x.id !== s.id))} aria-label="Remove this screenshot">
                  <CloseIcon width={18} height={18} />
                </button>
              </div>
            ))}
            <label className="tile add">
              <input className="sr" type="file" accept="image/*" multiple onChange={onFile} />
              <PlusIcon />
              <span>{preparing ? 'Preparing' : 'Add more'}</span>
            </label>
          </div>
        )}

        <div className="ctx">
          <div className="lbl" id="style-label">
            Your trading style
          </div>
          <div className="chips" role="group" aria-labelledby="style-label">
            {STYLES.map((s) => (
              <button key={s.id} className="chip" aria-pressed={style === s.id} onClick={() => setStyle(style === s.id ? '' : s.id)} title={s.hint}>
                {s.label}
              </button>
            ))}
          </div>

          <label className="field">
            Notes for the AI (optional)
            <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={2} placeholder="Example: Gold, risk 1% per trade, avoid news" />
          </label>

          {n > 1 && (
            <label className="switch">
              <input type="checkbox" checked={together} onChange={(e) => setTogether(e.target.checked)} />
              <span>Treat these as one setup, for example 4h and 15m of the same pair</span>
            </label>
          )}
          {tooMany && <p className="hint err">Up to {MAX_TOGETHER} screenshots can be analyzed as one setup. Remove some or turn this off.</p>}
        </div>

        <button className="btn primary block" disabled={!canGo} onClick={go}>
          {label}
        </button>
      </section>

      {results.length > 0 && (
        <>
          <h2 className="h2">Results</h2>
          {results.map((rec) => (
            <ResultCard key={rec.id} rec={rec} defaultOpen {...cardProps} />
          ))}
        </>
      )}

      <p className="foot">Educational chart analysis, not financial advice. The AI can misread a chart or its price axis, so check every level yourself and size your risk before you enter.</p>
    </div>
  );
}
