import { useEffect, useState } from 'react';
import * as tagService from '../../services/tagService';
import Icon from '../Icon/Icon';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import { TAG_COLORS } from '../../lib/helpers/format';

const TagManager = () => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [newTag, setNewTag] = useState({ name: '', color: TAG_COLORS[0].hex });
  const [editing, setEditing] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function loadTags() {
      try {
        setTags(await tagService.index());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    loadTags();
  }, []);

  const nameTaken = (name, ignoreId) =>
    tags.some((t) => t.id !== ignoreId && t.name.toLowerCase() === name.trim().toLowerCase());

  const handleCreate = async (evt) => {
    evt.preventDefault();
    setError('');
    try {
      const created = await tagService.create({ name: newTag.name.trim(), color: newTag.color });
      setTags([...tags, created]);
      setNewTag({ name: '', color: newTag.color });
    } catch (err) {
      setError(err.message);
    }
  };

  const handleUpdate = async (evt) => {
    evt.preventDefault();
    setError('');
    try {
      const updated = await tagService.update(editing.id, { name: editing.name.trim(), color: editing.color });
      setTags(tags.map((t) => (t.id === updated.id ? updated : t)));
      setEditing(null);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await tagService.remove(pendingDelete.id);
      setTags(tags.filter((t) => t.id !== pendingDelete.id));
    } catch (err) {
      setError(err.message);
    } finally {
      setPendingDelete(null);
      setDeleting(false);
    }
  };

  if (loading) return <p className="loading"><span className="spinner" aria-hidden="true" />Loading tags…</p>;

  const newNameTaken = nameTaken(newTag.name);

  return (
    <main className="tag-manager">
      <header className="page-header">
        <p className="page-kicker"><Icon name="tag" size={16} />Tags</p>
        <h1>Your tags</h1>
        <p className="page-sub">Create colour-coded labels, then attach them to captures from each capture's page.</p>
      </header>

      {error && <p className="error" role="alert">{error}</p>}

      <section className="card" aria-labelledby="new-tag-title">
        <header className="card-head">
          <h2 id="new-tag-title"><span className="head-icon tone-aqua"><Icon name="tag" size={18} /></span>New tag</h2>
        </header>
        <form className="tag-editor" onSubmit={handleCreate}>
          <div className="field">
            <label htmlFor="new-tag-name">Name</label>
            <input
              id="new-tag-name"
              type="text"
              value={newTag.name}
              onChange={(e) => setNewTag({ ...newTag, name: e.target.value })}
              placeholder="e.g. suspicious, home lab"
              aria-invalid={newNameTaken}
              aria-describedby={newNameTaken ? 'new-tag-hint' : undefined}
              required
            />
            {newNameTaken && <p className="field-hint is-error" id="new-tag-hint">You already have a tag with this name.</p>}
          </div>
          <ColorPicker id="new-tag" value={newTag.color} onChange={(color) => setNewTag({ ...newTag, color })} />
          <button className="btn btn-accent" disabled={!newTag.name.trim() || newNameTaken}>
            <Icon name="tag" size={16} />Create tag
          </button>
        </form>
      </section>

      <section className="card" aria-labelledby="tag-list-title">
        <header className="card-head">
          <h2 id="tag-list-title"><span className="head-icon tone-purple"><Icon name="layers" size={18} /></span>All tags</h2>
          <span className="card-hint">{tags.length} {tags.length === 1 ? 'tag' : 'tags'}</span>
        </header>

        {tags.length === 0 ? (
          <p className="empty-state">No tags yet. Create one above to start grouping captures.</p>
        ) : (
          <ul className="tag-rows">
            {tags.map((tag) => (
              <li key={tag.id} className="tag-row">
                {editing?.id === tag.id ? (
                  <form className="tag-editor tag-editor-inline" onSubmit={handleUpdate}>
                    <div className="field">
                      <label htmlFor={`edit-tag-${tag.id}`}>Name</label>
                      <input
                        id={`edit-tag-${tag.id}`}
                        type="text"
                        value={editing.name}
                        onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                        aria-invalid={nameTaken(editing.name, tag.id)}
                        autoFocus
                        required
                      />
                    </div>
                    <ColorPicker id={`edit-tag-${tag.id}`} value={editing.color} onChange={(color) => setEditing({ ...editing, color })} />
                    <div className="tag-row-actions">
                      <button className="btn btn-primary" disabled={!editing.name.trim() || nameTaken(editing.name, tag.id)}>Save</button>
                      <button className="btn btn-ghost" type="button" onClick={() => setEditing(null)}>Cancel</button>
                    </div>
                  </form>
                ) : (
                  <>
                    <span className="tag-chip">
                      <span className="tag-dot" style={{ background: tag.color || 'var(--proto-other)' }} aria-hidden="true" />
                      {tag.name}
                    </span>
                    <div className="tag-row-actions">
                      <button className="btn btn-ghost" type="button" onClick={() => setEditing({ id: tag.id, name: tag.name, color: tag.color || TAG_COLORS[0].hex })}>
                        <Icon name="edit" size={16} />Edit<span className="sr-only"> {tag.name}</span>
                      </button>
                      <button className="icon-btn icon-btn-danger" type="button" onClick={() => setPendingDelete(tag)} aria-label={`Delete ${tag.name} tag`}>
                        <Icon name="trash" size={18} />
                      </button>
                    </div>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete the “${pendingDelete?.name}” tag?`}
        confirmLabel="Delete tag"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      >
        <p>It will be removed from every capture it's attached to. The captures themselves aren't affected.</p>
      </ConfirmDialog>
    </main>
  );
};

// Preset swatches as a radio group, plus a native picker for any other colour
const ColorPicker = ({ id, value, onChange }) => (
  <fieldset className="color-picker">
    <legend>Colour</legend>
    <div className="swatches">
      {TAG_COLORS.map(({ name, hex }) => (
        <label key={hex} className="swatch" style={{ '--swatch': hex }} title={name}>
          <input
            type="radio"
            name={`${id}-color`}
            value={hex}
            checked={value.toLowerCase() === hex.toLowerCase()}
            onChange={() => onChange(hex)}
            aria-label={name}
          />
        </label>
      ))}
      <label className="swatch swatch-custom" title="Custom colour">
        <input type="color" value={value} onChange={(e) => onChange(e.target.value)} />
        <span className="sr-only">Custom colour</span>
      </label>
    </div>
  </fieldset>
);

export default TagManager;
