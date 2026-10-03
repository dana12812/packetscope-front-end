import { Link } from 'react-router';
import Icon from '../Icon/Icon';
import { describeActivity, formatDateTime } from '../../lib/helpers/format';

// Timeline of activity-log rows. Captures that still exist are linked; deleted ones are plain text.
const ActivityFeed = ({ items, showActor = true, empty = 'No activity recorded yet.' }) => {
  if (!items.length) return <p className="empty-state">{empty}</p>;

  return (
    <ol className="activity-feed">
      {items.map((item) => {
        const { verb, icon, tone } = describeActivity(item.action);
        const linkable = item.capture_exists;
        return (
          <li key={item.id} className="activity-item">
            <span className={`activity-icon tone-${tone}`} aria-hidden="true"><Icon name={icon} size={16} /></span>
            <p className="activity-text">
              {showActor && (
                item.actor_id
                  ? <Link className="activity-actor" to={`/admin/users/${item.actor_id}`}>{item.actor_username}</Link>
                  : <strong className="activity-actor">{item.actor_username}</strong>
              )}
              {showActor ? ' ' : ''}{showActor ? verb : verb.charAt(0).toUpperCase() + verb.slice(1)}
              {item.target && (
                <>
                  {' '}
                  {linkable
                    ? <Link className="activity-target" to={`/captures/${item.capture_id}`} state={{ fromAdmin: true }}>{item.target}</Link>
                    : <span className="activity-target">{item.target}</span>}
                </>
              )}
            </p>
            <time className="activity-time" dateTime={item.created_at}>{formatDateTime(item.created_at)}</time>
          </li>
        );
      })}
    </ol>
  );
};

export default ActivityFeed;
