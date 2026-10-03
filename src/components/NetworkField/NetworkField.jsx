import { useId } from 'react';

// Decorative network graph: nodes pulse and packets travel along the links
const NODES = [
  [80, 120], [230, 60], [360, 170], [520, 90], [640, 220], [780, 120],
  [180, 280], [430, 330], [600, 380], [880, 300], [980, 160], [300, 440],
];
const LINKS = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [0, 6], [6, 2], [2, 7], [7, 8], [8, 4], [5, 10], [4, 9], [9, 10], [6, 11], [11, 7]];
const ACCENTS = ['var(--color-aqua)', 'var(--color-violet)', 'var(--color-blue)', 'var(--color-pink)', 'var(--color-yellow)'];

const NetworkField = ({ quiet = false }) => {
  const uid = useId().replace(/:/g, '');
  return (
  <svg className={`lp-net ${quiet ? 'is-quiet' : ''}`} viewBox="0 0 1060 500" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
    <g className="lp-net-links">
      {LINKS.map(([a, b]) => (
        <path key={`${a}-${b}`} id={`${uid}-${a}-${b}`} d={`M${NODES[a].join(' ')}L${NODES[b].join(' ')}`} />
      ))}
    </g>
    <g className="lp-net-packets">
      {LINKS.filter((_, i) => i % 2 === 0).map(([a, b], i) => (
        <circle key={`p-${a}-${b}`} r="3" fill={ACCENTS[i % ACCENTS.length]}>
          <animateMotion dur={`${4 + (i % 3) * 1.5}s`} begin={`${i * 0.7}s`} repeatCount="indefinite">
            <mpath href={`#${uid}-${a}-${b}`} />
          </animateMotion>
        </circle>
      ))}
    </g>
    <g className="lp-net-nodes">
      {NODES.map(([x, y], i) => (
        <g key={i} style={{ '--delay': `${(i % 5) * 0.8}s` }}>
          <circle className="lp-net-ring" cx={x} cy={y} r="10" stroke={i % 3 === 1 ? 'var(--color-violet)' : 'var(--color-aqua)'} />
          <circle cx={x} cy={y} r={i % 4 === 0 ? 5 : 3.5} fill={i % 3 === 1 ? 'var(--color-violet)' : 'var(--color-aqua)'} />
        </g>
      ))}
    </g>
  </svg>
);
};

export default NetworkField;
