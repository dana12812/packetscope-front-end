const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const index = async (captureId) => {
  const res = await fetch(`${BASE_URL}/captures/${captureId}/annotations`, { headers: authHeader() });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

const create = async (captureId, payload) => {
  const res = await fetch(`${BASE_URL}/captures/${captureId}/annotations`, {
    method: 'POST',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

const update = async (annotationsId, payload) => {
  const res = await fetch(`${BASE_URL}/annotations/${annotationsId}`, {
    method: 'PUT',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

const remove = async (annotationsId) => {
  const res = await fetch(`${BASE_URL}/annotations/${annotationsId}`, {
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