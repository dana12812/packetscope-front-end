import { Link } from 'react-router';
import Icon from '../Icon/Icon';
import { Logo } from '../Sidebar/Sidebar';
import NetworkField from '../NetworkField/NetworkField';

// Split screen shared by sign in and sign up: brand panel on the left, form on the right.
const AuthLayout = ({ title, subtitle, footer, children }) => (
  <div className="auth-shell">
    <aside className="auth-brand" aria-label="About PacketScope">
      <NetworkField quiet />
      <Link to="/" className="auth-brand-logo" aria-label="PacketScope home"><Logo /></Link>
      <div className="auth-brand-copy">
        <p className="auth-brand-title">Turn packet captures into <span>network intelligence</span></p>
        <ul className="auth-brand-points">
          <li><Icon name="check" size={18} />Analyze .pcap and .pcapng files with Scapy</li>
          <li><Icon name="check" size={18} />See protocols, top talkers and services</li>
          <li><Icon name="check" size={18} />Keep every capture, tag and note in one place</li>
        </ul>
      </div>
      <p className="auth-brand-foot"><Icon name="lock" size={14} />Only you and your workspace admins can see your captures</p>
    </aside>

    <main className="auth-main">
      <Link to="/" className="auth-mobile-logo" aria-label="PacketScope home"><Logo /></Link>
      <div className="auth-card">
        <h1>{title}</h1>
        <p className="auth-subtitle">{subtitle}</p>
        {children}
      </div>
      <p className="auth-switch">{footer}</p>
    </main>
  </div>
);

export default AuthLayout;
