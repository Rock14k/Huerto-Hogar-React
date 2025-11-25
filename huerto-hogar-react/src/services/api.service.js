import { auth } from '../firebase/config';
import { API_URL, DEFAULT_HEADERS } from '../config/api.config';

/**
 * Servicio para hacer peticiones HTTP al backend Spring Boot
 * Maneja automáticamente la autenticación con Firebase y los headers CORS
 */
class ApiService {
  /**
   * Obtiene el token de autenticación de Firebase
   * @returns {Promise<string|null>} Token de Firebase o null si no hay usuario autenticado
   */
  async getAuthToken() {
    try {
      const user = auth.currentUser;
      if (user) {
        const token = await user.getIdToken();
        return token;
      }
      return null;
    } catch (error) {
      console.error('Error obteniendo token de Firebase:', error);
      return null;
    }
  }

  /**
   * Construye los headers para la petición, incluyendo el token de autenticación si existe
   * @param {Object} customHeaders - Headers personalizados adicionales
   * @returns {Promise<Object>} Headers completos para la petición
   */
  async buildHeaders(customHeaders = {}) {
    const headers = {
      ...DEFAULT_HEADERS,
      ...customHeaders,
    };

    // Agregar token de autenticación si está disponible
    const token = await this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Maneja la respuesta de la petición
   * @param {Response} response - Respuesta de fetch
   * @returns {Promise<Object>} Datos parseados o lanza error
   */
  async handleResponse(response) {
    // Si la respuesta está vacía (status 204 No Content), retornar null
    if (response.status === 204) {
      return null;
    }

    // Intentar parsear como JSON
    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      
      // Si la respuesta no fue exitosa, lanzar error
      if (!response.ok) {
        const error = new Error(data.message || `Error ${response.status}: ${response.statusText}`);
        error.status = response.status;
        error.data = data;
        throw error;
      }
      
      return data;
    }

    // Si no es JSON, retornar el texto
    const text = await response.text();
    if (!response.ok) {
      const error = new Error(text || `Error ${response.status}: ${response.statusText}`);
      error.status = response.status;
      throw error;
    }

    return text;
  }

  /**
   * Realiza una petición GET
   * @param {string} endpoint - Endpoint relativo (ej: '/products')
   * @param {Object} options - Opciones adicionales de fetch
   * @returns {Promise<Object>} Datos de la respuesta
   */
  async get(endpoint, options = {}) {
    const headers = await this.buildHeaders(options.headers);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      headers,
      credentials: 'include', // Importante para CORS con allowCredentials: true
      ...options,
    });

    return this.handleResponse(response);
  }

  /**
   * Realiza una petición POST
   * @param {string} endpoint - Endpoint relativo (ej: '/products')
   * @param {Object} data - Datos a enviar en el cuerpo
   * @param {Object} options - Opciones adicionales de fetch
   * @returns {Promise<Object>} Datos de la respuesta
   */
  async post(endpoint, data = {}, options = {}) {
    const headers = await this.buildHeaders(options.headers);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
      ...options,
    });

    return this.handleResponse(response);
  }

  /**
   * Realiza una petición PUT
   * @param {string} endpoint - Endpoint relativo (ej: '/products/1')
   * @param {Object} data - Datos a enviar en el cuerpo
   * @param {Object} options - Opciones adicionales de fetch
   * @returns {Promise<Object>} Datos de la respuesta
   */
  async put(endpoint, data = {}, options = {}) {
    const headers = await this.buildHeaders(options.headers);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
      ...options,
    });

    return this.handleResponse(response);
  }

  /**
   * Realiza una petición DELETE
   * @param {string} endpoint - Endpoint relativo (ej: '/products/1')
   * @param {Object} options - Opciones adicionales de fetch
   * @returns {Promise<Object>} Datos de la respuesta
   */
  async delete(endpoint, options = {}) {
    const headers = await this.buildHeaders(options.headers);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      headers,
      credentials: 'include',
      ...options,
    });

    return this.handleResponse(response);
  }

  /**
   * Realiza una petición PATCH
   * @param {string} endpoint - Endpoint relativo (ej: '/products/1')
   * @param {Object} data - Datos a enviar en el cuerpo
   * @param {Object} options - Opciones adicionales de fetch
   * @returns {Promise<Object>} Datos de la respuesta
   */
  async patch(endpoint, data = {}, options = {}) {
    const headers = await this.buildHeaders(options.headers);
    
    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      headers,
      credentials: 'include',
      body: JSON.stringify(data),
      ...options,
    });

    return this.handleResponse(response);
  }

  /**
   * Realiza una petición con archivos (multipart/form-data)
   * @param {string} endpoint - Endpoint relativo
   * @param {FormData} formData - FormData con los archivos
   * @param {Object} options - Opciones adicionales de fetch
   * @returns {Promise<Object>} Datos de la respuesta
   */
  async uploadFile(endpoint, formData, options = {}) {
    // Para uploads, no usar Content-Type: application/json
    // El navegador lo establecerá automáticamente con el boundary
    const headers = {};
    
    const token = await this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    // Merge con headers personalizados si existen
    const finalHeaders = {
      ...headers,
      ...(options.headers || {}),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      headers: finalHeaders,
      credentials: 'include',
      body: formData,
      ...options,
    });

    return this.handleResponse(response);
  }
}

// Exportar una instancia única del servicio
export default new ApiService();

