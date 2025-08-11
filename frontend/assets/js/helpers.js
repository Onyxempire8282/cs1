// Storage utilities
function setStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
        return true;
    } catch (e) {
        console.error('Storage set error:', e);
        return false;
    }
}

function getStorage(key, defaultValue = null) {
    try {
        const item = localStorage.getItem(key);
        return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
        console.error('Storage get error:', e);
        return defaultValue;
    }
}

function removeStorage(key) {
    try {
        localStorage.removeItem(key);
        return true;
    } catch (e) {
        console.error('Storage remove error:', e);
        return false;
    }
}

// Number formatting utilities
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD'
    }).format(amount);
}

function formatNumber(number) {
    return new Intl.NumberFormat('en-US').format(number);
}

function formatMiles(miles) {
    return `${formatNumber(miles)} mi`;
}

// Date utilities
function formatDate(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
    }).format(new Date(date));
}

function formatTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(new Date(date));
}

function formatDateTime(date) {
    return new Intl.DateTimeFormat('en-US', {
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
    }).format(new Date(date));
}

// User utilities
function getUserType() {
    return localStorage.getItem('userType') || 'demo';
}

function isDemo() {
    return getUserType() === 'demo';
}

function isMaster() {
    return getUserType() === 'master';
}

// Demo data generators
function generateSampleStats() {
    const baseStats = {
        miles: Math.floor(Math.random() * 300) + 100,
        routes: Math.floor(Math.random() * 25) + 5,
        jobs: Math.floor(Math.random() * 50) + 20,
        earnings: Math.floor(Math.random() * 2000) + 1000
    };
    
    return baseStats;
}

function generateSampleRoutes() {
    const routes = [
        {
            name: 'Downtown Route',
            date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
            stops: 8,
            miles: 47,
            duration: 3.2,
            status: 'completed'
        },
        {
            name: 'Northside Loop',
            date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
            stops: 12,
            miles: 63,
            duration: 4.1,
            status: 'completed'
        },
        {
            name: 'Weekend Claims',
            date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
            stops: 5,
            miles: 28,
            duration: 2.0,
            status: 'planned'
        }
    ];
    
    return routes;
}

function generateSampleJobs() {
    const jobs = [
        {
            vehicle: '2021 Honda Accord',
            claimNumber: 'CLM-4891',
            status: 'uploading',
            progress: '8/12 uploaded',
            action: null
        },
        {
            vehicle: '2019 Toyota Camry',
            claimNumber: 'CLM-4902',
            status: 'ready',
            progress: 'Ready for summary',
            action: 'Generate'
        },
        {
            vehicle: '2020 Ford F-150',
            claimNumber: 'CLM-4876',
            status: 'pending',
            progress: 'Pending assignment',
            action: 'Assign'
        }
    ];
    
    return jobs;
}

function generateSampleActivity() {
    const activities = [
        {
            type: 'success',
            icon: '✓',
            title: 'Route optimized',
            time: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        {
            type: 'info',
            icon: '📱',
            title: 'Photos synced from mobile',
            time: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        {
            type: 'warning',
            icon: '📄',
            title: 'Form auto-filled',
            time: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
    ];
    
    return activities;
}

// Toast notification system
function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast toast--${type}`;
    toast.innerHTML = `
        <div class="toast__content">
            <span class="toast__icon">${getToastIcon(type)}</span>
            <span class="toast__message">${message}</span>
        </div>
        <button class="toast__close">×</button>
    `;
    
    document.body.appendChild(toast);
    
    // Show toast
    setTimeout(() => toast.classList.add('toast--show'), 100);
    
    // Auto-hide after duration
    const hideTimeout = setTimeout(() => hideToast(toast), duration);
    
    // Manual close
    toast.querySelector('.toast__close').addEventListener('click', () => {
        clearTimeout(hideTimeout);
        hideToast(toast);
    });
}

function hideToast(toast) {
    toast.classList.remove('toast--show');
    setTimeout(() => {
        if (toast.parentNode) {
            toast.parentNode.removeChild(toast);
        }
    }, 300);
}

function getToastIcon(type) {
    const icons = {
        success: '✓',
        error: '✗',
        warning: '⚠',
        info: 'ℹ'
    };
    return icons[type] || icons.info;
}

// Utility functions
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}
