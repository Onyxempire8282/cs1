// API Utility Functions
import { APP_CONFIG, API_ENDPOINTS, ERROR_MESSAGES } from './constants.js';

class ApiClient {
    constructor() {
        this.baseUrl = APP_CONFIG.api.baseUrl;
        this.timeout = APP_CONFIG.api.timeout;
        this.retries = APP_CONFIG.api.retries;
        this.authToken = null;
        this.refreshToken = null;
        
        // Set up default headers
        this.defaultHeaders = {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        };
        
        // Initialize auth tokens from localStorage
        this.loadTokens();
    }

    // Token management
    loadTokens() {
        try {
            this.authToken = localStorage.getItem('claim-cipher-auth-token');
            this.refreshToken = localStorage.getItem('claim-cipher-refresh-token');
        } catch (error) {
            console.warn('Failed to load tokens from localStorage');
        }
    }

    saveTokens(authToken, refreshToken) {
        this.authToken = authToken;
        this.refreshToken = refreshToken;
        
        try {
            if (authToken) {
                localStorage.setItem('claim-cipher-auth-token', authToken);
            }
            if (refreshToken) {
                localStorage.setItem('claim-cipher-refresh-token', refreshToken);
            }
        } catch (error) {
            console.warn('Failed to save tokens to localStorage');
        }
    }

    clearTokens() {
        this.authToken = null;
        this.refreshToken = null;
        
        try {
            localStorage.removeItem('claim-cipher-auth-token');
            localStorage.removeItem('claim-cipher-refresh-token');
        } catch (error) {
            console.warn('Failed to clear tokens from localStorage');
        }
    }

    // Request headers
    getHeaders(customHeaders = {}) {
        const headers = { ...this.defaultHeaders, ...customHeaders };
        
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        
        return headers;
    }

    // Core request method
    async request(endpoint, options = {}) {
        const {
            method = 'GET',
            body = null,
            headers = {},
            timeout = this.timeout,
            retries = this.retries
        } = options;

        const url = `${this.baseUrl}${endpoint}`;
        const requestHeaders = this.getHeaders(headers);

        const requestOptions = {
            method,
            headers: requestHeaders,
            body: body ? JSON.stringify(body) : null
        };

        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);
        requestOptions.signal = controller.signal;

        let lastError;

        for (let attempt = 0; attempt <= retries; attempt++) {
            try {
                const response = await fetch(url, requestOptions);
                clearTimeout(timeoutId);

                // Handle authentication errors
                if (response.status === 401) {
                    const refreshed = await this.refreshAuthToken();
                    if (refreshed) {
                        // Retry with new token
                        requestOptions.headers = this.getHeaders(headers);
                        const retryResponse = await fetch(url, requestOptions);
                        return await this.handleResponse(retryResponse);
                    } else {
                        // Refresh failed, redirect to login
                        this.handleAuthError();
                        throw new ApiError('Authentication failed', 401);
                    }
                }

                return await this.handleResponse(response);

            } catch (error) {
                lastError = error;
                
                if (attempt === retries) {
                    break;
                }

                // Exponential backoff
                const delay = Math.pow(2, attempt) * 1000;
                await this.delay(delay);
            }
        }

        clearTimeout(timeoutId);
        throw this.handleError(lastError);
    }

    // Response handling
    async handleResponse(response) {
        const contentType = response.headers.get('content-type');
        
        let data;
        if (contentType && contentType.includes('application/json')) {
            data = await response.json();
        } else {
            data = await response.text();
        }

        if (!response.ok) {
            throw new ApiError(
                data.message || ERROR_MESSAGES.GENERIC_ERROR,
                response.status,
                data
            );
        }

        return {
            data,
            status: response.status,
            headers: response.headers
        };
    }

    // Error handling
    handleError(error) {
        if (error.name === 'AbortError') {
            return new ApiError('Request timeout', 408);
        }

        if (!navigator.onLine) {
            return new ApiError(ERROR_MESSAGES.NETWORK_ERROR, 0);
        }

        if (error instanceof ApiError) {
            return error;
        }

        return new ApiError(ERROR_MESSAGES.GENERIC_ERROR, 0, error);
    }

    // Authentication
    async refreshAuthToken() {
        if (!this.refreshToken) {
            return false;
        }

        try {
            const response = await fetch(`${this.baseUrl}${API_ENDPOINTS.auth.refresh}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh_token: this.refreshToken
                })
            });

            if (response.ok) {
                const data = await response.json();
                this.saveTokens(data.access_token, data.refresh_token);
                return true;
            }
        } catch (error) {
            console.warn('Token refresh failed:', error);
        }

        return false;
    }

    handleAuthError() {
        this.clearTokens();
        
        // Dispatch auth error event
        const event = new CustomEvent('auth-error', {
            detail: { message: 'Authentication required' }
        });
        document.dispatchEvent(event);
    }

    // HTTP methods
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, body = null, options = {}) {
        return this.request(endpoint, { ...options, method: 'POST', body });
    }

    async put(endpoint, body = null, options = {}) {
        return this.request(endpoint, { ...options, method: 'PUT', body });
    }

    async patch(endpoint, body = null, options = {}) {
        return this.request(endpoint, { ...options, method: 'PATCH', body });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    // File upload
    async uploadFile(endpoint, file, additionalData = {}) {
        const formData = new FormData();
        formData.append('file', file);
        
        Object.keys(additionalData).forEach(key => {
            formData.append(key, additionalData[key]);
        });

        const headers = {};
        if (this.authToken) {
            headers['Authorization'] = `Bearer ${this.authToken}`;
        }
        // Don't set Content-Type for FormData, let browser set it

        const response = await fetch(`${this.baseUrl}${endpoint}`, {
            method: 'POST',
            headers,
            body: formData
        });

        return await this.handleResponse(response);
    }

    // Utility methods
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Build query string
    buildQueryString(params) {
        const searchParams = new URLSearchParams();
        
        Object.keys(params).forEach(key => {
            const value = params[key];
            if (value !== null && value !== undefined && value !== '') {
                searchParams.append(key, value);
            }
        });
        
        return searchParams.toString();
    }

    // Interpolate URL parameters
    interpolateUrl(url, params) {
        return url.replace(/{(\w+)}/g, (match, key) => {
            return params[key] || match;
        });
    }
}

// Custom error class
class ApiError extends Error {
    constructor(message, status = 0, data = null) {
        super(message);
        this.name = 'ApiError';
        this.status = status;
        this.data = data;
    }

    isNetworkError() {
        return this.status === 0;
    }

    isClientError() {
        return this.status >= 400 && this.status < 500;
    }

    isServerError() {
        return this.status >= 500;
    }

    isAuthError() {
        return this.status === 401 || this.status === 403;
    }
}

// API service methods
class ApiService {
    constructor() {
        this.client = new ApiClient();
    }

    // Authentication
    async login(email, password, mfaCode = null) {
        const body = { email, password };
        if (mfaCode) {
            body.mfa_code = mfaCode;
        }

        const response = await this.client.post(API_ENDPOINTS.auth.login, body);
        
        if (response.data.access_token) {
            this.client.saveTokens(
                response.data.access_token,
                response.data.refresh_token
            );
        }

        return response.data;
    }

    async logout() {
        try {
            await this.client.post(API_ENDPOINTS.auth.logout);
        } catch (error) {
            console.warn('Logout request failed:', error);
        } finally {
            this.client.clearTokens();
        }
    }

    // User profile
    async getUserProfile() {
        const response = await this.client.get(API_ENDPOINTS.user.profile);
        return response.data;
    }

    async updateUserProfile(profileData) {
        const response = await this.client.put(API_ENDPOINTS.user.profile, profileData);
        return response.data;
    }

    // Mileage
    async calculateMileage(startAddress, endAddress, firmId, tripType = 'round-trip') {
        const body = {
            start_address: startAddress,
            end_address: endAddress,
            firm_id: firmId,
            trip_type: tripType
        };

        const response = await this.client.post(API_ENDPOINTS.mileage.calculate, body);
        return response.data;
    }

    async saveMileageLog(logEntry) {
        const response = await this.client.post(API_ENDPOINTS.mileage.log, logEntry);
        return response.data;
    }

    async getMileageLog(params = {}) {
        const queryString = this.client.buildQueryString(params);
        const endpoint = queryString ? `${API_ENDPOINTS.mileage.log}?${queryString}` : API_ENDPOINTS.mileage.log;
        
        const response = await this.client.get(endpoint);
        return response.data;
    }

    // Routes
    async optimizeRoute(stops, rules = {}) {
        const body = { stops, rules };
        const response = await this.client.post(API_ENDPOINTS.routes.optimize, body);
        return response.data;
    }

    async saveRoute(routeData) {
        const response = await this.client.post(API_ENDPOINTS.routes.save, routeData);
        return response.data;
    }

    async syncWithCalendar(routeId, calendarData) {
        const endpoint = this.client.interpolateUrl(API_ENDPOINTS.routes.calendar, { id: routeId });
        const response = await this.client.post(endpoint, calendarData);
        return response.data;
    }

    // Jobs
    async getJobs(params = {}) {
        const queryString = this.client.buildQueryString(params);
        const endpoint = queryString ? `${API_ENDPOINTS.jobs.list}?${queryString}` : API_ENDPOINTS.jobs.list;
        
        const response = await this.client.get(endpoint);
        return response.data;
    }

    async createJob(jobData) {
        const response = await this.client.post(API_ENDPOINTS.jobs.create, jobData);
        return response.data;
    }

    async assignJob(jobId, deviceId) {
        const endpoint = this.client.interpolateUrl(API_ENDPOINTS.jobs.assign, { id: jobId });
        const response = await this.client.post(endpoint, { device_id: deviceId });
        return response.data;
    }

    // File uploads
    async uploadJobPhoto(jobId, file, metadata = {}) {
        const endpoint = this.client.interpolateUrl(API_ENDPOINTS.jobs.upload, { id: jobId });
        const response = await this.client.uploadFile(endpoint, file, metadata);
        return response.data;
    }

    // AutoForms
    async extractPdfData(file) {
        const response = await this.client.uploadFile(API_ENDPOINTS.autoforms.extract, file);
        return response.data;
    }

    async fillForm(templateId, extractedData) {
        const body = {
            template_id: templateId,
            data: extractedData
        };

        const response = await this.client.post(API_ENDPOINTS.autoforms.fill, body);
        return response.data;
    }

    // Comparables
    async searchComparables(vehicleData) {
        const response = await this.client.post(API_ENDPOINTS.comparables.search, vehicleData);
        return response.data;
    }
}

// Create singleton instance
const apiService = new ApiService();

// Export both the service and error class
export { apiService as default, ApiError, ApiClient };

// Convenience methods for common operations
export const api = {
    // Quick access methods
    get: (endpoint, options) => apiService.client.get(endpoint, options),
    post: (endpoint, body, options) => apiService.client.post(endpoint, body, options),
    put: (endpoint, body, options) => apiService.client.put(endpoint, body, options),
    delete: (endpoint, options) => apiService.client.delete(endpoint, options),
    
    // Authentication shortcuts
    login: (email, password, mfaCode) => apiService.login(email, password, mfaCode),
    logout: () => apiService.logout(),
    
    // Common operations
    calculateMileage: (start, end, firm, type) => apiService.calculateMileage(start, end, firm, type),
    optimizeRoute: (stops, rules) => apiService.optimizeRoute(stops, rules),
    uploadFile: (endpoint, file, data) => apiService.client.uploadFile(endpoint, file, data)
};