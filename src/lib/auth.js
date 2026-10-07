const KEY = 'nat.pw';

export const getPassword = () => {
  try {
    return localStorage.getItem(KEY) || '';
  } catch {
    return '';
  }
};

export const setPassword = (pw) => {
  try {
    localStorage.setItem(KEY, pw);
  } catch {
    /* ignore */
  }
};

export const clearPassword = () => {
  try {
    localStorage.removeItem(KEY);
  } catch {
    /* ignore */
  }
};

// The server checks the password on every request. This client check only decides which screen to show.
export async function login(pw) {
  let res;
  try {
    res = await fetch('/api/analyze', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-app-password': pw },
      body: JSON.stringify({ action: 'login' }),
    });
  } catch {
    return { ok: false, message: 'Could not reach the server. Check your internet connection.' };
  }
  const data = await res.json().catch(() => ({}));
  if (res.ok) return { ok: true };
  return { ok: false, message: data.error || 'Could not sign in.' };
}
