import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { ACCESS_TOKEN, REFRESH_TOKEN } from './constants';
import { GENERATE_ACCESS_TOKEN_URL } from './api_urls';
import api from './api';

export const isAuthenticated = async () => {
  const token = Cookies.get(ACCESS_TOKEN);

  if (!token) {
    return false;
  }

  // decode JWT token to get expiry date
  const decodedToken = jwtDecode(token);
  const expiryDate = new Date(decodedToken.exp * 1000);
  const now = Date.now();

  // if token is expired, refresh it
  if (now >= expiryDate) {
    const refreshToken = Cookies.get(REFRESH_TOKEN);

    try {
      const response = await api.post(GENERATE_ACCESS_TOKEN_URL, {
        refresh: refreshToken,
      });

      if (response.status === 200) {
        const { access } = response.data;
        Cookies.set(ACCESS_TOKEN, access, { expires: 7 });
        return true;
      }
    } catch (error) {
      return false;
    }

    return false;
  }

  return true;
};