import { useContext } from 'react';
import { Link } from 'react-router';
import { UserContext } from '../../contexts/UserContext';
import Icon from '../Icon/Icon';

const NotFound = () => {
  const { user } = useContext(UserContext);

  return (
    <main className="not-found">
      <span className="not-found-code" aria-hidden="true">404</span>
      <h1>Page not found</h1>
      <p>The link may be broken, or the page may have been moved or deleted.</p>
      <Link className="btn btn-accent" to="/">
        <Icon name="arrowLeft" size={18} />{user ? 'Back to your dashboard' : 'Back to the home page'}
      </Link>
    </main>
  );
};

export default NotFound;
