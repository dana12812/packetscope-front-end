import { useEffect, useMemo, useState, useContext } from 'react';
import { Link } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import * as adminService from '../../services/adminService';
import Icon from '../Icon/Icon';
import ConfirmDialog from '../ConfirmDialog/ConfirmDialog';
import ActivityFeed from './ActivityFeed';
import RoleBadge from './RoleBadge';
import { formatNumber, formatWhen } from '../../lib/helpers/format';

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const [users, setUsers] = useState([]);
  const [activity, setActivity] = useState([]);
  const [activityUser, setActivityUser] = useState('');
  const [filter, setFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pendingDelete, setPendingDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [userList, feed] = await Promise.all([adminService.listUsers(), adminService.listActivity({ limit: 50 })]);
        setUsers(userList);
        setActivity(feed);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleActivityFilter = async (userId) => {
    setActivityUser(userId);
    try {
      setActivity(await adminService.listActivity({ userId: userId || undefined, limit: 50 }));
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await adminService.removeUser(pendingDelete.id);
      setUsers(users.filter((u) => u.id !== pendingDelete.id));
      setActivity(await adminService.listActivity({ userId: activityUser || undefined, limit: 50 }));
      setPendingDelete(null);
    } catch (err) {
      setError(err.message);
      setPendingDelete(null);
    } finally {
      setDeleting(false);
    }
  };

  const totals = useMemo(() => ({
    users: users.length,
    admins: users.filter((u) => u.role === 'admin').length,
    captures: users.reduce((sum, u) => sum + u.capture_count, 0),
    notes: users.reduce((sum, u) => sum + u.note_count, 0),
  }), [users]);

  const q = filter.trim().toLowerCase();
  const visibleUsers = q
    ? users.filter((u) => u.username.toLowerCase().includes(q) || u.email.toLowerCase().includes(q))
    : users;

  if (loading) return <p className="loading"><span className="spinner" aria-hidden="true" />Loading users…</p>;

  return (
    <main className="admin">
      <header className="page-header">
        <div>
          <p className="page-kicker"><Icon name="shield" size={16} />Admin</p>
          <h1>Users &amp; activity</h1>
          <p className="page-sub">Manage accounts, open anyone's captures and see who did what.</p>
        </div>
      </header>

      {error && <p className="error" role="alert">{error}</p>}

      <section className="admin-stats" aria-label="Totals">
        <AdminStat tone="aqua" icon="network" label="Users" value={totals.users} />
        <AdminStat tone="purple" icon="shield" label="Admins" value={totals.admins} />
        <AdminStat tone="blue" icon="fileText" label="Captures" value={totals.captures} />
        <AdminStat tone="yellow" icon="note" label="Notes" value={totals.notes} />
      </section>

      <div className="admin-grid">
        <section className="card" aria-labelledby="users-title">
          <header className="card-head">
            <h2 id="users-title"><span className="head-icon tone-aqua"><Icon name="network" size={18} /></span>Users</h2>
            <label className="sr-only" htmlFor="user-filter">Filter users</label>
            <input
              id="user-filter"
              className="filter-input"
              type="search"
              placeholder="Filter by name or email"
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
          </header>

          {visibleUsers.length === 0 ? (
            <p className="empty-state">No users match that filter.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th scope="col">User</th>
                  <th scope="col">Role</th>
                  <th scope="col" className="num">Captures</th>
                  <th scope="col" className="num">Notes</th>
                  <th scope="col">Last active</th>
                  <th scope="col"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {visibleUsers.map((u) => (
                  <tr key={u.id}>
                    <td>
                      <div className="user-cell">
                        <span className="avatar avatar-sm" aria-hidden="true">{u.username.charAt(0).toUpperCase()}</span>
                        <span className="user-cell-text">
                          <Link className="user-cell-name" to={`/admin/users/${u.id}`}>{u.username}</Link>
                          <span className="user-cell-email">{u.email}</span>
                        </span>
                      </div>
                    </td>
                    <td data-label="Role"><RoleBadge role={u.role} /></td>
                    <td className="num" data-label="Captures">{formatNumber(u.capture_count)}</td>
                    <td className="num" data-label="Notes">{formatNumber(u.note_count)}</td>
                    <td data-label="Last active">{u.last_active ? formatWhen(u.last_active) : <span className="muted">Not yet</span>}</td>
                    <td className="cell-actions">
                      <Link className="btn btn-outline" to={`/admin/users/${u.id}`} aria-label={`View ${u.username}`}>View</Link>
                      {String(u.id) !== String(user.sub) && (
                        <button type="button" className="icon-btn icon-btn-danger" onClick={() => setPendingDelete(u)} aria-label={`Delete ${u.username}`}>
                          <Icon name="trash" size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>

        <section className="card" aria-labelledby="feed-title">
          <header className="card-head">
            <h2 id="feed-title"><span className="head-icon tone-purple"><Icon name="clock" size={18} /></span>Activity</h2>
            <label className="sr-only" htmlFor="activity-user">Show activity for</label>
            <select id="activity-user" className="filter-input" value={activityUser} onChange={(e) => handleActivityFilter(e.target.value)}>
              <option value="">Everyone</option>
              {users.map((u) => <option key={u.id} value={u.id}>{u.username}</option>)}
            </select>
          </header>
          <ActivityFeed items={activity} />
        </section>
      </div>

      <ConfirmDialog
        open={Boolean(pendingDelete)}
        title={`Delete ${pendingDelete?.username}?`}
        confirmLabel="Delete user"
        busy={deleting}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      >
        <p>
          This permanently removes their account, {formatNumber(pendingDelete?.capture_count)} captures,
          {' '}{formatNumber(pendingDelete?.note_count)} notes and their tags. Their past activity stays in the log.
        </p>
      </ConfirmDialog>
    </main>
  );
};

const AdminStat = ({ tone, icon, label, value }) => (
  <div className={`summary-stat tone-${tone}`}>
    <span className="stat-icon" aria-hidden="true"><Icon name={icon} size={20} /></span>
    <span className="summary-text">
      <span className="summary-label">{label}</span>
      <span className="summary-value">{formatNumber(value)}</span>
    </span>
  </div>
);

export default AdminDashboard;
