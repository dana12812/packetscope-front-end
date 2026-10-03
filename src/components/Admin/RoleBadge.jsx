// "Admin" / "User" pill — text label, so the role never relies on colour alone
const RoleBadge = ({ role }) => (
  <span className={`badge ${role === 'admin' ? 'badge-admin' : 'badge-user'}`}>{role === 'admin' ? 'Admin' : 'User'}</span>
);

export default RoleBadge;
