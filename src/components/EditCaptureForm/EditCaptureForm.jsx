import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router';
import * as captureService from '../../services/captureService';

const EditCaptureForm = () => {
const { captureId } = useParams();
const navigate = useNavigate();
const [filename, setFilename] = useState('');
const [loading, setLoading] = useState(true);
const [error, setError] = useState('');

  useEffect(() => {
    async function loadCapture() {
      try {
        const capture = await captureService.show(captureId);
        setFilename(capture.filename);
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
    try {
      await captureService.update(captureId, { filename });
      navigate(`/captures/${captureId}`);
    } catch (err) {
      setError(err.message);
    }
  };

    if (loading) return <p className="loading">Loading…</p>;

  return (
    <main className="edit-capture">
      <h1>Edit Capture</h1>
      {error && <p className="error">{error}</p>}

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
        <div className="form-actions">
          <button className="btn" type="button" onClick={() => navigate(`/captures/${captureId}`)}>Cancel</button>
          <button className="btn btn-primary" disabled={!filename.trim()}>Save changes</button>
        </div>
      </form>
    </main>
  );
};

export default EditCaptureForm;

