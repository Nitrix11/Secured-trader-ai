import { useState } from 'react';
import { Logo } from '../components/Icons.jsx';
import { login, setPassword } from '../lib/auth.js';

export default function Login({ onDone }) {
  const [pw, setPw] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  const submit = async (e) => {
    e.preventDefault();
    if (!pw || busy) return;
    setBusy(true);
    setErr('');
    const r = await login(pw);
    setBusy(false);
    if (r.ok) {
      setPassword(pw);
      onDone();
    } else {
      setErr(r.message);
    }
  };

  return (
    <div className="app">
      <header className="topbar">
        <Logo />
        <h1>Nitrix AI Trader</h1>
      </header>
      <main className="main">
        <form className="panel stack" onSubmit={submit}>
          <label className="field">
            Password
            <input type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" autoFocus placeholder="Enter the app password" />
          </label>
          {err && <p className="hint err">{err}</p>}
          <button className="btn primary block" type="submit" disabled={!pw || busy}>
            {busy ? 'Checking' : 'Unlock'}
          </button>
        </form>
      </main>
    </div>
  );
}
