const base = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  'aria-hidden': true,
};

export const ScanIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M4 8V6a2 2 0 0 1 2-2h2M16 4h2a2 2 0 0 1 2 2v2M20 16v2a2 2 0 0 1-2 2h-2M8 20H6a2 2 0 0 1-2-2v-2" />
    <path d="M8 15l3-4 2 2 3-4" />
  </svg>
);

export const ClockIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 7.5V12l3 2" />
  </svg>
);

export const GearIcon = (p) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 13.5a7.6 7.6 0 0 0 0-3l1.7-1.3-1.7-3-2 .8a7.6 7.6 0 0 0-2.6-1.5L14.5 3h-3.4l-.3 2.5A7.6 7.6 0 0 0 8.2 7l-2-.8-1.7 3 1.7 1.3a7.6 7.6 0 0 0 0 3l-1.7 1.3 1.7 3 2-.8a7.6 7.6 0 0 0 2.6 1.5l.3 2.5h3.4l.3-2.5a7.6 7.6 0 0 0 2.6-1.5l2 .8 1.7-3z" />
  </svg>
);

export const CloseIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M6 6l12 12M18 6L6 18" />
  </svg>
);

export const PlusIcon = (p) => (
  <svg {...base} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);

export const UploadIcon = (p) => (
  <svg {...base} strokeWidth={1.6} {...p}>
    <path d="M12 16V5M7.5 9.5L12 5l4.5 4.5" />
    <path d="M5 14v3a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-3" />
  </svg>
);

export const Logo = ({ size = 32 }) => (
  <svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true">
    <rect width="64" height="64" rx="14" fill="#0F1830" />
    <path d="M19 20v26M32 14v28M45 12v28" stroke="#9AA9CC" strokeWidth="2" strokeLinecap="round" />
    <rect x="15" y="26" width="8" height="15" rx="1.5" fill="#37D39A" />
    <rect x="28" y="20" width="8" height="15" rx="1.5" fill="#FF6F61" />
    <rect x="41" y="17" width="8" height="16" rx="1.5" fill="#37D39A" />
    <path d="M9 31h46" stroke="#F2B84B" strokeWidth="2.4" strokeLinecap="round" />
  </svg>
);
