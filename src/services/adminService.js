const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/admin`;

const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const listUsers = async () => {
  const res = await fetch(`${BASE_URL}/users`, { headers: authHeader() });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

const showUser = async (userId) => {
  const res = await fetch(`${BASE_URL}/users/${userId}`, { headers: authHeader() });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

const updateRole = async (userId, role) => {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'PATCH',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify({ role }),
  });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

const removeUser = async (userId) => {
  const res = await fetch(`${BASE_URL}/users/${userId}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Delete failed');
  }
  return true;
};

const listActivity = async ({ userId, limit = 100 } = {}) => {
  const params = new URLSearchParams({ limit });
  if (userId) params.set('user_id', userId);
  const res = await fetch(`${BASE_URL}/activity?${params}`, { headers: authHeader() });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

export { listUsers, showUser, updateRole, removeUser, listActivity };
