/**
 * Generic API service for making REST API calls to various services
 * Supports common services like Sonarr, Radarr, Readarr, etc.
 */

/**
 * Generic API client for making HTTP requests
 */
class ApiClient {
  constructor(baseUrl, apiKey = null, headers = {}) {
    this.baseUrl = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl
    this.apiKey = apiKey
    this.defaultHeaders = {
      'Content-Type': 'application/json',
      ...headers,
    }
    
    // Add API key to headers if provided
    if (apiKey) {
      this.defaultHeaders['X-Api-Key'] = apiKey
    }
  }

  /**
   * Make a GET request
   * @param {string} endpoint - The API endpoint
   * @param {Object} params - Query parameters
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} Response data
   */
  async get(endpoint, params = {}, headers = {}) {
    return this._makeRequest('GET', endpoint, null, params, headers)
  }

  /**
   * Make a POST request
   * @param {string} endpoint - The API endpoint
   * @param {Object} data - Request body data
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} Response data
   */
  async post(endpoint, data = null, headers = {}) {
    return this._makeRequest('POST', endpoint, data, {}, headers)
  }

  /**
   * Make a PUT request
   * @param {string} endpoint - The API endpoint
   * @param {Object} data - Request body data
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} Response data
   */
  async put(endpoint, data = null, headers = {}) {
    return this._makeRequest('PUT', endpoint, data, {}, headers)
  }

  /**
   * Make a DELETE request
   * @param {string} endpoint - The API endpoint
   * @param {Object} headers - Additional headers
   * @returns {Promise<Object>} Response data
   */
  async delete(endpoint, headers = {}) {
    return this._makeRequest('DELETE', endpoint, null, {}, headers)
  }

  /**
   * Internal method to make HTTP requests
   * @private
   */
  async _makeRequest(method, endpoint, data, params, headers) {
    try {
      const url = new URL(`${this.baseUrl}${endpoint}`)
      
      // Add query parameters
      Object.keys(params).forEach(key => {
        if (params[key] !== null && params[key] !== undefined) {
          url.searchParams.append(key, params[key])
        }
      })

      const config = {
        method,
        headers: {
          ...this.defaultHeaders,
          ...headers,
        },
      }

      // Add request body for POST/PUT requests
      if (data && (method === 'POST' || method === 'PUT')) {
        config.body = JSON.stringify(data)
      }

      const response = await fetch(url.toString(), config)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status} - ${response.statusText}`)
      }

      // Handle empty responses
      const contentType = response.headers.get('content-type')
      if (contentType && contentType.includes('application/json')) {
        return await response.json()
      } else {
        return await response.text()
      }
    } catch (error) {
      console.error(`API request failed: ${method} ${endpoint}`, error)
      throw error
    }
  }
}

/**
 * Service factory for creating API clients for common services
 */
export class ApiService {
  /**
   * Create a Sonarr API client
   * @param {string} baseUrl - Sonarr base URL
   * @param {string} apiKey - Sonarr API key
   * @returns {ApiClient} Configured Sonarr API client
   */
  static createSonarrClient(baseUrl, apiKey) {
    return new ApiClient(`${baseUrl}/api/v3`, apiKey)
  }

  /**
   * Create a Radarr API client
   * @param {string} baseUrl - Radarr base URL
   * @param {string} apiKey - Radarr API key
   * @returns {ApiClient} Configured Radarr API client
   */
  static createRadarrClient(baseUrl, apiKey) {
    return new ApiClient(`${baseUrl}/api/v3`, apiKey)
  }

  /**
   * Create a Readarr API client
   * @param {string} baseUrl - Readarr base URL
   * @param {string} apiKey - Readarr API key
   * @returns {ApiClient} Configured Readarr API client
   */
  static createReadarrClient(baseUrl, apiKey) {
    return new ApiClient(`${baseUrl}/api/v1`, apiKey)
  }

  /**
   * Create a Lidarr API client
   * @param {string} baseUrl - Lidarr base URL
   * @param {string} apiKey - Lidarr API key
   * @returns {ApiClient} Configured Lidarr API client
   */
  static createLidarrClient(baseUrl, apiKey) {
    return new ApiClient(`${baseUrl}/api/v1`, apiKey)
  }

  /**
   * Create a generic API client
   * @param {string} baseUrl - Service base URL
   * @param {string} apiKey - API key (optional)
   * @param {Object} headers - Additional headers (optional)
   * @returns {ApiClient} Configured API client
   */
  static createGenericClient(baseUrl, apiKey = null, headers = {}) {
    return new ApiClient(baseUrl, apiKey, headers)
  }
}

export default ApiClient

