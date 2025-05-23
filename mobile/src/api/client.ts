import axios, { AxiosRequestConfig, AxiosResponse, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getTokens, saveTokens, removeTokens } from '../utils/authStorage';
import { TokenPair } from '../types/auth';

const API_URL = 'https://e9f5-83-6-9-20.ngrok-free.app';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

let cachedTokens = null;

const getLatestTokens = async () => {
  if (cachedTokens) {
    console.log('Using cached tokens');
    return cachedTokens;
  }
  
  const storedTokens = await getTokens();
  if (storedTokens) {
    cachedTokens = storedTokens;
  }
  return storedTokens;
};

const updateCachedTokens = (tokens) => {
  if (tokens) {
    console.log('Updating cached tokens');
    cachedTokens = tokens;
  } else {
    console.log('Clearing cached tokens');
    cachedTokens = null;
  }
};

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    console.log('Request URL:', config.url);
    
    const tokens = await getLatestTokens();
    
    if (tokens?.accessToken) {
      console.log('Setting Authorization header with token:', tokens.accessToken.slice(0, 10) + '...');
      config.headers.set('Authorization', `Bearer ${tokens.accessToken}`);
      
      if (config.url?.includes('/api/user/token/refresh') && tokens.refreshToken) {
        console.log('Setting X-Refresh-Token header with token:', tokens.refreshToken.slice(0, 10) + '...');
        config.headers.set('X-Refresh-Token', tokens.refreshToken);
      }
    } else {
      console.log("Unable to set header - no tokens available");
    }
    
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };
    
    if (error.response?.status === 401 && 
        !originalRequest._retry && 
        error.config.url !== '/api/user/token/refresh') {
      
      originalRequest._retry = true;
      
      try {
        const tokens = await getLatestTokens();
        if (!tokens) {
          throw new Error('No tokens available');
        }
        
        console.log('Refreshing tokens');
        
        updateCachedTokens(null);
        
        const response = await apiClient.post('/api/user/token/refresh', {});
        
        const newAccessToken = response.headers['authorization']?.replace('Bearer ', '');
        const newRefreshToken = response.headers['x-refresh-token'];
        
        if (newAccessToken && newRefreshToken) {
          
          const newTokens: TokenPair = {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
          };
          
          await saveTokens(newTokens);
          
          updateCachedTokens(newTokens);
          
          const method = originalRequest.method?.toLowerCase() || 'get';
          
          const retryUrl = originalRequest.url || '';
          const retryData = originalRequest.data || {};
          
          if (method === 'get') {
            return apiClient.get(retryUrl);
          } else if (method === 'post') {
            return apiClient.post(retryUrl, retryData);
          } else if (method === 'put') {
            return apiClient.put(retryUrl, retryData);
          } else if (method === 'delete') {
            return apiClient.delete(retryUrl);
          } else {
            return apiClient.request({
              url: retryUrl,
              method: method,
              data: retryData
            });
          }
        } else {
          throw new Error('Invalid token response - missing tokens');
        }
      } catch (refreshError) {
        await removeTokens();
        updateCachedTokens(null);
        return Promise.reject(refreshError);
      }
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;