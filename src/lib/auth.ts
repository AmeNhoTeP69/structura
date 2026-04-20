const AUTH_TOKEN_KEY = 'structura_token';
const AUTH_USER_KEY = 'structura_user';

export function getAuthToken() {
  return localStorage.getItem(AUTH_TOKEN_KEY);
}

export function setAuthToken(token: string) {
  localStorage.setItem(AUTH_TOKEN_KEY, token);
}

export function clearAuthToken() {
  localStorage.removeItem(AUTH_TOKEN_KEY);
}

export function clearStoredUser() {
  localStorage.removeItem(AUTH_USER_KEY);
}

export function getStoredUser<T>() {
  const raw = localStorage.getItem(AUTH_USER_KEY);
  return raw ? (JSON.parse(raw) as T) : null;
}

export function setStoredUser<T>(user: T) {
  localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
}

export function getAuthHeaders() {
  const token = getAuthToken();

  return token
    ? {
        Authorization: `Bearer ${token}`,
      }
    : {};
}
