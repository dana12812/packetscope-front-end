import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router';
import * as captureService from '../../services/captureService';

const CaptureDetail = () => {
  const { captureId } = useParams();
  const [capture, setCapture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCapture() {
      try {
        const data = await captureService.show(captureId);
        setCapture(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCapture();
  }, [captureId]);

  if (loading) return <p className="loading">Loading capture…</p>;
  if (error) return <p className="error">{error}</p>;
  if (!capture) return null;

  const { summary } = capture;

  return (
    <main className="capture-detail">
      <Link className="back-link" to="/">← All captures</Link>

      <header className="detail-header">
        <h1 className="detail-title">{capture.filename}</h1>
        <div className="detail-actions">
          <Link className="btn" to={`/captures/${capture.id}/edit`}>Edit</Link>
        </div>
      </header>

      <section className="stats">
        <div className="stat">
          <span className="stat-label">Packets</span>
          <span className="stat-value">{capture.packet_count}</span>
        </div>
        <div className="stat">
          <span className="stat-label">Duration</span>
          <span className="stat-value">{capture.duration}s</span>
        </div>
        <div className="stat">
          <span className="stat-label">Protocols</span>
          <span className="stat-value">{Object.keys(summary.protocols || {}).length}</span>
        </div>
      </section>

      <section className="breakdown">
        <h2>Protocols</h2>
        <ul className="protocol-list">
          {Object.entries(summary.protocols || {}).map(([name, count]) => (
            <li key={name}><strong>{name}</strong>: {count}</li>
          ))}
        </ul>
      </section>

      <section className="breakdown">
        <h2>Top sources</h2>
        <ul className="talker-list">
          {(summary.top_sources || []).map(([ip, count]) => (
            <li key={ip}>{ip} — {count}</li>
          ))}
        </ul>
      </section>

      <section className="breakdown">
        <h2>Top destinations</h2>
        <ul className="talker-list">
          {(summary.top_destinations || []).map(([ip, count]) => (
            <li key={ip}>{ip} — {count}</li>
          ))}
        </ul>
      </section>
    </main>
  );
};

export default CaptureDetail;