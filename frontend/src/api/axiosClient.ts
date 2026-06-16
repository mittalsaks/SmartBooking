import axios from 'axios';

const axiosClient = axios.create({
  baseURL: 'https://smartbooking-pmww.onrender.com/api',
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  const headers = config.headers ?? {};

  if (token) {
    (headers as Record<string, string>).Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete (headers as Record<string, string>)['Content-Type'];
  } else {
    (headers as Record<string, string>)['Content-Type'] = 'application/json';
  }

  config.headers = headers;
  return config;
});

axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;