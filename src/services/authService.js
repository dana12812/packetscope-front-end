import { parseToken, registerToken } from "../lib/helpers/jwt-helpers";

const BASE_URL = `${import.meta.env.VITE_BACK_END_SERVER_URL}`;

const signUp = async (formData) => {
  const res = await fetch(`${BASE_URL}/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (data.detail) {
    throw new Error(data.detail);
  }

  if (data.token) {
    registerToken(data.token)
    return parseToken(data.token)
  }

  throw new Error('Invalid response from server');
};

const signIn = async (formData) => {
  const res = await fetch(`${BASE_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });

  const data = await res.json();

  if (data.detail) {
    throw new Error(data.detail);
  }

  if (data.token) {
    registerToken(data.token)
    return parseToken(data.token)
  }

  throw new Error('Invalid response from server');
};

export {
  signUp,
  signIn,
};
