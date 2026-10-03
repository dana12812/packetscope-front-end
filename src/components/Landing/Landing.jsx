import { Link } from 'react-router';
import Icon from '../Icon/Icon';
import { Logo } from '../Sidebar/Sidebar';
import { ProtocolBar, ProtocolDonut } from '../ProtocolChart/ProtocolChart';
import { protocolSlices, formatPct } from '../../lib/helpers/format';
import NetworkField from '../NetworkField/NetworkField';
import './Landing.css';

// Illustrative capture used by every preview on this page — shaped like a real
// parse_pcap() summary so the previews render through the same components as the app.
const SAMPLE = {
  filename: 'home-browsing.pcap',
  packets: 235,
  duration: '88.92s',
  size: '41.2 KB',
  protocols: { tcp: 200, udp: 25, icmp: 10 },
  sources: [['10.0.0.4', 135], ['142.250.72.14', 55], ['192.168.1.1', 25]],
  services: [['https', 150], ['dns', 25], ['http', 20]],
};
const SAMPLE_SLICES = protocolSlices(SAMPLE.protocols);

const FEATURES = [
  { icon: 'cloudUpload', tone: 'aqua', title: 'PCAP analysis', text: 'Upload .pcap and .pcapng captures and get a structured summary of every packet inside.' },
  { icon: 'pieChart', tone: 'blue', title: 'Protocol breakdown', text: 'See the TCP, UDP, ICMP and ARP mix of a capture at a glance.' },
  { icon: 'network', tone: 'purple', title: 'Sources & destinations', text: 'Find the IP addresses that send and receive the most traffic.' },
  { icon: 'server', tone: 'pink', title: 'Services by port', text: 'Map destination ports to services like HTTPS, DNS and SSH.' },
  { icon: 'history', tone: 'yellow', title: 'Capture history', text: 'Every analysis is saved to your account, ready to reopen and compare.' },
  { icon: 'tag', tone: 'aqua', title: 'Tags & notes', text: 'Label captures and write down what you found while you investigate.' },
];

const STEPS = [
  { icon: 'cloudUpload', title: 'Upload', text: 'Drop in a .pcap or .pcapng file.' },
  { icon: 'cpu', title: 'Analyze', text: 'Scapy reads every packet in the capture.' },
  { icon: 'layers', title: 'Extract', text: 'Protocols, ports, top talkers and packet sizes.' },
  { icon: 'pieChart', title: 'Visualize', text: 'Results become charts and ranked lists.' },
  { icon: 'search', title: 'Investigate', text: 'Tag, annotate and revisit any capture.' },
];

const CAPABILITIES = [
  { value: '.pcap · .pcapng', label: 'Supported formats' },
  { value: 'Scapy', label: 'Packet parsing engine' },
  { value: 'TCP · UDP · ICMP · ARP', label: 'Protocols classified' },
  { value: 'IPv4 · IPv6', label: 'Source & destination tracking' },
];

const STACK = [
  { name: 'React', role: 'Interface' },
  { name: 'Vite', role: 'Front-end tooling' },
  { name: 'Python', role: 'Analysis' },
  { name: 'FastAPI', role: 'REST API' },
  { name: 'Scapy', role: 'Packet processing' },
  { name: 'PostgreSQL', role: 'Data storage' },
];

const Landing = () => {
  return (
    <main className="landing">
      {/* ---------- Hero ---------- */}
      <section className="lp-hero" aria-labelledby="hero-title">
        <NetworkField />
        <div className="lp-wrap lp-hero-grid">
          <div className="lp-hero-copy">
            <p className="lp-eyebrow"><Icon name="shield" size={16} />Packet capture analysis</p>
            <h1 id="hero-title">Turn packet captures into <span>network intelligence</span></h1>
            <p className="lp-lede">
              Analyze .pcap and .pcapng files, see which protocols and hosts are talking,
              and keep every investigation in one place.
            </p>
            <div className="lp-cta-row">
              <Link className="lp-btn lp-btn-primary" to="/sign-up">Analyze a PCAP <Icon name="arrowRight" size={18} /></Link>
              <a className="lp-btn lp-btn-glass" href="#how-it-works">See how it works</a>
            </div>
            <p className="lp-fineprint"><Icon name="lock" size={14} />Free account · only you and your workspace admins can see your captures</p>
          </div>

          <div className="lp-hero-visual">
            <BrowserFrame label="Sample capture">
              <MiniDashboard />
            </BrowserFrame>
            <div className="lp-float lp-float-capture" aria-hidden="true">
              <span className="lp-float-kicker">Capture analyzed</span>
              <strong>{SAMPLE.packets} packets</strong>
              <span>{SAMPLE.duration} of traffic</span>
            </div>
            <div className="lp-float lp-float-protocols" aria-hidden="true">
              {SAMPLE_SLICES.map((s) => (
                <span key={s.key} className="lp-float-row">
                  <i style={{ background: s.color }} />{s.label}<b>{formatPct(s.pct)}</b>
                </span>
              ))}
            </div>
            <div className="lp-float lp-float-status" aria-hidden="true">
              <span className="lp-live-dot" />Analysis complete
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Capabilities ---------- */}
      <section className="lp-caps" aria-label="Capabilities">
        <div className="lp-wrap lp-caps-grid">
          {CAPABILITIES.map((c) => (
            <div key={c.label} className="lp-cap">
              <span className="lp-cap-value">{c.value}</span>
              <span className="lp-cap-label">{c.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ---------- PCAP → insights ---------- */}
      <section className="lp-section" id="how-it-works" aria-labelledby="how-title">
        <div className="lp-wrap">
          <header className="lp-section-head">
            <p className="lp-kicker">How it works</p>
            <h2 id="how-title">From raw packets to clear insights</h2>
            <p>One upload is all it takes. PacketScope does the parsing so you can get straight to the questions.</p>
          </header>

          <div className="lp-pipeline">
            <div className="lp-pipe-card">
              <span className="file-icon tint-blue" aria-hidden="true"><Icon name="file" size={20} /></span>
              <div>
                <p className="lp-pipe-title">{SAMPLE.filename}</p>
                <p className="lp-pipe-meta">{SAMPLE.packets} packets · {SAMPLE.size}</p>
              </div>
            </div>

            <div className="lp-pipe-link" aria-hidden="true">
              <svg viewBox="0 0 200 24" preserveAspectRatio="none">
                <line x1="0" y1="12" x2="200" y2="12" className="lp-pipe-line" />
              </svg>
              <span className="lp-pipe-engine"><Icon name="cpu" size={16} />Analyzing with Scapy</span>
            </div>

            <div className="lp-pipe-card lp-pipe-result">
              <p className="lp-pipe-done"><Icon name="check" size={16} />Analysis complete</p>
              <ul className="lp-pipe-protos">
                {SAMPLE_SLICES.map((s) => (
                  <li key={s.key}>
                    <span>{s.label}</span>
                    <span className="lp-pipe-track"><span style={{ width: `${s.pct}%`, background: s.color }} /></span>
                    <b>{formatPct(s.pct)}</b>
                  </li>
                ))}
              </ul>
              <p className="lp-pipe-meta">Top source <span className="mono">{SAMPLE.sources[0][0]}</span></p>
            </div>
          </div>

          <ol className="lp-steps">
            {STEPS.map((step) => (
              <li key={step.title} className="lp-step">
                <span className="lp-step-icon" aria-hidden="true"><Icon name={step.icon} size={20} /></span>
                <h3>{step.title}</h3>
                <p>{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Features ---------- */}
      <section className="lp-section lp-section-tint" id="features" aria-labelledby="features-title">
        <div className="lp-wrap">
          <header className="lp-section-head">
            <p className="lp-kicker">Features</p>
            <h2 id="features-title">Everything you need to inspect network traffic</h2>
          </header>
          <ul className="lp-features">
            {FEATURES.map((f) => (
              <li key={f.title} className={`lp-feature tone-${f.tone}`}>
                <span className="lp-feature-icon" aria-hidden="true"><Icon name={f.icon} size={22} /></span>
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Beyond the packet count ---------- */}
      <section className="lp-section" aria-labelledby="beyond-title">
        <div className="lp-wrap lp-split">
          <div className="lp-split-copy">
            <p className="lp-kicker">Built for investigation</p>
            <h2 id="beyond-title">See beyond the packet count</h2>
            <p>
              Each capture gets its own analysis page that turns raw packets into structured
              information that's easier to inspect, compare and explain.
            </p>
            <ul className="lp-checks">
              <li><Icon name="check" size={18} />Interactive protocol breakdown</li>
              <li><Icon name="check" size={18} />Ranked sources, destinations and services</li>
              <li><Icon name="check" size={18} />Packet sizes and total traffic volume</li>
              <li><Icon name="check" size={18} />Tags and notes alongside the data</li>
            </ul>
          </div>

          <div className="lp-detail-mock">
            <p className="lp-sample-flag">Sample capture</p>
            <div className="lp-detail-head">
              <span className="file-icon tint-aqua" aria-hidden="true"><Icon name="file" size={20} /></span>
              <div>
                <p className="lp-detail-name">{SAMPLE.filename}</p>
                <span className="badge badge-success">Analyzed</span>
              </div>
            </div>
            <ProtocolBar className="proto-bar-lg" protocols={SAMPLE.protocols} />
            <dl className="lp-detail-stats">
              <div><dt>Packets</dt><dd>{SAMPLE.packets}</dd></div>
              <div><dt>Duration</dt><dd>{SAMPLE.duration}</dd></div>
              <div><dt>Protocols</dt><dd>{SAMPLE_SLICES.length}</dd></div>
            </dl>
            <div className="lp-detail-cards">
              <div className="lp-detail-card">
                <h3>Protocols</h3>
                <ProtocolDonut protocols={SAMPLE.protocols} />
              </div>
              <div className="lp-detail-card">
                <h3>Top sources</h3>
                <ol className="rank-list tone-aqua">
                  {SAMPLE.sources.map(([ip, n]) => (
                    <li key={ip} className="rank-row">
                      <span className="rank-name mono">{ip}</span>
                      <span className="rank-count">{n} <span className="rank-unit">packets</span></span>
                      <span className="rank-track" aria-hidden="true">
                        <span className="rank-fill" style={{ width: `${(n / SAMPLE.sources[0][1]) * 100}%` }} />
                      </span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- Perspectives ---------- */}
      <section className="lp-section lp-section-tint" aria-labelledby="persp-title">
        <div className="lp-wrap">
          <header className="lp-section-head">
            <p className="lp-kicker">Why PacketScope</p>
            <h2 id="persp-title">One capture. Multiple perspectives.</h2>
          </header>
          <div className="lp-persp">
            <article>
              <span className="lp-persp-tag tone-aqua">Understand</span>
              <p>See what's inside a capture without scrolling through thousands of raw packets.</p>
            </article>
            <article>
              <span className="lp-persp-tag tone-purple">Investigate</span>
              <p>Follow the busiest sources, destinations and services to where the traffic actually went.</p>
            </article>
            <article>
              <span className="lp-persp-tag tone-pink">Record</span>
              <p>Tag captures and keep notes so your findings are still there next time you look.</p>
            </article>
          </div>
        </div>
      </section>

      {/* ---------- Stack ---------- */}
      <section className="lp-section" aria-labelledby="stack-title">
        <div className="lp-wrap">
          <header className="lp-section-head">
            <p className="lp-kicker">Technology</p>
            <h2 id="stack-title">Powered by a modern analysis stack</h2>
          </header>
          <ul className="lp-stack">
            {STACK.map((t) => (
              <li key={t.name}>
                <span className="lp-stack-name">{t.name}</span>
                <span className="lp-stack-role">{t.role}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Final CTA ---------- */}
      <section className="lp-final" aria-labelledby="final-title">
        <NetworkField quiet />
        <div className="lp-wrap lp-final-inner">
          <h2 id="final-title">Ready to explore your network traffic?</h2>
          <p>Upload a packet capture and start exploring what happened on the network.</p>
          <Link className="lp-btn lp-btn-primary" to="/sign-up">Get started <Icon name="arrowRight" size={18} /></Link>
          <p className="lp-fineprint">Supports .pcap and .pcapng</p>
        </div>
      </section>

      <footer className="lp-footer">
        <div className="lp-wrap lp-footer-grid">
          <div>
            <Logo />
            <p className="lp-footer-tag">Network traffic analysis, simplified.</p>
          </div>
          <nav aria-label="Product">
            <h3>Product</h3>
            <Link to="/sign-up">Create account</Link>
            <Link to="/sign-in">Sign in</Link>
          </nav>
          <nav aria-label="Explore">
            <h3>Explore</h3>
            <a href="#features">Features</a>
            <a href="#how-it-works">How it works</a>
          </nav>
          <div>
            <h3>Technology</h3>
            <p>React · FastAPI · Scapy · PostgreSQL</p>
          </div>
        </div>
        <p className="lp-wrap lp-copy">© 2026 PacketScope</p>
      </footer>
    </main>
  );
};

const BrowserFrame = ({ label, children }) => (
  <div className="lp-browser">
    <div className="lp-browser-bar" aria-hidden="true">
      <span /><span /><span />
      <em>{label}</em>
    </div>
    {children}
  </div>
);

// A scaled-down, non-interactive picture of the real dashboard
const MiniDashboard = () => (
  <div className="lp-mini" aria-hidden="true">
    <div className="lp-mini-side">
      <Logo />
      <i className="is-active" /><i /><i />
    </div>
    <div className="lp-mini-main">
      <div className="lp-mini-banner"><b>Welcome back</b><span /></div>
      <div className="lp-mini-stats">
        <div className="tone-aqua"><Icon name="fileText" size={14} /><b>12</b><span>PCAP files</span></div>
        <div className="tone-purple"><Icon name="activity" size={14} /><b>48,210</b><span>Packets</span></div>
        <div className="tone-yellow"><Icon name="database" size={14} /><b>9.6 MB</b><span>Traffic</span></div>
      </div>
      <div className="lp-mini-table">
        {[
          ['home-browsing.pcap', { tcp: 200, udp: 25, icmp: 10 }, 'blue'],
          ['office-traffic.pcap', { tcp: 640, udp: 520, icmp: 124 }, 'purple'],
          ['dns-lookups.pcapng', { tcp: 42, udp: 600 }, 'aqua'],
          ['lab-scan.pcap', { tcp: 300, arp: 80, icmp: 60 }, 'yellow'],
        ].map(([name, protos, tint]) => (
          <div key={name} className="lp-mini-row">
            <span className={`lp-mini-file tint-${tint}`} />
            <span className="lp-mini-name">{name}</span>
            <ProtocolBar protocols={protos} />
            <span className="lp-mini-badge" />
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default Landing;
