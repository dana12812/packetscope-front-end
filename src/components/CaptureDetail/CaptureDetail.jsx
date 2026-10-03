import { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import Icon from '../Icon/Icon';
import { ProtocolBar, ProtocolDonut } from '../ProtocolChart/ProtocolChart';
import { formatNumber, formatDuration, formatBytes, formatWhen, formatDateTime } from '../../lib/helpers/format';
import RoleBadge from '../Admin/RoleBadge';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import * as captureService from '../../services/captureService';
import * as annotationService from '../../services/annotationService';
import * as tagService from '../../services/tagService';

const CaptureDetail = () => {
  const { captureId } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(UserContext);
  const [capture, setCapture] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Notes
  const [annotations, setAnnotations] = useState([]);
  const [noteBody, setNoteBody] = useState('');
  const [editingNote, setEditingNote] = useState(null);

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

  // Opening a note for editing focuses it with the caret after the existing text
  const editingNoteId = editingNote?.id;
  useEffect(() => {
    if (!editingNoteId) return;
    const textarea = document.getElementById(`note-edit-${editingNoteId}`);
    textarea?.focus();
    textarea?.setSelectionRange(textarea.value.length, textarea.value.length);
  }, [editingNoteId]);

  const handleUpdateNote = async (evt) => {
    evt.preventDefault();
    if (!editingNote.body.trim()) return;
    try {
      const updated = await annotationService.update(editingNote.id, { body: editingNote.body });
      setAnnotations(annotations.map((n) => (n.id === updated.id ? updated : n)));
      setEditingNote(null);
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
    setDeleting(true);
    try {
      await captureService.remove(capture.id);
      navigate('/');
    } catch (err) {
      setError(err.message);
      setConfirmDelete(false);
      setDeleting(false);
    }
  };

  if (loading) return <p className="loading"><span className="spinner" aria-hidden="true" />Loading capture…</p>;
  if (error && !capture) return <main className="capture-detail"><p className="error" role="alert">{error}</p></main>;
  if (!capture) return null;

  const summary = capture.summary || {};
  const protocolCount = Object.keys(summary.protocols || {}).length;
  const availableTags = allTags.filter((t) => !capture.tags.some((ct) => ct.id === t.id));
  // Admins can open anyone's capture; only the owner can edit, delete or re-tag it
  const myId = Number(user.sub);
  const isOwner = capture.user_id === myId;
  const ownerName = capture.owner_username || user.username;

  return (
    <main className="capture-detail">
      {isOwner ? (
        <Link className="back-link" to="/?view=all#analyses"><Icon name="arrowLeft" size={16} />All Captures</Link>
      ) : (
        <Link className="back-link" to={`/admin/users/${capture.user_id}`}><Icon name="arrowLeft" size={16} />Back to {ownerName}</Link>
      )}

      {!isOwner && (
        <p className="admin-banner" role="note">
          <Icon name="shield" size={18} />
          <span>You're viewing <strong>{ownerName}</strong>'s capture as an admin. You can read it and add notes; only {ownerName} can edit or delete it.</span>
        </p>
      )}

      <header className="detail-header">
        <div className="detail-heading">
          <span className="file-icon file-icon-lg tint-aqua" aria-hidden="true"><Icon name="file" size={24} /></span>
          <div>
            <h1 className="detail-title">{capture.filename}</h1>
            <p className="detail-meta">
              Analyzed by <strong>{ownerName}</strong>
              <span aria-hidden="true"> · </span>
              <time dateTime={capture.created_at}>{formatWhen(capture.created_at)}</time>
              <span className="badge badge-success">Analyzed</span>
            </p>
          </div>
        </div>
        {isOwner && (
          <div className="detail-actions">
            <Link className="btn btn-ghost" to={`/captures/${capture.id}/edit`}><Icon name="edit" size={16} />Edit</Link>
            <button className="btn btn-danger" type="button" onClick={() => setConfirmDelete(true)}><Icon name="trash" size={16} />Delete</button>
          </div>
        )}
      </header>

      {error && <p className="error" role="alert">{error}</p>}

      <ProtocolBar className="proto-bar-lg" protocols={summary.protocols} />

      <section className="summary-row" aria-label="Capture summary">
        <SummaryStat tone="aqua" icon="activity" label="Packets" value={formatNumber(capture.packet_count)} />
        <SummaryStat tone="purple" icon="clock" label="Duration" value={formatDuration(capture.duration)} />
        {summary.total_bytes !== undefined && (
          <SummaryStat tone="yellow" icon="database" label="Total Data" value={formatBytes(summary.total_bytes)} />
        )}
        <SummaryStat tone="blue" icon="layers" label="Protocols" value={protocolCount} />
      </section>

      <div className="detail-grid">
        <section className="card" aria-labelledby="proto-title">
          <header className="card-head">
            <h2 id="proto-title"><span className="head-icon tone-blue"><Icon name="pieChart" size={18} /></span>Protocol Breakdown</h2>
          </header>
          <ProtocolDonut protocols={summary.protocols} />
        </section>

        {summary.top_services && (
          <section className="card" aria-labelledby="services-title">
            <header className="card-head">
              <h2 id="services-title"><span className="head-icon tone-purple"><Icon name="network" size={18} /></span>Top Services</h2>
              <span className="card-hint">by destination port</span>
            </header>
            <RankList items={summary.top_services} tone="purple" empty="No TCP or UDP services seen." />
          </section>
        )}

        <section className="card" aria-labelledby="sources-title">
          <header className="card-head">
            <h2 id="sources-title"><span className="head-icon tone-aqua"><Icon name="arrowUpRight" size={18} /></span>Top Sources</h2>
          </header>
          <RankList items={summary.top_sources} tone="aqua" mono empty="No IP sources in this capture." />
        </section>

        <section className="card" aria-labelledby="dest-title">
          <header className="card-head">
            <h2 id="dest-title"><span className="head-icon tone-pink"><Icon name="arrowDownLeft" size={18} /></span>Top Destinations</h2>
          </header>
          <RankList items={summary.top_destinations} tone="pink" mono empty="No IP destinations in this capture." />
        </section>

        {summary.packet_sizes && (
          <section className="card" aria-labelledby="traffic-title">
            <header className="card-head">
              <h2 id="traffic-title"><span className="head-icon tone-yellow"><Icon name="layers" size={18} /></span>Traffic Information</h2>
            </header>
            <dl className="facts">
              <div><dt>Smallest packet</dt><dd>{formatNumber(summary.packet_sizes.min)} B</dd></div>
              <div><dt>Average packet</dt><dd>{formatNumber(summary.packet_sizes.avg)} B</dd></div>
              <div><dt>Largest packet</dt><dd>{formatNumber(summary.packet_sizes.max)} B</dd></div>
              {summary.total_bytes !== undefined && <div><dt>Total bytes</dt><dd>{formatNumber(summary.total_bytes)}</dd></div>}
            </dl>
          </section>
        )}

        <section className="card" aria-labelledby="tags-title">
          <header className="card-head">
            <h2 id="tags-title"><span className="head-icon tone-aqua"><Icon name="tag" size={18} /></span>Tags</h2>
          </header>
          {capture.tags.length === 0 ? (
            <p className="empty-state">{isOwner ? 'No tags yet. Add one to group related captures.' : 'No tags on this capture.'}</p>
          ) : (
            <ul className="tag-list">
              {capture.tags.map((tag) => (
                <li className="tag-chip" key={tag.id}>
                  <span className="tag-dot" style={{ background: tag.color || 'var(--proto-other)' }} aria-hidden="true" />
                  {tag.name}
                  {isOwner && (
                    <button className="tag-remove" type="button" onClick={() => handleRemoveTag(tag.id)} aria-label={`Remove ${tag.name} tag`}>
                      <Icon name="x" size={14} />
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
          {isOwner && <form className="tag-form" onSubmit={handleAttachTag}>
            <label htmlFor="tag-select" className="sr-only">Tag to add</label>
            <select id="tag-select" className="tag-select" value={selectedTagId} onChange={(e) => setSelectedTagId(e.target.value)}>
              <option value="">Add a tag…</option>
              {availableTags.map((tag) => (
                <option key={tag.id} value={tag.id}>{tag.name}</option>
              ))}
            </select>
            <button className="btn btn-ghost" disabled={!selectedTagId}>Add tag</button>
          </form>}
          {isOwner && (
            <Link className="text-link tag-manage-link" to="/tags">
              {allTags.length === 0 ? 'Create your first tag' : 'Create or edit tags'} <Icon name="arrowRight" size={16} />
            </Link>
          )}
        </section>
      </div>

      <section className="card notes" aria-labelledby="notes-title">
        <header className="card-head">
          <h2 id="notes-title"><span className="head-icon tone-purple"><Icon name="note" size={18} /></span>Notes</h2>
        </header>
        <form className="note-form" onSubmit={handleAddNote}>
          <label htmlFor="note-body" className="sr-only">New note</label>
          <textarea
            id="note-body"
            className="note-input"
            value={noteBody}
            onChange={(e) => setNoteBody(e.target.value)}
            placeholder="Write what you noticed in this capture…"
          />
          <button className="btn btn-primary" disabled={!noteBody.trim()}>Add note</button>
        </form>

        {annotations.length === 0 ? (
          <p className="empty-state">No notes yet.</p>
        ) : (
          <ul className="note-list">
            {annotations.map((note) => (
              <li className={`note ${note.author_role === 'admin' ? 'note-admin' : ''}`} key={note.id}>
                <header className="note-head">
                  <span className="avatar avatar-sm" aria-hidden="true">{(note.author_username || '?').charAt(0).toUpperCase()}</span>
                  <span className="note-author">
                    {note.author_username || 'Deleted user'}
                    {note.user_id === myId && <span className="note-you"> (you)</span>}
                  </span>
                  {note.author_role === 'admin' && <RoleBadge role="admin" />}
                  <time className="note-time" dateTime={note.created_at}>{formatDateTime(note.created_at)}</time>
                  {note.user_id === myId && editingNote?.id !== note.id && (
                    <span className="note-actions">
                      <button className="icon-btn" type="button" onClick={() => setEditingNote({ id: note.id, body: note.body })} aria-label="Edit your note">
                        <Icon name="edit" size={18} />
                      </button>
                      <button className="icon-btn icon-btn-danger" type="button" onClick={() => handleDeleteNote(note.id)} aria-label="Delete your note">
                        <Icon name="trash" size={18} />
                      </button>
                    </span>
                  )}
                </header>
                {editingNote?.id === note.id ? (
                  <form className="note-edit" onSubmit={handleUpdateNote}>
                    <label htmlFor={`note-edit-${note.id}`} className="sr-only">Edit note</label>
                    <textarea
                      id={`note-edit-${note.id}`}
                      className="note-input"
                      value={editingNote.body}
                      onChange={(e) => setEditingNote({ ...editingNote, body: e.target.value })}
                    />
                    <div className="note-edit-actions">
                      <button className="btn btn-ghost" type="button" onClick={() => setEditingNote(null)}>Cancel</button>
                      <button className="btn btn-primary" disabled={!editingNote.body.trim()}>Save note</button>
                    </div>
                  </form>
                ) : (
                  <p className="note-body">{note.body}</p>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${capture.filename}?`}
        confirmLabel="Delete capture"
        busy={deleting}
        onConfirm={handleDeleteCapture}
        onCancel={() => setConfirmDelete(false)}
      >
        <p>
          This permanently removes the capture{annotations.length === 0
            ? ' and its analysis'
            : `, its analysis and ${annotations.length === 1 ? 'its note' : `all ${annotations.length} notes`}`}.
        </p>
      </ConfirmDialog>
    </main>
  );
};

const SummaryStat = ({ tone, icon, label, value }) => (
  <div className={`summary-stat tone-${tone}`}>
    <span className="stat-icon" aria-hidden="true"><Icon name={icon} size={20} /></span>
    <span className="summary-text">
      <span className="summary-label">{label}</span>
      <span className="summary-value">{value}</span>
    </span>
  </div>
);

// [name, count] pairs from the parser, drawn with a relative bar so the busiest stands out
const RankList = ({ items = [], tone, mono = false, empty }) => {
  if (!items.length) return <p className="empty-state">{empty}</p>;
  const max = items[0][1] || 1;
  return (
    <ol className={`rank-list tone-${tone}`}>
      {items.map(([name, count]) => (
        <li key={name} className="rank-row">
          <span className={`rank-name ${mono ? 'mono' : ''}`}>{name}</span>
          <span className="rank-count">{formatNumber(count)} <span className="rank-unit">packets</span></span>
          <span className="rank-track" aria-hidden="true"><span className="rank-fill" style={{ width: `${(count / max) * 100}%` }} /></span>
        </li>
      ))}
    </ol>
  );
};

export default CaptureDetail;
