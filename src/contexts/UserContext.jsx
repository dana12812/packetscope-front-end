import { createContext, useEffect, useState } from 'react';
import { getUserFromToken, removeToken } from '../lib/helpers/jwt-helpers';
import { currentUser } from '../services/userService';

const UserContext = createContext();

function UserProvider({ children }) {
  const [user, setUser] = useState(getUserFromToken())
  const value = { user, setUser }

  // On load, confirm the saved login with the server: an expired token or a deleted
  // account signs out cleanly, and a role changed by an admin is picked up right away.
  const signedInId = user?.sub
  useEffect(() => {
    if (!signedInId) return;
    async function verifySession() {
      try {
        const account = await currentUser();
        setUser((current) => (current ? { ...current, role: account.role } : current));
      } catch (err) {
        if (err.status === 401 || err.status === 403) {
          removeToken();
          setUser(null);
        }
      }
    }
    verifySession();
  }, [signedInId]);

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  );
};

export { UserProvider, UserContext };
