import { useState, useEffect, useContext, useRef, useMemo } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import * as captureService from '../../services/captureService';
import Icon from '../Icon/Icon';
import NetworkField from '../NetworkField/NetworkField';
import { ProtocolBar, ProtocolDonut } from '../ProtocolChart/ProtocolChart';
import {
  protocolSlices, sumProtocols, formatNumber, formatPct, formatDuration,
  formatBytes, formatWhen, fileTint,
} from '../../lib/helpers/format';

const ACCEPTED = ['.pcap', '.pcapng'];
const RECENT_LIMIT = 5;
const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

const greeting = (ts) => {
  const hour = new Date(ts).getHours();
  if (hour < 12) return 'Good morning';
  if (hour < 18) return 'Good afternoon';
  return 'Good evening';
};

const isAccepted = (file) => ACCEPTED.some((ext) => file.name.toLowerCase().endsWith(ext));

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const navigate = useNavigate();
  const { hash } = useLocation();
  const [searchParams] = useSearchParams();
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState('');
  const inputRef = useRef(null);
  const [now] = useState(() => Date.now());

  const query = (searchParams.get('q') || '').trim().toLowerCase();
  const showAll = searchParams.get('view') === 'all' || Boolean(query);

  useEffect(() => {
    async function loadCaptures() {
      try {
        const data = await captureService.index();
        setCaptures(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    }
    loadCaptures();
  }, []);

  // Sidebar links like "/#upload" land on a section of this page
  useEffect(() => {
    if (loading || !hash) return;
    document.getElementById(hash.slice(1))?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }, [hash, loading, searchParams]);

  const sorted = useMemo(
    () => [...captures].sort((a, b) => new Date(b.created_at) - new Date(a.created_at)),
    [captures],
  );

  const stats = useMemo(() => {
    const totalPackets = captures.reduce((sum, c) => sum + (c.packet_count || 0), 0);
    const totalBytes = captures.reduce((sum, c) => sum + (c.summary?.total_bytes || 0), 0);
    const newThisWeek = captures.filter((c) => now - new Date(c.created_at) < WEEK_MS).length;
    const protocols = sumProtocols(captures);
    const topProtocol = [...protocolSlices(protocols)].sort((a, b) => b.count - a.count)[0];
    const largest = captures.reduce((max, c) => ((c.packet_count || 0) > (max?.packet_count || 0) ? c : max), null);

    const destinations = {};
    captures.forEach((c) => (c.summary?.top_destinations || []).forEach(([ip, n]) => {
      destinations[ip] = (destinations[ip] || 0) + n;
    }));
    const [topDestIp, topDestCount] = Object.entries(destinations).sort((a, b) => b[1] - a[1])[0] || [];

    return { totalPackets, totalBytes, newThisWeek, protocols, topProtocol, largest, topDestIp, topDestCount };
  }, [captures, now]);

  const filtered = query
    ? sorted.filter((c) =>
        c.filename.toLowerCase().includes(query) ||
        c.tags.some((t) => t.name.toLowerCase().includes(query)))
    : sorted;
  const rows = showAll ? filtered : filtered.slice(0, RECENT_LIMIT);

  const chooseFile = (picked) => {
    setError('');
    if (!picked) return;
    if (!isAccepted(picked)) {
      setFile(null);
      setError(`${picked.name} isn't a .pcap or .pcapng file.`);
      return;
    }
    setFile(picked);
  };

  const handleDrop = (evt) => {
    evt.preventDefault();
    setDragging(false);
    chooseFile(evt.dataTransfer.files[0]);
  };

  const handleUpload = async (evt) => {
    evt.preventDefault();
    if (!file) return;
    setError('');
    setUploading(true);

    try {
      const newCapture = await captureService.create(file);
      setCaptures([newCapture, ...captures]);
      setFile(null);
      evt.target.reset();
    } catch (error) {
      setError(error.message);
    } finally {
      setUploading(false);
    }
  };

  if (loading) return <p className="loading"><span className="spinner" aria-hidden="true" />Loading your captures…</p>;

  return (
    <main className="dashboard">
      <section className="welcome" aria-labelledby="welcome-title">
        <NetworkField quiet />
        <div className="welcome-copy">
          <p className="welcome-eyebrow">{greeting(now)} · {new Date(now).toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}</p>
          <h1 id="welcome-title">Welcome back, <span className="welcome-name">{user.username}</span></h1>
          <p>Upload a packet capture file to analyze network activity and see what's inside.</p>
          <div className="welcome-actions">
            <a className="btn btn-accent" href="#upload"><Icon name="cloudUpload" size={18} />Upload capture</a>
            {captures.length > 0 && (
              <Link className="btn btn-glass" to="/?view=all#analyses">View all analyses</Link>
            )}
          </div>
        </div>

        {sorted[0] ? (
          <Link className="welcome-latest" to={`/captures/${sorted[0].id}`}>
            <span className="welcome-latest-kicker"><span className="live-dot" aria-hidden="true" />Latest analysis</span>
            <span className="welcome-latest-name">{sorted[0].filename}</span>
            <span className="welcome-latest-meta">
              {formatNumber(sorted[0].packet_count)} packets · {formatDuration(sorted[0].duration)} · {formatWhen(sorted[0].created_at)}
            </span>
            <ProtocolBar protocols={sorted[0].summary?.protocols} />
            <span className="welcome-latest-cta">Open analysis <Icon name="arrowRight" size={16} /></span>
          </Link>
        ) : (
          <WelcomeArt />
        )}
      </section>

      {error && <p className="error" role="alert">{error}</p>}

      <div className="overview">
        <form
          id="upload"
          className={`dropzone ${dragging ? 'is-dragging' : ''} ${file ? 'has-file' : ''}`}
          onSubmit={handleUpload}
          onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
          onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setDragging(false); }}
          onDrop={handleDrop}
        >
          <span className="dropzone-icon" aria-hidden="true"><Icon name="cloudUpload" size={30} /></span>
          <h2 className="dropzone-title">{dragging ? 'Drop to add this capture' : 'Upload PCAP File'}</h2>
          {file ? (
            <p className="dropzone-file">
              <Icon name="file" size={16} />
              <span>{file.name}</span>
              <span className="dropzone-size">{formatBytes(file.size)}</span>
            </p>
          ) : (
            <p className="dropzone-hint">Drag and drop your .pcap or .pcapng file here</p>
          )}
          <input
            ref={inputRef}
            id="capture-file"
            className="sr-only"
            tabIndex={-1}
            type="file"
            accept=".pcap,.pcapng"
            onChange={(e) => chooseFile(e.target.files[0])}
          />
          <div className="dropzone-actions">
            {file ? (
              <>
                <button className="btn btn-accent" disabled={uploading}>
                  {uploading ? <><span className="spinner spinner-dark" aria-hidden="true" />Analyzing…</> : 'Analyze capture'}
                </button>
                <button className="btn btn-ghost" type="button" disabled={uploading} onClick={() => { setFile(null); inputRef.current.value = ''; }}>
                  Cancel
                </button>
              </>
            ) : (
              <label htmlFor="capture-file" className="btn btn-accent" tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); inputRef.current.click(); } }}>
                Browse Files
              </label>
            )}
          </div>
        </form>

        <StatCard tone="aqua" icon="fileText" value={formatNumber(captures.length)} label="Total PCAP Files"
          trend={stats.newThisWeek ? `${stats.newThisWeek} new this week` : null} />
        <StatCard tone="purple" icon="activity" value={formatNumber(stats.totalPackets)} label="Packets Analyzed" />
        <StatCard tone="yellow" icon="database" value={formatBytes(stats.totalBytes)} label="Traffic Analyzed" />
      </div>

      <div className="dash-grid">
        <section className="card analyses" id="analyses" aria-labelledby="analyses-title">
          <header className="card-head">
            <h2 id="analyses-title"><span className="head-icon tone-aqua"><Icon name="fileText" size={18} /></span>
              {query ? `Results for “${searchParams.get('q')}”` : showAll ? 'All Analyses' : 'Recent Analyses'}
            </h2>
            {query ? (
              <Link className="text-link" to="/?view=all#analyses">Clear search</Link>
            ) : showAll ? (
              <Link className="text-link" to="/">Show recent</Link>
            ) : captures.length > RECENT_LIMIT && (
              <Link className="text-link" to="/?view=all#analyses">View All <Icon name="arrowRight" size={16} /></Link>
            )}
          </header>

          {rows.length === 0 ? (
            <p className="empty-state">
              {query ? 'No captures match that search.' : 'No captures yet. Upload a .pcap file above to see its analysis here.'}
            </p>
          ) : (
            <table className="analysis-table">
              <thead>
                <tr>
                  <th scope="col">File Name</th>
                  <th scope="col" className="num">Packets</th>
                  <th scope="col" className="num">Duration</th>
                  <th scope="col">Protocol Mix</th>
                  <th scope="col">Status</th>
                  <th scope="col"><span className="sr-only">Action</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((capture) => (
                  <tr key={capture.id}>
                    <td className="cell-file"><div className="file-cell">
                      <span className={`file-icon tint-${fileTint(capture.id)}`} aria-hidden="true"><Icon name="file" size={18} /></span>
                      <span className="file-meta">
                        <Link className="file-name" to={`/captures/${capture.id}`}>{capture.filename}</Link>
                        <span className="file-when">Uploaded · {formatWhen(capture.created_at)}</span>
                      </span>
                    </div></td>
                    <td className="num" data-label="Packets">{formatNumber(capture.packet_count)}</td>
                    <td className="num" data-label="Duration">{formatDuration(capture.duration)}</td>
                    <td className="cell-mix" data-label="Protocols"><ProtocolBar protocols={capture.summary?.protocols} /></td>
                    <td data-label="Status"><span className="badge badge-success">Analyzed</span></td>
                    <td className="cell-action">
                      <button type="button" className="btn btn-outline" onClick={() => navigate(`/captures/${capture.id}`)}
                        aria-label={`View analysis of ${capture.filename}`}>
                        View Analysis <Icon name="arrowRight" size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <aside className="dash-side">
          {captures.length > 0 && (
            <section className="card insights" aria-labelledby="insights-title">
              <header className="card-head">
                <h2 id="insights-title"><span className="head-icon tone-purple"><Icon name="lightbulb" size={18} /></span>Quick Insights</h2>
              </header>
              <ul className="insight-list">
                {stats.topProtocol && (
                  <li className="insight">
                    <span className="insight-icon tone-aqua"><Icon name="pieChart" size={18} /></span>
                    <span className="insight-body">
                      <span className="insight-title">Most common protocol</span>
                      <span className="insight-text">{stats.topProtocol.label} ({formatPct(stats.topProtocol.pct)} of packets)</span>
                    </span>
                  </li>
                )}
                {stats.largest && (
                  <li>
                    <Link className="insight insight-link" to={`/captures/${stats.largest.id}`}>
                      <span className="insight-icon tone-blue"><Icon name="activity" size={18} /></span>
                      <span className="insight-body">
                        <span className="insight-title">Highest traffic file</span>
                        <span className="insight-text">{stats.largest.filename}</span>
                        <span className="insight-sub">{formatNumber(stats.largest.packet_count)} packets</span>
                      </span>
                      <Icon name="chevronRight" size={18} className="insight-arrow" />
                    </Link>
                  </li>
                )}
                {stats.topDestIp && (
                  <li className="insight">
                    <span className="insight-icon tone-pink"><Icon name="server" size={18} /></span>
                    <span className="insight-body">
                      <span className="insight-title">Top destination</span>
                      <span className="insight-text mono">{stats.topDestIp}</span>
                      <span className="insight-sub">{formatNumber(stats.topDestCount)} packets across your captures</span>
                    </span>
                  </li>
                )}
              </ul>
            </section>
          )}

          {captures.length > 0 && (
            <section className="card" aria-labelledby="protocols-title">
              <header className="card-head">
                <h2 id="protocols-title"><span className="head-icon tone-blue"><Icon name="pieChart" size={18} /></span>Protocol Breakdown</h2>
              </header>
              <ProtocolDonut protocols={stats.protocols} />
            </section>
          )}

          <section className="card" aria-labelledby="activity-title">
            <header className="card-head">
              <h2 id="activity-title"><span className="head-icon tone-yellow"><Icon name="clock" size={18} /></span>Recent Activity</h2>
            </header>
            {sorted.length === 0 ? (
              <p className="empty-state">Your analyzed captures will appear here.</p>
            ) : (
              <ol className="timeline">
                {sorted.slice(0, RECENT_LIMIT).map((capture, i) => (
                  <li key={capture.id} className={`timeline-item dot-${i % 5}`}>
                    <Link to={`/captures/${capture.id}`} className="timeline-file">{capture.filename}</Link> analyzed
                    <time className="timeline-time" dateTime={capture.created_at}>{formatWhen(capture.created_at)}</time>
                  </li>
                ))}
              </ol>
            )}
          </section>
        </aside>
      </div>
    </main>
  );
};

const StatCard = ({ tone, icon, value, label, trend }) => (
  <section className={`stat-card tone-${tone}`}>
    <span className="stat-icon" aria-hidden="true"><Icon name={icon} size={24} /></span>
    <span className="stat-value">{value}</span>
    <h2 className="stat-label">{label}</h2>
    {trend && <span className="stat-trend"><Icon name="arrowUpRight" size={14} />{trend}</span>}
  </section>
);

// Decorative: a capture file under a magnifier, with a small network graph behind it
const WelcomeArt = () => (
  <svg className="welcome-art" viewBox="0 0 320 150" aria-hidden="true" focusable="false">
    <path d="M0 130C60 80 110 150 170 105S270 60 320 80" fill="none" stroke="#16C7C7" strokeOpacity=".35" strokeWidth="2" />
    <path d="M10 145C80 110 130 160 190 125S280 95 320 110" fill="none" stroke="#6C5CE7" strokeOpacity=".2" strokeWidth="2" />
    <g stroke="#4A90E2" strokeOpacity=".45" strokeWidth="1.5">
      <path d="M40 40 85 62M85 62 60 98M85 62 118 30" />
    </g>
    <g fill="#fff" strokeWidth="2">
      <circle cx="40" cy="40" r="6" stroke="#16C7C7" />
      <circle cx="85" cy="62" r="8" stroke="#6C5CE7" />
      <circle cx="60" cy="98" r="5" stroke="#4A90E2" />
      <circle cx="118" cy="30" r="5" stroke="#F5B6D2" />
    </g>
    <rect x="160" y="22" width="92" height="66" rx="8" fill="#fff" stroke="#102A5C" strokeWidth="2.5" />
    <rect x="150" y="88" width="112" height="8" rx="4" fill="#102A5C" />
    <path d="M190 34h22l10 10v32h-32z" fill="#DDF4FF" stroke="#4A90E2" strokeWidth="1.5" />
    <rect x="185" y="56" width="32" height="12" rx="3" fill="#4A90E2" />
    <text x="201" y="65" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#fff" fontFamily="Inter, sans-serif">.pcap</text>
    <circle cx="245" cy="70" r="18" fill="#DDF9F5" fillOpacity=".85" stroke="#16C7C7" strokeWidth="4" />
    <path d="m258 84 16 16" stroke="#102A5C" strokeWidth="6" strokeLinecap="round" />
    <path d="M290 30v10M285 35h10M140 18v8M136 22h8" stroke="#6C5CE7" strokeOpacity=".5" strokeWidth="1.5" strokeLinecap="round" />
  </svg>
);

export default Dashboard;
