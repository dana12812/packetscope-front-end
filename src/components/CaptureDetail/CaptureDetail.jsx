import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import * as captureService from '../../services/captureService';
import * as annotationService from '../../services/annotationService';
import * as tagService from '../../services/tagService';

const CaptureDetail = () => {
  const { captureId } = useParams();
  const navigate = useNavigate();
  const [capture, setCapture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Notes
  const [annotations, setAnnotations] = useState([]);
  const [noteBody, setNoteBody] = useState('');

  // Tags
  const [allTags, setAllTags] = useState([]);
  const [selectedTagId, setSelectedTagId] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const data = await captureService.show(captureId);
        setCapture(data);
        const notes = await annotationService.index(captureId);
        setAnnotations(notes);
        const tags = await tagService.index();
        setAllTags(tags);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [captureId]);

  const handleAddNote = async (evt) => {
    evt.preventDefault();
    if (!noteBody.trim()) return;
    try {
      const note = await annotationService.create(captureId, { body: noteBody });
      setAnnotations([...annotations, note]);
      setNoteBody('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteNote = async (annotationId) => {
    try {
      await annotationService.remove(annotationId);
      setAnnotations(annotations.filter((n) => n.id !== annotationId));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleAttachTag = async (evt) => {
    evt.preventDefault();
    if (!selectedTagId) return;
    try {
      const currentTagIds = capture.tags.map((t) => t.id);
      if (currentTagIds.includes(Number(selectedTagId))) return;
      const updated = await captureService.update(capture.id, {
        tag_ids: [...currentTagIds, Number(selectedTagId)],
      });
      setCapture(updated);
      setSelectedTagId('');
    } catch (err) {
      setError(err.message);
    }
  };

  const handleRemoveTag = async (tagId) => {
    try {
      const remainingIds = capture.tags.map((t) => t.id).filter((id) => id !== tagId);
      const updated = await captureService.update(capture.id, { tag_ids: remainingIds });
      setCapture(updated);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDeleteCapture = async () => {
    if (!window.confirm('Delete this capture? This cannot be undone.')) return;
    try {
      await captureService.remove(capture.id);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  };

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
          <button className="btn btn-danger" onClick={handleDeleteCapture}>Delete</button>
        </div>
      </header>

      <section className="tags">
        <h2>Tags</h2>
        <ul className="tag-list">
          {capture.tags.map((tag) => (
            <li className="tag-chip" key={tag.id} style={{ background: tag.color }}>
              {tag.name}
              <button className="tag-remove" onClick={() => handleRemoveTag(tag.id)} aria-label={`Remove ${tag.name} tag`}>×</button>
            </li>
          ))}
        </ul>
        <form className="tag-form" onSubmit={handleAttachTag}>
          <select className="tag-select" value={selectedTagId} onChange={(e) => setSelectedTagId(e.target.value)}>
            <option value="">Add a tag…</option>
            {allTags.map((tag) => (
              <option key={tag.id} value={tag.id}>{tag.name}</option>
            ))}
          </select>
          <button className="btn" disabled={!selectedTagId}>Attach</button>
        </form>
      </section>

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

      <section className="notes">
        <h2>Notes</h2>
        <form className="note-form" onSubmit={handleAddNote}>
          <textarea
            className="note-input"
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Add a note…"
          />
          <button className="btn btn-primary" disabled={!noteBody.trim()}>Add note</button>
        </form>

        {annotations.length === 0 ? (
          <p className="empty-state">No notes yet.</p>
        ) : (
          <ul className="note-list">
            {annotations.map((note) => (
              <li className="note" key={note.id}>
                <p className="note-body">{note.body}</p>
                <button className="btn btn-danger" onClick={() => handleDeleteNote(note.id)}>Delete</button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
};

export default CaptureDetail;