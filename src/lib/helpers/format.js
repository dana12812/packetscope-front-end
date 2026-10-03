// Display helpers shared by the dashboard and capture detail pages.

// Protocol keys come from lib/pcap_parser.py on the back end.
// Order is fixed (never re-sorted by count) so a protocol keeps its color everywhere.
const PROTOCOLS = [
  { key: 'tcp', label: 'TCP', color: 'var(--proto-tcp)' },
  { key: 'udp', label: 'UDP', color: 'var(--proto-udp)' },
  { key: 'icmp', label: 'ICMP', color: 'var(--proto-icmp)' },
  { key: 'arp', label: 'ARP', color: 'var(--proto-arp)' },
  { key: 'other', label: 'Other', color: 'var(--proto-other)' },
];

// Turns a { tcp: 10, udp: 3 } map into ordered slices with percentages.
export function protocolSlices(counts = {}) {
  const known = PROTOCOLS.map((p) => p.key);
  const merged = { ...counts };
  // Any protocol key the parser adds later folds into "Other"
  Object.keys(counts).forEach((key) => {
    if (!known.includes(key)) {
      merged.other = (merged.other || 0) + counts[key];
      delete merged[key];
    }
  });
  const total = Object.values(merged).reduce((sum, n) => sum + n, 0);
  return PROTOCOLS
    .filter((p) => merged[p.key] > 0)
    .map((p) => ({ ...p, count: merged[p.key], pct: total ? (merged[p.key] / total) * 100 : 0 }));
}

export function sumProtocols(captures) {
  return captures.reduce((totals, capture) => {
    Object.entries(capture.summary?.protocols || {}).forEach(([key, n]) => {
      totals[key] = (totals[key] || 0) + n;
    });
    return totals;
  }, {});
}

export const formatNumber = (n) => (n ?? 0).toLocaleString();

export function formatPct(pct) {
  if (pct > 0 && pct < 1) return '<1%';
  return `${Math.round(pct)}%`;
}

export function formatDuration(seconds) {
  if (seconds === null || seconds === undefined) return '—';
  if (seconds < 60) return `${Number(seconds.toFixed(2))}s`;
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  return `${m}m ${s}s`;
}

export function formatBytes(bytes) {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  return `${Number((bytes / 1024 ** i).toFixed(1))} ${units[i]}`;
}

// "2:14 PM" today, "Yesterday", otherwise "28 Sep 2026"
export function formatWhen(iso) {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  const dayDiff = Math.round((startOfDay(now) - startOfDay(date)) / 86400000);
  if (dayDiff === 0) return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  if (dayDiff === 1) return 'Yesterday';
  return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
}

// Purely decorative file-icon tint, stable per capture
const FILE_TINTS = ['blue', 'purple', 'aqua', 'yellow', 'pink'];
export const fileTint = (id) => FILE_TINTS[id % FILE_TINTS.length];

// Activity log actions (see lib/activity.py on the back end) → readable verbs and an icon tone
const ACTIVITY = {
  'user.registered': { verb: 'created an account', icon: 'shield', tone: 'aqua' },
  'user.signed_in': { verb: 'signed in', icon: 'lock', tone: 'blue' },
  'user.role_changed': { verb: 'changed a role:', icon: 'shield', tone: 'purple' },
  'user.deleted': { verb: 'deleted user', icon: 'trash', tone: 'pink' },
  'capture.uploaded': { verb: 'uploaded', icon: 'cloudUpload', tone: 'aqua' },
  'capture.renamed': { verb: 'renamed', icon: 'edit', tone: 'yellow' },
  'capture.tags_changed': { verb: 'updated tags on', icon: 'tag', tone: 'yellow' },
  'capture.deleted': { verb: 'deleted', icon: 'trash', tone: 'pink' },
  'note.added': { verb: 'added a note on', icon: 'note', tone: 'purple' },
  'note.edited': { verb: 'edited a note on', icon: 'note', tone: 'purple' },
  'note.deleted': { verb: 'deleted a note on', icon: 'note', tone: 'pink' },
  'tag.created': { verb: 'created tag', icon: 'tag', tone: 'aqua' },
  'tag.renamed': { verb: 'renamed tag', icon: 'tag', tone: 'yellow' },
  'tag.deleted': { verb: 'deleted tag', icon: 'tag', tone: 'pink' },
};

// Preset tag colours with spoken names (any hex from the colour picker also works)
export const TAG_COLORS = [
  { name: 'Aqua', hex: '#16C7C7' },
  { name: 'Blue', hex: '#4A90E2' },
  { name: 'Purple', hex: '#6C5CE7' },
  { name: 'Pink', hex: '#E34D8C' },
  { name: 'Yellow', hex: '#F4A62A' },
  { name: 'Green', hex: '#20B26B' },
];

export const describeActivity = (action) => ACTIVITY[action] || { verb: action, icon: 'activity', tone: 'blue' };

// Date + time, used where the exact moment matters (activity log, notes)
export function formatDateTime(iso) {
  if (!iso) return '';
  return new Date(iso).toLocaleString([], { day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
}
