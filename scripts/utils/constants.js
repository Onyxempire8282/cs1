// Application Constants

export const APP_CONFIG = {
    name: 'Claim Cipher',
    version: '1.0.0',
    environment: 'development',
    
    // API Configuration
    api: {
        baseUrl: process.env.NODE_ENV === 'production' 
            ? 'https://api.claimcipher.com' 
            : 'http://localhost:8000',
        timeout: 10000,
        retries: 3
    },
    
    // Demo Configuration
    demo: {
        durationDays: 7,
        features: [
            'mileage-calculator',
            'route-optimizer',
            'mobile-sync',
            'autoforms',
            'comparables',
            'calendar-sync'
        ]
    },
    
    // Route Optimization Defaults
    routing: {
        maxRadius: 50, // miles
        maxStopsPerDay: 10,
        spilloverRule: 'tomorrow', // tomorrow | next-business-day | specific-day
        providers: {
            maps: 'google', // google | mapbox
            calendar: 'google' // google | outlook
        }
    },
    
    // Mileage Rates
    mileageRates: {
        default: 0.655, // 2023 IRS rate
        firms: {
            sedgwick: 0.67,
            acd: 0.62,
            independent: 0.70
        }
    },
    
    // File Upload Limits
    upload: {
        maxFileSize: 10 * 1024 * 1024, // 10MB
        allowedTypes: {
            pdf: ['application/pdf'],
            images: ['image/jpeg', 'image/png', 'image/webp'],
            documents: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
        }
    },
    
    // UI Configuration
    ui: {
        toastDuration: 4000,
        loadingDelay: 300,
        animationDuration: 300,
        debounceDelay: 500
    }
};

export const ROUTES = {
    dashboard: '/dashboard',
    mileage: '/mileage',
    routes: '/routes',
    jobs: '/jobs',
    autoforms: '/autoforms',
    comparables: '/comparables',
    firms: '/firms',
    gear: '/gear',
    help: '/help',
    settings: '/settings'
};

export const API_ENDPOINTS = {
    // Authentication
    auth: {
        login: '/auth/login',
        logout: '/auth/logout',
        register: '/auth/register',
        refresh: '/auth/refresh',
        mfa: '/auth/mfa'
    },
    
    // User Management
    user: {
        profile: '/user/profile',
        settings: '/user/settings',
        subscription: '/user/subscription'
    },
    
    // Mileage
    mileage: {
        calculate: '/mileage/calculate',
        log: '/mileage/log',
        export: '/mileage/export'
    },
    
    // Routes
    routes: {
        optimize: '/routes/optimize',
        save: '/routes/save',
        calendar: '/routes/calendar'
    },
    
    // Jobs
    jobs: {
        list: '/jobs',
        create: '/jobs',
        assign: '/jobs/{id}/assign',
        upload: '/jobs/{id}/upload',
        complete: '/jobs/{id}/complete'
    },
    
    // AutoForms
    autoforms: {
        extract: '/autoforms/extract',
        fill: '/autoforms/fill',
        download: '/autoforms/download'
    },
    
    // Comparables
    comparables: {
        search: '/comparables/search',
        pdf: '/comparables/pdf'
    }
};

export const EVENT_TYPES = {
    // Navigation
    NAVIGATE: 'navigate',
    PAGE_LOADED: 'page-loaded',
    
    // Demo
    DEMO_EXPIRED: 'demo-expired',
    UPGRADE_REQUESTED: 'upgrade-requested',
    
    // Toast
    SHOW_TOAST: 'show-toast',
    HIDE_TOAST: 'hide-toast',
    
    // Forms
    FORM_SUBMIT: 'form-submit',
    FORM_VALIDATION: 'form-validation',
    
    // Files
    FILE_UPLOAD: 'file-upload',
    FILE_PROCESSED: 'file-processed',
    
    // Routes
    ROUTE_OPTIMIZED: 'route-optimized',
    STOPS_UPDATED: 'stops-updated',
    
    // Jobs
    JOB_CREATED: 'job-created',
    JOB_ASSIGNED: 'job-assigned',
    JOB_COMPLETED: 'job-completed',
    SYNC_STATUS: 'sync-status'
};

export const TOAST_TYPES = {
    SUCCESS: 'success',
    ERROR: 'error',
    WARNING: 'warning',
    INFO: 'info'
};

export const PLAN_TYPES = {
    BASIC: 'basic',
    PRO: 'pro',
    MASTER: 'master',
    DEMO: 'demo'
};

export const PLAN_FEATURES = {
    [PLAN_TYPES.BASIC]: [
        'mileage-calculator',
        'route-optimizer',
        'autoforms',
        'help',
        'gear',
        'firms-directory'
    ],
    [PLAN_TYPES.PRO]: [
        'mileage-calculator',
        'route-optimizer',
        'calendar-sync',
        'mobile-sync',
        'autoforms',
        'comparables',
        'csv-automations',
        'multi-firm-presets',
        'help',
        'gear',
        'firms-directory'
    ],
    [PLAN_TYPES.MASTER]: [
        'all-features',
        'unlimited-access',
        'priority-support',
        'custom-features'
    ],
    [PLAN_TYPES.DEMO]: [
        'all-pro-features',
        'time-limited'
    ]
};

export const JOB_STATUSES = {
    PENDING: 'pending',
    ASSIGNED: 'assigned',
    IN_PROGRESS: 'in-progress',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled'
};

export const SYNC_STATUSES = {
    OFFLINE: 'offline',
    SYNCING: 'syncing',
    SYNCED: 'synced',
    ERROR: 'error'
};

export const PHOTO_TYPES = {
    VIN: 'vin',
    ODOMETER: 'odometer',
    FRONT: 'front',
    REAR: 'rear',
    DRIVER_SIDE: 'driver-side',
    PASSENGER_SIDE: 'passenger-side',
    INTERIOR: 'interior',
    DAMAGE: 'damage',
    CUSTOM: 'custom'
};

export const PHOTO_REQUIREMENTS = {
    VIN: { required: true, label: 'VIN Number' },
    ODOMETER: { required: true, label: 'Odometer' },
    FRONT: { required: true, label: 'Front View' },
    REAR: { required: true, label: 'Rear View' },
    DRIVER_SIDE: { required: true, label: 'Driver Side' },
    PASSENGER_SIDE: { required: true, label: 'Passenger Side' },
    INTERIOR: { required: false, label: 'Interior' },
    DAMAGE: { required: true, label: 'Damage Areas' }
};

export const SPILLOVER_RULES = {
    TOMORROW: 'tomorrow',
    NEXT_BUSINESS_DAY: 'next-business-day',
    MONDAY: 'monday',
    TUESDAY: 'tuesday',
    WEDNESDAY: 'wednesday',
    THURSDAY: 'thursday',
    FRIDAY: 'friday'
};

export const FIRM_TYPES = {
    INSURANCE_CARRIER: 'insurance-carrier',
    INDEPENDENT_ADJUSTER: 'independent-adjuster',
    THIRD_PARTY_ADMINISTRATOR: 'third-party-administrator',
    LAW_FIRM: 'law-firm'
};

export const COMPARABLES_PROVIDERS = {
    CARS_COM: 'cars-com',
    KBB: 'kbb',
    EDMUNDS: 'edmunds',
    AUTOTRADER: 'autotrader'
};

export const PDF_TEMPLATES = {
    BCIF: 'bcif', // Basic Claim Information Form
    ACV: 'acv',   // Actual Cash Value
    ESTIMATE: 'estimate',
    CUSTOM: 'custom'
};

export const LOCAL_STORAGE_KEYS = {
    USER_PREFERENCES: 'claim-cipher-preferences',
    ROUTE_SETTINGS: 'claim-cipher-route-settings',
    FORM_DRAFTS: 'claim-cipher-form-drafts',
    OFFLINE_DATA: 'claim-cipher-offline'
};

export const KEYBOARD_SHORTCUTS = {
    NAVIGATION: {
        'Alt+1': 'dashboard',
        'Alt+2': 'mileage',
        'Alt+3': 'routes',
        'Alt+4': 'jobs',
        'Alt+5': 'autoforms',
        'Alt+6': 'comparables',
        'Alt+7': 'firms',
        'Alt+8': 'gear',
        'Alt+9': 'help',
        'Alt+0': 'settings'
    },
    ACTIONS: {
        'Ctrl+K': 'search',
        'Ctrl+S': 'save',
        'Ctrl+N': 'new',
        'Escape': 'close'
    }
};

export const VALIDATION_RULES = {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s\-\(\)]+$/,
    vin: /^[A-HJ-NPR-Z0-9]{17}$/,
    zipCode: /^\d{5}(-\d{4})?$/,
    claimNumber: /^[A-Z]{2,4}-\d{4,6}$/
};

export const ERROR_MESSAGES = {
    NETWORK_ERROR: 'Network connection failed. Please check your internet connection.',
    VALIDATION_ERROR: 'Please check your input and try again.',
    AUTH_REQUIRED: 'Please log in to continue.',
    PERMISSION_DENIED: 'You do not have permission to perform this action.',
    FILE_TOO_LARGE: 'File size exceeds the maximum limit.',
    INVALID_FILE_TYPE: 'Invalid file type. Please select a supported file.',
    DEMO_EXPIRED: 'Your demo has expired. Please upgrade to continue.',
    GENERIC_ERROR: 'An unexpected error occurred. Please try again.'
};

export default {
    APP_CONFIG,
    ROUTES,
    API_ENDPOINTS,
    EVENT_TYPES,
    TOAST_TYPES,
    PLAN_TYPES,
    PLAN_FEATURES,
    JOB_STATUSES,
    SYNC_STATUSES,
    PHOTO_TYPES,
    PHOTO_REQUIREMENTS,
    SPILLOVER_RULES,
    FIRM_TYPES,
    COMPARABLES_PROVIDERS,
    PDF_TEMPLATES,
    LOCAL_STORAGE_KEYS,
    KEYBOARD_SHORTCUTS,
    VALIDATION_RULES,
    ERROR_MESSAGES
};