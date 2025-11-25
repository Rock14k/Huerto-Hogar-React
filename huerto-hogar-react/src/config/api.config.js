/**
 * Configuración de la API del backend
 * La URL base se puede configurar mediante variables de entorno
 */

// URL base del backend Spring Boot
// En desarrollo: http://localhost:8080
// En producción: usar la URL del servidor desplegado
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';

// Prefijo de la API (según la configuración CORS del backend: /api/**)
const API_PREFIX = '/api';

// URL completa de la API
export const API_URL = `${API_BASE_URL}${API_PREFIX}`;

// Configuración por defecto de headers
export const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

// Exportar la URL base para uso directo si es necesario
export default {
  API_BASE_URL,
  API_URL,
  DEFAULT_HEADERS,
};

