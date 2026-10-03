import { useEffect, useState, useContext } from 'react';
import { Link, useNavigate, useParams } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import * as adminService from '../../services/adminService';
import Icon from '../Icon/Icon';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import { ProtocolBar } from '../ProtocolChart/ProtocolChart';
import ActivityFeed from './ActivityFeed';
import RoleBadge from './RoleBadge';
import { formatNumber, formatDuration, formatWhen, formatDateTime, fileTint } from '../../lib/helpers/format';

const AdminUserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: me } = useContext(UserContext);
  const [profile, setProfile] = useState(null);
  const [activity, setActivity] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [data, feed] = await Promise.all([
          adminService.showUser(userId),
          adminService.listActivity({ userId, limit: 100 }),
        ]);
        setProfile(data);
        setActivity(feed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [userId]);

  const isSelf = String(me.sub) === String(userId);

  const handleRoleToggle = async () => {
    setBusy(true);
    setError('');
    try {
      const updated = await adminService.updateRole(profile.id, profile.role === 'admin' ? 'user' : 'admin');
      setProfile({ ...profile, ...updated });
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    setBusy(true);
    try {
      await adminService.removeUser(profile.id);
      navigate('/admin');
    } catch (err) {
      setError(err.message);
      setConfirmDelete(false);
      setBusy(false);
    }
  };

  if (loading) return <p className="loading"><span className="spinner" aria-hidden="true" />Loading user…</p>;
  if (!profile) return <main><p className="error" role="alert">{error || 'User not found'}</p></main>;

  return (
    <main className="admin">
      <Link className="back-link" to="/admin"><Icon name="arrowLeft" size={16} />All users</Link>

      <header className="profile-header">
        <div className="profile-id">
          <span className="avatar avatar-lg" aria-hidden="true">{profile.username.charAt(0).toUpperCase()}</span>
          <div>
            <h1>{profile.username} <RoleBadge role={profile.role} /></h1>
            <p className="page-sub">{profile.email} · Joined {formatDateTime(profile.created_at)}</p>
          </div>
        </div>
        {!isSelf && (
          <div className="detail-actions">
            <button type="button" className="btn btn-ghost" onClick={handleRoleToggle} disabled={busy}>
              <Icon name="shield" size={16} />{profile.role === 'admin' ? 'Remove admin' : 'Make admin'}
            </button>
            <button type="button" className="btn btn-danger" onClick={() => setConfirmDelete(true)} disabled={busy}>
              <Icon name="trash" size={16} />Delete user
            </button>
          </div>
        )}
      </header>

      {error && <p className="error" role="alert">{error}</p>}

      <section className="summary-row" aria-label="User summary">
        <Stat tone="aqua" icon="fileText" label="Captures" value={formatNumber(profile.capture_count)} />
        <Stat tone="purple" icon="note" label="Notes written" value={formatNumber(profile.note_count)} />
        <Stat tone="blue" icon="clock" label="Last active" value={profile.last_active ? formatWhen(profile.last_active) : 'Not yet'} />
      </section>

      <div className="admin-grid">
        <section className="card" aria-labelledby="user-captures-title">
          <header className="card-head">
            <h2 id="user-captures-title"><span className="head-icon tone-aqua"><Icon name="fileText" size={18} /></span>Captures</h2>
          </header>
          {profile.captures.length === 0 ? (
            <p className="empty-state">{profile.username} hasn't uploaded any captures.</p>
          ) : (
            <ul className="capture-rows">
              {profile.captures.map((c) => (
                <li key={c.id}>
                  <Link className="capture-row" to={`/captures/${c.id}`} state={{ fromAdmin: true }}>
                    <span className={`file-icon tint-${fileTint(c.id)}`} aria-hidden="true"><Icon name="file" size={18} /></span>
                    <span className="file-meta">
                      <span className="file-name">{c.filename}</span>
                      <span className="file-when">{formatNumber(c.packet_count)} packets · {formatDuration(c.duration)} · {formatWhen(c.created_at)}</span>
                    </span>
                    <ProtocolBar protocols={c.summary?.protocols} />
                    <Icon name="chevronRight" size={18} className="insight-arrow" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        <section className="card" aria-labelledby="user-activity-title">
          <header className="card-head">
            <h2 id="user-activity-title"><span className="head-icon tone-purple"><Icon name="clock" size={18} /></span>Activity</h2>
          </header>
          <ActivityFeed items={activity} showActor={false} empty={`No activity recorded for ${profile.username} yet.`} />
        </section>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title={`Delete ${profile.username}?`}
        confirmLabel="Delete user"
        busy={busy}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      >
        <p>
          This permanently removes their account, {formatNumber(profile.capture_count)} captures,
          {' '}{formatNumber(profile.note_count)} notes and their tags. Their past activity stays in the log.
        </p>
      </ConfirmDialog>
    </main>
  );
};

const Stat = ({ tone, icon, label, value }) => (
  <div className={`summary-stat tone-${tone}`}>
    <span className="stat-icon" aria-hidden="true"><Icon name={icon} size={20} /></span>
    <span className="summary-text">
      <span className="summary-label">{label}</span>
      <span className="summary-value">{value}</span>
    </span>
  </div>
);

export default AdminUserDetail;
