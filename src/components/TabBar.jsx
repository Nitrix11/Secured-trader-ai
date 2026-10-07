import { ClockIcon, GearIcon, ScanIcon } from './Icons.jsx';

const TABS = [
  { id: 'analyze', label: 'Analyze', Icon: ScanIcon },
  { id: 'history', label: 'History', Icon: ClockIcon },
  { id: 'settings', label: 'Settings', Icon: GearIcon },
];

export default function TabBar({ tab, onChange, busy }) {
  return (
    <nav className="tabbar" aria-label="Main">
      <div className="tabs">
        {TABS.map(({ id, label, Icon }) => (
          <button
            key={id}
            className={tab === id ? 'tab on' : 'tab'}
            aria-current={tab === id ? 'page' : undefined}
            onClick={() => onChange(id)}
          >
            <Icon />
            <span>{label}</span>
            {id === 'analyze' && busy && <i className="pip" role="img" aria-label="Analysis running" />}
          </button>
        ))}
      </div>
    </nav>
  );
}
