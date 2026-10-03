export function getUserFromToken() {
  const token = localStorage.getItem('token');
  return parseToken(token)
}

export function parseToken(token) {
  if (!token) return null
  const payload = token.split('.')[1]
  const tokenJSON = atob(payload)
  return JSON.parse(tokenJSON)
}

export function removeToken() {
  window.localStorage.removeItem('token')
}

export function registerToken(token) {
  window.localStorage.setItem('token', token);
}
