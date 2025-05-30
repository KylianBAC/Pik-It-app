import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_URL = 'http://kykonline.ddns.net:5000';

// Enregistrer un nouvel utilisateur
export async function register({ username, email, password }) {
  const response = await axios.post(`${API_URL}/user/register`, { username, email, password });
  return response.data;
}

// Connexion d'un utilisateur
export async function login({ username, password }) {
  const response = await axios.post(`${API_URL}/user/login`, { username, password });
  const { access_token } = response.data;
  await AsyncStorage.setItem('token', access_token);
  return access_token;
}

// Récupérer le token stocké
export async function getToken() {
  return await AsyncStorage.getItem('token');
}

// Déconnexion (supprimer token)
export async function logout() {
  await AsyncStorage.removeItem('token');
}

// Créer un axios instance avec token
export async function apiClient() {
  const token = await getToken();
  const client = axios.create({
    baseURL: API_URL,
    headers: { Authorization: token ? `Bearer ${token}` : '' },
  });
  return client;
}