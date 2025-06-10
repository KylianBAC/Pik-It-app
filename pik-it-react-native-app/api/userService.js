import { apiClient } from './auth';

// Récupérer le profil complet de l'utilisateur
export async function getUserProfile() {
  try {
    const client = await apiClient();
    const response = await client.get('/users/profile');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    throw error;
  }
}

// Récupérer les statistiques de l'utilisateur
export async function getUserStats() {
  try {
    const client = await apiClient();
    const response = await client.get('/users/stats');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des stats:', error);
    throw error;
  }
}

// Récupérer les photos de l'utilisateur
export async function getUserPhotos() {
  try {
    const client = await apiClient();
    const response = await client.get('/photos/me');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des photos:', error);
    throw error;
  }
}

// Récupérer les récompenses de l'utilisateur
export async function getUserRewards(userId) {
  try {
    const client = await apiClient();
    const response = await client.get(`/rewards?user_id=${userId}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des récompenses:', error);
    throw error;
  }
}