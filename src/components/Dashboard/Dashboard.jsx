import { useContext } from 'react';
import { UserContext } from '../../contexts/UserContext';

const Dashboard = () => {
  const { user } = useContext(UserContext);

  return (
    <main>
      <h1>Welcome, {user.username}</h1>
      <p>Your captures will appear here.</p>
    </main>
  );
};

export default Dashboard;
