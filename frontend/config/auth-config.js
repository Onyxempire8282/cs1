// Authentication Configuration
// This file contains configuration for the Claim Cipher authentication system

const AUTH_CONFIG = {
    // Admin credentials - easily configurable
    adminCredentials: {
        'inspects@flav8r.net': {
            passwords: ['nnekamaster', 'jaymaster'],
            userType: 'admin',
            displayNames: {
                'nnekamaster': 'Nneka (Admin)',
                'jaymaster': 'Jay (Admin)'
            }
        }
    },

    // Login attempt security
    maxLoginAttempts: 5,
    lockoutDuration: 10 * 60 * 1000, // 10 minutes in milliseconds

    // Demo user settings
    demoTrialDays: 7,
    demoTrialHours: 7 * 24, // 7 days in hours

    // User type configurations
    userTypes: {
        admin: {
            label: 'Master Access',
            badgeType: 'error', // red
            features: ['all'], // Admin gets everything
            permissions: {
                userManagement: true,
                systemAnalytics: true,
                viewComplaints: true,
                respondToComplaints: true,
                viewUserStats: true
            }
        },
        pro: {
            label: 'Pro Access',
            badgeType: 'success', // green
            features: [
                'dashboard', 'jobs', 'routes', 'mileage', 'autoforms', 
                'comparables', 'firms', 'gear', 'settings', 'help', 'mobileSync'
            ],
            permissions: {
                fullAccess: true,
                mobileSync: true
            }
        },
        basic: {
            label: 'Basic Access', 
            badgeType: 'warning', // yellow
            features: [
                'dashboard', 'jobs', 'routes', 'mileage', 'autoforms',
                'comparables', 'firms', 'settings', 'help'
            ],
            restrictions: ['gear', 'mobileSync'], // Cannot access these
            permissions: {
                limitedAccess: true
            }
        },
        demo: {
            label: 'Trial Access',
            badgeType: 'info', // blue
            features: [
                'dashboard', 'jobs', 'routes', 'mileage', 'autoforms',
                'comparables', 'firms', 'gear', 'settings', 'help', 'mobileSync'
            ], // Full pro access during trial
            permissions: {
                fullAccessTrial: true,
                showTrialBanner: true
            },
            trialDuration: 7 * 24 * 60 * 60 * 1000 // 7 days in milliseconds
        }
    },

    // Session settings
    sessionSettings: {
        rememberMeDuration: 30 * 24 * 60 * 60 * 1000, // 30 days
        sessionTimeout: null, // No timeout as requested
        autoLogout: false
    },

    // Password requirements for demo signup
    passwordRequirements: {
        minLength: 6,
        requireUppercase: false,
        requireNumbers: false,
        requireSpecialChars: false
    },

    // Application settings
    appSettings: {
        applicationName: 'Claim Cipher',
        companyName: 'Flav8r',
        supportEmail: 'support@flav8r.net',
        upgradeUrl: 'upgrade.html',
        termsUrl: 'terms.html',
        privacyUrl: 'privacy.html'
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AUTH_CONFIG;
} else {
    window.AUTH_CONFIG = AUTH_CONFIG;
}
