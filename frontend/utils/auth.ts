const TOKEN_KEY = 'token';

export const saveToken = (token: string) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(TOKEN_KEY, token);
    document.cookie = `${TOKEN_KEY}=${token}; path=/`;
  }
};

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  
  // First try to get from localStorage
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) return token;

  // If not in localStorage, try to get from cookies
  const cookies = document.cookie.split(';');
  for (let cookie of cookies) {
    const [name, value] = cookie.trim().split('=');
    if (name === TOKEN_KEY) return value;
  }

  return null;
};

export const removeToken = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(TOKEN_KEY);
    document.cookie = `${TOKEN_KEY}=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT`;
  }
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
}; 