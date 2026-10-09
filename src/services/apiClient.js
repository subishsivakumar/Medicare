/**
 * MediCare API Client Configuration
 * ----------------------------------------------------
 * Pre-configured for Java Spring Boot REST API integration.
 * In production / backend mode:
 * - Spring Boot runs on: http://localhost:8080/api
 * - Backend uses Spring Data JPA with MySQL database.
 * 
 * To switch to real Spring Boot backend:
 * 1. Start your Spring Boot application on port 8080.
 * 2. Set USE_MOCK_DATA = false below (or define VITE_USE_MOCK=false in .env).
 */

export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080/api';
export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK !== 'false'; // defaults to true for college demo

export const getAuthHeaders = () => {
  const token = localStorage.getItem('medicare_auth_token');
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  const config = {
    ...options,
    headers: {
      ...getAuthHeaders(),
      ...(options.headers || {})
    }
  };

  try {
    const response = await fetch(url, config);
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `HTTP error ${response.status}: ${response.statusText}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`[API Error] ${options.method || 'GET'} ${url}:`, error.message);
    throw error;
  }
}
