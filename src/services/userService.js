const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const currentUser = async () => {
  const config = {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  }
  const res = await fetch(`${BASE_URL}/current_user`, config);

  const data = await res.json();

  if (data.detail) {
    // status lets callers tell a rejected login (401/403) apart from other failures
    throw Object.assign(new Error(data.detail), { status: res.status });
  }

  return data
};

export {
  currentUser,
};
