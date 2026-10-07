
function Seg({ label, value, options, onChange }) {
  return (
    <div className="seg" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} role="radio" aria-checked={value === o.value} className={value === o.value ? 'on' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

export default function Settings({ settings, update, install, count, onWipe, onLogout }) {
  return (
    <div>
      <h2 className="h2 first">Settings</h2>

      <section className="panel stack">
        <div>
          <div className="lbl">Appearance</div>
          <Seg
            label="Theme"
            value={settings.theme}
            onChange={(v) => update({ theme: v })}
            options={[
              { value: 'auto', label: 'Auto' },
              { value: 'dark', label: 'Dark' },
              { value: 'light', label: 'Light' },
            ]}
          />
        </div>
        {install.canInstall && (
          <button className="btn" onClick={install.install}>
            Install Nitrix AI Trader on this phone
          </button>
        )}
      </section>

      <section className="panel stack">
        <div>
          <div className="lbl">Saved data</div>
          <p className="hint">
            {count} {count === 1 ? 'analysis' : 'analyses'} saved on this device, with their screenshots.
          </p>
        </div>
        <button
          className="btn danger"
          disabled={count === 0}
          onClick={() => {
            if (window.confirm('Delete every saved analysis on this device? This cannot be undone.')) onWipe();
          }}
        >
          Delete all analyses
        </button>
      </section>

      <section className="panel stack">
        <button className="btn" onClick={onLogout}>
          Lock app
        </button>
      </section>

      <p className="foot">
        Nitrix AI Trader 1.0. Chart analysis for education, not financial advice.
      </p>
    </div>
  );
}
