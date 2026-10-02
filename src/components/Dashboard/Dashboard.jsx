import { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import * as captureService from '../../services/captureService';

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const [captures, setCaptures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [file, setFile] = useState(null);
  const [error, setError] = useState('');

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

  const handleUpload = async (evt) => {
    evt.preventDefault();
    if (!file) return;
    setError('');

    try {
      const newCapture = await captureService.create(file);
      setCaptures([newCapture, ...captures]);
      setFile(null);
      evt.target.reset();
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <p className="loading">Loading your captures…</p>;

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <h1 className="dashboard-title">{user.username}'s Captures</h1>
        <p className="dashboard-count">{captures.length} captures</p>
      </header>

      {error && <p className="error">{error}</p>}

      <form className="upload-form" onSubmit={handleUpload}>
        <input
          className="upload-input"
          type="file"
          accept=".pcap,.pcapng"
          onChange={(e) => setFile(e.target.files[0])}
        />
        <button className="btn btn-primary" disabled={!file}>Upload</button>
      </form>

      {captures.length === 0 ? (
        <p className="empty-state">No captures yet. Upload a .pcap to get started.</p>
      ) : (
        <ul className="capture-list">
          {captures.map((capture) => (
            <li className="capture-card" key={capture.id}>
              <Link className="capture-link" to={`/captures/${capture.id}`}>
                {capture.filename}
              </Link>
              <span className="capture-meta">
                {capture.packet_count} packets · {capture.duration}s
              </span>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
};

export default Dashboard;


