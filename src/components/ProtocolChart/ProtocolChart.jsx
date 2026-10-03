import { useState } from 'react';
import { protocolSlices, formatNumber, formatPct } from '../../lib/helpers/format';

// Thin stacked bar showing a capture's protocol mix — the "fingerprint" of the file.
export const ProtocolBar = ({ protocols, className = '' }) => {
  const slices = protocolSlices(protocols);
  if (!slices.length) return null;
  const label = slices.map((s) => `${s.label} ${formatPct(s.pct)}`).join(', ');

  return (
    <div className={`proto-bar ${className}`} role="img" aria-label={`Protocol mix: ${label}`}>
      {slices.map((s) => (
        <span
          key={s.key}
          className="proto-bar-seg"
          style={{ flexGrow: s.count, background: s.color }}
          title={`${s.label} · ${formatNumber(s.count)} packets (${formatPct(s.pct)})`}
        />
      ))}
    </div>
  );
};

const RADIUS = 52;
const STROKE = 16;
const CIRC = 2 * Math.PI * RADIUS;
const GAP = 2.5; // surface gap between segments, in px along the ring

// Donut with a legend; hovering or focusing a legend row (or a segment) reads it out in the centre.
export const ProtocolDonut = ({ protocols }) => {
  const [active, setActive] = useState(null);
  const slices = protocolSlices(protocols);
  const total = slices.reduce((sum, s) => sum + s.count, 0);
  if (!total) return <p className="empty-state">No protocol data yet.</p>;

  const arcs = slices.map((s, i) => {
    const start = slices.slice(0, i).reduce((sum, prev) => sum + (prev.count / total) * CIRC, 0);
    const len = (s.count / total) * CIRC;
    const visible = slices.length > 1 ? Math.max(len - GAP, 0.5) : len;
    return { ...s, dash: `${visible} ${CIRC - visible}`, offset: -start };
  });
  const current = slices.find((s) => s.key === active);

  return (
    <div className="donut">
      <div className="donut-figure">
        <svg viewBox="0 0 140 140" role="img" aria-label={`Protocol breakdown, ${slices.length} protocols`}>
          <circle cx="70" cy="70" r={RADIUS} fill="none" stroke="var(--color-bg-alt)" strokeWidth={STROKE} />
          <g transform="rotate(-90 70 70)">
            {arcs.map((a) => (
              <circle
                key={a.key}
                className={`donut-seg ${active && active !== a.key ? 'is-dim' : ''}`}
                cx="70"
                cy="70"
                r={RADIUS}
                fill="none"
                stroke={a.color}
                strokeWidth={active === a.key ? STROKE + 4 : STROKE}
                strokeDasharray={a.dash}
                strokeDashoffset={a.offset}
                onMouseEnter={() => setActive(a.key)}
                onMouseLeave={() => setActive(null)}
              >
                <title>{`${a.label}: ${formatNumber(a.count)} packets (${formatPct(a.pct)})`}</title>
              </circle>
            ))}
          </g>
        </svg>
        <div className="donut-center" aria-live="polite">
          {current ? (
            <>
              <span className="donut-value">{formatPct(current.pct)}</span>
              <span className="donut-label">{current.label}</span>
            </>
          ) : (
            <>
              <span className="donut-value">{slices.length}</span>
              <span className="donut-label">{slices.length === 1 ? 'Protocol' : 'Protocols'}</span>
            </>
          )}
        </div>
      </div>

      <ul className="legend">
        {slices.map((s) => (
          <li
            key={s.key}
            className={`legend-row ${active === s.key ? 'is-active' : ''}`}
            tabIndex={0}
            onMouseEnter={() => setActive(s.key)}
            onMouseLeave={() => setActive(null)}
            onFocus={() => setActive(s.key)}
            onBlur={() => setActive(null)}
          >
            <span className="legend-swatch" style={{ background: s.color }} aria-hidden="true" />
            <span className="legend-name">{s.label}</span>
            <span className="legend-count">{formatNumber(s.count)}</span>
            <span className="legend-pct">{formatPct(s.pct)}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};
