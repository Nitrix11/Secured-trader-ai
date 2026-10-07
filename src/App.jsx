import { useCallback, useEffect, useMemo, useState } from 'react';
import Analyze from './screens/Analyze.jsx';
import History from './screens/History.jsx';
import Settings from './screens/Settings.jsx';
import TabBar from './components/TabBar.jsx';
import Lightbox from './components/Lightbox.jsx';
import { Logo } from './components/Icons.jsx';
import { useSettings } from './hooks/useSettings.js';
import { useTheme } from './hooks/useTheme.js';
import { useInstall } from './hooks/useInstall.js';
import { SESSION_START, useAnalyses } from './hooks/useAnalyses.js';
import Login from './screens/Login.jsx';
import { clearPassword, getPassword } from './lib/auth.js';
import { useToast } from './toast.jsx';

export default function App() {
  const [tab, setTab] = useState('analyze');
  const [zoom, setZoom] = useState(null);
  const [authed, setAuthed] = useState(() => !!getPassword());
  const [settings, update] = useSettings();
  const install = useInstall();
  const toast = useToast();
  useTheme(settings.theme);

  const { recs, loaded, add, retry, remove, restore, clearAll } = useAnalyses();

  useEffect(() => {
    const out = () => setAuthed(false);
    window.addEventListener('nat:logout', out);
    return () => window.removeEventListener('nat:logout', out);
  }, []);

  const logout = useCallback(() => {
    clearPassword();
    setAuthed(false);
  }, []);

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [tab]);

  const onRemove = useCallback(
    (rec) => {
      remove(rec.id);
      toast('Analysis deleted', { label: 'Undo', onClick: () => restore(rec) });
    },
    [remove, restore, toast]
  );

  const cardProps = useMemo(
    () => ({ onRetry: retry, onRemove, onOpenSettings: () => setTab('settings'), onZoom: setZoom }),
    [retry, onRemove]
  );

  const results = useMemo(() => recs.filter((r) => r.createdAt >= SESSION_START - 1000), [recs]);
  const busy = recs.some((r) => r.status === 'queued' || r.status === 'working');

  if (!authed) return <Login onDone={() => setAuthed(true)} />;

  return (
    <div className="app">
      <header className="topbar">
        <Logo />
        <h1>Nitrix AI Trader</h1>
        {install.canInstall && (
          <button className="btn small" onClick={install.install}>
            Install
          </button>
        )}
      </header>

      <main className="main">
        <div hidden={tab !== 'analyze'}>
          <Analyze
            active={tab === 'analyze'}
            results={results}
            onSubmit={add}
            onOpenSettings={() => setTab('settings')}
            cardProps={cardProps}
          />
        </div>
        {tab === 'history' && <History recs={recs} loaded={loaded} cardProps={cardProps} onGoAnalyze={() => setTab('analyze')} />}
        {tab === 'settings' && <Settings settings={settings} update={update} install={install} count={recs.length} onWipe={clearAll} onLogout={logout} />}
      </main>

      <TabBar tab={tab} onChange={setTab} busy={busy} />
      {zoom && <Lightbox src={zoom} onClose={() => setZoom(null)} />}
    </div>
  );
}
