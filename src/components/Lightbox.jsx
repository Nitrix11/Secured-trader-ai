import { useEffect, useState } from 'react';

export default function Lightbox({ src, onClose }) {
  const [big, setBig] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="lightbox" role="dialog" aria-modal="true" aria-label="Screenshot">
      <div className="lb-scroll" onClick={onClose}>
        <img
          src={src}
          alt="Chart screenshot"
          className={big ? 'big' : ''}
          onClick={(e) => {
            e.stopPropagation();
            setBig((b) => !b);
          }}
        />
      </div>
      <p className="lb-hint">Tap the chart to {big ? 'fit it to the screen' : 'zoom in'}</p>
      <button className="btn lb-close" onClick={onClose}>
        Close
      </button>
    </div>
  );
}
