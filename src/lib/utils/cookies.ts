import Cookies from 'js-cookie';

/**
 * Client-side cookie işlemleri için fonksiyonlar
 */
export const setClientCookie = (name: string, value: string, days: number = 7) => {
  Cookies.set(name, value, { expires: days, path: '/' });
};

export const getClientCookie = (name: string): string | null => {
  const cookie = Cookies.get(name);
  return cookie || null;
};

export const removeClientCookie = (name: string) => {
  Cookies.remove(name, { path: '/' });
};
