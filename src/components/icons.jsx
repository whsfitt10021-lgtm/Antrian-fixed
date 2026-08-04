// Kumpulan ikon SVG ringan (garis, stroke-based) — tidak pakai library
// eksternal supaya bundle tetap kecil dan gampang di-tweak.
const base = { width: '1em', height: '1em', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' }

export const Icon = {
  Warehouse: (p) => (<svg {...base} {...p}><path d="M3 21V10.5L12 4l9 6.5V21"/><path d="M8 21v-7h8v7"/><line x1="3" y1="10.5" x2="21" y2="10.5"/></svg>),
  Box: (p) => (<svg {...base} {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>),
  Megaphone: (p) => (<svg {...base} {...p}><path d="M4 10.5A2.5 2.5 0 0 1 6.5 8H9l7.5-4.2v16.4L9 16H6.5A2.5 2.5 0 0 1 4 13.5z"/><path d="M9 16v3.3a1.5 1.5 0 0 0 3 0V17"/><path d="M20 8.3a5 5 0 0 1 0 7.4"/></svg>),
  Loader: (p) => (<svg {...base} {...p}><path d="M12 3a9 9 0 1 0 9 9"/></svg>),
  Hash: (p) => (<svg {...base} {...p}><line x1="5" y1="9" x2="19" y2="9"/><line x1="5" y1="15" x2="19" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/></svg>),
  Package: (p) => (<svg {...base} {...p}><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>),
  Note: (p) => (<svg {...base} {...p}><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><polyline points="14 3 14 8 19 8"/><line x1="8.5" y1="13" x2="15.5" y2="13"/><line x1="8.5" y1="17" x2="13.5" y2="17"/></svg>),
  Clock: (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 13.8"/></svg>),
  Truck: (p) => (<svg {...base} {...p}><rect x="1" y="4" width="14" height="12" rx="1"/><path d="M15 8h4l4 4v4h-8z"/><circle cx="6" cy="18.5" r="2.2"/><circle cx="18" cy="18.5" r="2.2"/></svg>),
  Hourglass: (p) => (<svg {...base} {...p}><path d="M6.5 2.5h11"/><path d="M6.5 21.5h11"/><path d="M7.5 2.5c0 5.7 4.5 6 4.5 9.5s-4.5 3.8-4.5 9.5"/><path d="M16.5 2.5c0 5.7-4.5 6-4.5 9.5s4.5 3.8 4.5 9.5"/></svg>),
  Check: (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9"/><polyline points="8 12.4 10.7 15.2 16 9.4"/></svg>),
  Volume: (p) => (<svg {...base} {...p}><polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5"/><path d="M18.5 5a11 11 0 0 1 0 14"/><path d="M15.3 8.2a6.5 6.5 0 0 1 0 7.6"/></svg>),
  VolumeOff: (p) => (<svg {...base} {...p}><polygon points="11 5 6 9 3 9 3 15 6 15 11 19 11 5"/><line x1="16.5" y1="9" x2="22" y2="15.5"/><line x1="22" y1="9" x2="16.5" y2="15.5"/></svg>),
  Info: (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9"/><line x1="12" y1="16" x2="12" y2="11.3"/><circle cx="12" cy="7.7" r="1" fill="currentColor" stroke="none"/></svg>),
  VideoOff: (p) => (<svg {...base} {...p}><path d="M16.5 8.5 22 5.5v13l-5.5-3"/><rect x="2" y="6" width="14.5" height="12" rx="2"/><line x1="2" y1="4" x2="22" y2="20"/></svg>),
  Dot: (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="6" fill="currentColor" stroke="none"/></svg>),
  Activity: (p) => (<svg {...base} {...p}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>),
  CalendarOff: (p) => (<svg {...base} {...p}><rect x="3" y="5" width="18" height="16" rx="2"/><line x1="3" y1="10" x2="21" y2="10"/><line x1="8" y1="3" x2="8" y2="7"/><line x1="16" y1="3" x2="16" y2="7"/><line x1="7" y1="14" x2="17" y2="19"/><line x1="17" y1="14" x2="7" y2="19"/></svg>),
  AlertTriangle: (p) => (<svg {...base} {...p}><path d="M12 3.5 21.5 20h-19z"/><line x1="12" y1="9.5" x2="12" y2="14"/><circle cx="12" cy="17" r="0.9" fill="currentColor" stroke="none"/></svg>),
  TimerSla: (p) => (<svg {...base} {...p}><circle cx="12" cy="12" r="9"/><polyline points="12 8 12 12 15 14"/></svg>),
  MapPin: (p) => (<svg {...base} {...p}><path d="M20 10.5c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10.5" r="2.7"/></svg>),
  Login: (p) => (<svg {...base} {...p}><path d="M13 4h5a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-5"/><polyline points="9 8 13 12 9 16"/><line x1="13" y1="12" x2="3" y2="12"/></svg>),
  Flag: (p) => (<svg {...base} {...p}><path d="M5 21V4"/><path d="M5 4h13l-3 4.5L18 13H5"/></svg>),
  UserGear: (p) => (<svg {...base} {...p}><circle cx="9" cy="8" r="3.3"/><path d="M3.5 20c.7-3.6 3.2-5.6 5.5-5.6s3.6 1 4.5 2.4"/><circle cx="18" cy="17.5" r="2.6"/><path d="M18 14.6v.8"/><path d="M18 19.5v.8"/><path d="M20.6 16v.05"/><path d="M15.4 19v.05"/><path d="M20.6 19v.05"/><path d="M15.4 16v.05"/></svg>)
}
