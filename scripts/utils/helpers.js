// Helper Utility Functions
import { VALIDATION_RULES, LOCAL_STORAGE_KEYS } from './constants.js';

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
        result.setDate(result.getDate() +