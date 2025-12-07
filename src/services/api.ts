import axios from 'axios';
import { ENV } from '../config/env';
import * as SecureStore from 'expo-secure-store';

let token: string | null = null;

export const api = axios.create({
  baseURL: ENV.apiUrl,
  timeout: 30000,
});

api.interceptors.request.use(async (config) => {
  if (!token) token = await SecureStore.getItemAsync('jwt_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  const fullUrl = (config.baseURL || '') + (config.url || '');
  console.log('[AXIOS REQUEST]', {
    url: fullUrl,
    method: config.method,
    headers: config.headers,
    token: token,
  });
  return config;
});

api.interceptors.response.use(
  response => response,
  err => {
    console.log('[AXIOS ERROR]', {
      message: err.message,
      config: err.config,
      code: err.code,
      response: err.response,
      request: err.request,
    });
      if (err.response) {
        throw new Error(err.response.data?.message || 'Error en la API');
      } else if (err.request) {
        throw new Error('No se pudo conectar con el servidor');
      } else {
        throw new Error('Error desconocido');
      }
  }
);

// Verifica el estado del backend
export async function checkApi() {
  try {
    console.log(ENV.apiUrl);
    const [health, status] = await Promise.all([
      api.get('/health'),
      api.get('/status'),
    ]);
    return { health: health.data, status: status.data };
  } catch (err: any) {
    console.log('checkApi error:', err.message, err);
    throw new Error(err.message || 'No se pudo conectar con el backend');
  }
}

// Listar rifas
export async function listRaffles() {
  try {
    console.log(ENV.apiUrl);
    const res = await api.get('/raffles');
    return res.data;
  } catch (err: any) {
    console.log('listRaffles error:', err.message, err);
    throw new Error(err.message || 'No se pudo obtener la lista de rifas');
  }
}

// Crear rifa
export async function createRaffle(raffle: { title: string; description: string }) {
  try {
    console.log(ENV.apiUrl);
    const res = await api.post('/raffles', raffle);
    return res.data;
  } catch (err: any) {
    console.log('createRaffle error:', err.message, err);
    throw new Error(err.message || 'No se pudo crear la rifa');
  }
}

// Login y manejo de JWT
export async function login(credentials: { email: string; password: string }) {
  try {
    console.log(ENV.apiUrl);
    const res = await api.post('/login', credentials);
    token = res.data.token;
    await SecureStore.setItemAsync('jwt_token', token ?? '');
    return token;
  } catch (err: any) {
    console.log('login error:', err.message, err);
    throw new Error(err.message || 'No se pudo iniciar sesión');
  }
}

export async function loadToken() {
  token = await SecureStore.getItemAsync('jwt_token');
  return token;
}

export async function logout() {
  token = null;
  await SecureStore.deleteItemAsync('jwt_token');
}

