const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/tags`;

const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const index = async () => {
  const res = await fetch(BASE_URL, { headers: authHeader() });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

const create = async (payload) => {
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

const update = async (tagId, payload) => {
  const res = await fetch(`${BASE_URL}/${tagId}`, {
    method: 'PUT',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

const remove = async (tagId) => {
  const res = await fetch(`${BASE_URL}/${tagId}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Delete failed');
  }
  return true;
};

export { index, create, update, remove };
