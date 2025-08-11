// Helper Utility Functions
import { VALIDATION_RULES, LOCAL_STORAGE_KEYS } from './constants.js';

// Local Storage Helpers
export const storageHelpers = {
    // Get item from localStorage with fallback
    getItem(key, fallback = null) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : fallback;
        } catch (error) {
            console.warn('Error reading from localStorage:', error);
            return fallback;
        }
    },

    // Set item in localStorage
    setItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.warn('Error writing to localStorage:', error);
            return false;
        }
    },

    // Remove item from localStorage
    removeItem(key) {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.warn('Error removing from localStorage:', error);
            return false;
        }
    },

    // Clear all localStorage
    clear() {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.warn('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Number Formatting Helpers
export const numberHelpers = {
    // Format currency
    formatCurrency(amount, currency = 'USD') {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    },

    // Format number with commas
    formatNumber(number) {
        return new Intl.NumberFormat('en-US').format(number);
    },

    // Format percentage
    formatPercentage(decimal, decimals = 1) {
        return new Intl.NumberFormat('en-US', {
            style: 'percent',
            minimumFractionDigits: decimals,
            maximumFractionDigits: decimals
        }).format(decimal);
    },

    // Round to decimal places
    roundTo(number, decimals = 2) {
        return Math.round(number * Math.pow(10, decimals)) / Math.pow(10, decimals);
    }
};

// Date and Time Helpers
export const dateHelpers = {
    // Format date for display
    formatDate(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        return new Intl.DateTimeFormat('en-US', formatOptions).format(new Date(date));
    },

    // Format time for display
    formatTime(date, options = {}) {
        const defaultOptions = {
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        return new Intl.DateTimeFormat('en-US', formatOptions).format(new Date(date));
    },

    // Format date and time
    formatDateTime(date, options = {}) {
        const defaultOptions = {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        };
        
        const formatOptions = { ...defaultOptions, ...options };
        return new Intl.DateTimeFormat('en-US', formatOptions).format(new Date(date));
    },

    // Get relative time (e.g., "2 hours ago")
    getRelativeTime(date) {
        const now = new Date();
        const past = new Date(date);
        const diffInSeconds = Math.floor((now - past) / 1000);

        if (diffInSeconds < 60) {
            return 'Just now';
        }

        const diffInMinutes = Math.floor(diffInSeconds / 60);
        if (diffInMinutes < 60) {
            return `${diffInMinutes} minute${diffInMinutes !== 1 ? 's' : ''} ago`;
        }

        const diffInHours = Math.floor(diffInMinutes / 60);
        if (diffInHours < 24) {
            return `${diffInHours} hour${diffInHours !== 1 ? 's' : ''} ago`;
        }

        const diffInDays = Math.floor(diffInHours / 24);
        if (diffInDays < 7) {
            return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
        }

        // For older dates, return formatted date
        return this.formatDate(date);
    },

    // Add days to a date
    addDays(date, days) {
        const result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    },

    // Get next business day
    getNextBusinessDay(date = new Date()) {
        const result = new Date(date);
        result.setDate(result.getDate() + 1);
        
        // If it's a weekend, move to Monday
        while (result.getDay() === 0 || result.getDay() === 6) {
            result.setDate(result.getDate() + 1);
        }
        
        return result;
    },

    // Check if date is business day
    isBusinessDay(date) {
        const day = new Date(date).getDay();
        return day !== 0 && day !== 6;
    }
};