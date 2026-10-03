const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}/captures`;

const authHeader = () => ({
  'Authorization': `Bearer ${localStorage.getItem('token')}`,
});

const index = async () => {
  const res = await fetch(BASE_URL, { headers: authHeader() });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

const show = async (captureId) => {
  const res = await fetch(`${BASE_URL}/${captureId}`, { headers: authHeader() });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

const create = async (file) => {
  const formData = new FormData();
  formData.append('file', file);
  const res = await fetch(BASE_URL, {
    method: 'POST',
    headers: authHeader(),
    body: formData,
  });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

const update = async (captureId, payload) => {
  const res = await fetch(`${BASE_URL}/${captureId}`, {
    method: 'PUT',
    headers: { ...authHeader(), 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (data.detail) throw new Error(data.detail);
  return data;
};

const remove = async (captureId) => {
  const res = await fetch(`${BASE_URL}/${captureId}`, {
    method: 'DELETE',
    headers: authHeader(),
  });
  if (!res.ok) {
    const data = await res.json();
    throw new Error(data.detail || 'Delete failed');
  }
  return true;
};

export { index, show, create, update, remove };
