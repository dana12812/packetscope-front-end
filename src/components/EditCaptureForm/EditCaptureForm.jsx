import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router';
import * as captureService from '../../services/captureService';
import Icon from '../Icon/Icon';

const EditCaptureForm = () => {
  const { captureId } = useParams();
  const navigate = useNavigate();
  const [filename, setFilename] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadCapture() {
      try {
        const capture = await captureService.show(captureId);
        setFilename(capture.filename);
        setOriginalName(capture.filename);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadCapture();
  }, [captureId]);

  const handleSubmit = async (evt) => {
    evt.preventDefault();
    if (!filename.trim()) return;
    setSaving(true);
    try {
      await captureService.update(captureId, { filename });
      navigate(`/captures/${captureId}`);
    } catch (err) {
      setError(err.message);
      setSaving(false);
    }
  };

  if (loading) return <p className="loading"><span className="spinner" aria-hidden="true" />Loading capture…</p>;

  return (
    <main className="edit-capture">
      <Link className="back-link" to={`/captures/${captureId}`}><Icon name="arrowLeft" size={16} />Back to capture</Link>

      <header className="page-header">
        <p className="page-kicker"><Icon name="edit" size={16} />Edit capture</p>
        <h1>Rename capture</h1>
        {originalName && <p className="page-sub">Currently named <strong>{originalName}</strong></p>}
      </header>

      {error && <p className="error" role="alert">{error}</p>}

      <form className="edit-form" onSubmit={handleSubmit}>
        <label htmlFor="filename">Capture name</label>
        <input
          id="filename"
          type="text"
          name="filename"
          value={filename}
          onChange={(e) => setFilename(e.target.value)}
          required
        />
        <p className="field-hint">This only changes the name shown in PacketScope. The analysis stays the same.</p>
        <div className="form-actions">
          <button className="btn btn-ghost" type="button" onClick={() => navigate(`/captures/${captureId}`)}>Cancel</button>
          <button className="btn btn-primary" disabled={!filename.trim() || filename === originalName || saving}>
            {saving ? <><span className="spinner spinner-white" aria-hidden="true" />Saving…</> : 'Save changes'}
          </button>
        </div>
      </form>
    </main>
  );
};

export default EditCaptureForm;
