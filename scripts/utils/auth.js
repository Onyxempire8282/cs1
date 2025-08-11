// Authentication and session management
class AuthManager {
    constructor() {
        this.auth = this.getAuthData();
        this.init();
    }

    init() {
        this.checkAuthentication();
        this.setupDemoCountdown();
        this.setupLogoutHandler();
    }

    getAuthData() {
        return JSON.parse(localStorage.getItem('claimcipher_auth') || '{}');
    }

    checkAuthentication() {
        if (!this.auth.authenticated) {
            window.location.href = this.getLoginPath();
            return;
        }

        // Check if demo expired
        if (this.auth.demoMode && this.auth.demoExpiry && Date.now() > this.auth.demoExpiry) {
            this.logout();
            return;
        }

        // Show/hide demo banner based on demo mode only
        const demoBanner = document.querySelector('.demo-banner');
        if (demoBanner) {
            if (this.auth.demoMode && !this.auth.masterLogin) {
                demoBanner.style.display = 'flex';
                this.updateDemoCountdown();
            } else {
                demoBanner.style.display = 'none';
            }
        }

        // Add user info to sidebar if needed
        this.addUserInfo();
    }

    getLoginPath() {
        // Calculate relative path to login.html based on current page depth
        const currentPath = window.location.pathname;
        const pathDepth = currentPath.split('/').filter(part => part !== '').length;
        const pagesDepth = currentPath.includes('/pages/') ? 1 : 0;
        
        if (pagesDepth > 0) {
            return '../login.html';
        } else {
            return 'login.html';
        }
    }

    setupDemoCountdown() {
        if (this.auth.demoMode && this.auth.demoExpiry) {
            setInterval(() => {
                this.updateDemoCountdown();
            }, 60000); // Update every minute
        }
    }

    updateDemoCountdown() {
        const countdownElement = document.getElementById('demo-countdown');
        if (!countdownElement || !this.auth.demoMode || !this.auth.demoExpiry) return;

        const now = Date.now();
        const remaining = this.auth.demoExpiry - now;

        if (remaining <= 0) {
            this.logout();
            return;
        }

        const days = Math.floor(remaining / (24 * 60 * 60 * 1000));
        const hours = Math.floor((remaining % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
        const minutes = Math.floor((remaining % (60 * 60 * 1000)) / (60 * 1000));

        let timeString = '';
        if (days > 0) {
            timeString = `${days} days, ${hours} hours remaining`;
        } else if (hours > 0) {
            timeString = `${hours} hours, ${minutes} minutes remaining`;
        } else {
            timeString = `${minutes} minutes remaining`;
        }

        countdownElement.textContent = timeString;
    }

    addUserInfo() {
        const sidebar = document.querySelector('.sidebar');
        if (!sidebar) return;

        // Remove existing user info
        const existingUserInfo = sidebar.querySelector('.user-info');
        if (existingUserInfo) {
            existingUserInfo.remove();
        }

        // Add user info at bottom of sidebar
        const userInfo = document.createElement('div');
        userInfo.className = 'user-info';
        userInfo.innerHTML = `
            <div class="user-profile">
                <div class="user-avatar">${this.auth.username.charAt(0).toUpperCase()}</div>
                <div class="user-details">
                    <div class="user-name">${this.auth.demoMode ? 'Demo User' : 'Admin'}</div>
                    <div class="user-status">${this.auth.demoMode ? 'Demo Mode' : 'Full Access'}</div>
                </div>
                <button class="btn btn--ghost btn--small logout-btn" id="logout-btn">
                    <span>⏻</span>
                </button>
            </div>
        `;

        sidebar.appendChild(userInfo);
    }

    setupLogoutHandler() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('#logout-btn') || e.target.closest('.logout-btn')) {
                this.logout();
            }
        });
    }

    logout() {
        localStorage.removeItem('claimcipher_auth');
        window.location.href = this.getLoginPath();
    }

    // Master login functionality
    attemptMasterLogin(email, password) {
        // Master credentials - in production, this should be more secure
        const masterCredentials = {
            email: 'inspects@flav8r.net',
            password: 'ClaimCipher2025!Master'
        };

        if (email === masterCredentials.email && password === masterCredentials.password) {
            const authData = {
                authenticated: true,
                masterLogin: true,
                demoMode: false,
                username: 'Master Admin',
                email: email,
                loginTime: Date.now(),
                permissions: 'full'
            };
            
            localStorage.setItem('claimcipher_auth', JSON.stringify(authData));
            return { success: true, type: 'master' };
        }
        
        return { success: false, message: 'Invalid master credentials' };
    }

    // Demo login functionality
    attemptDemoLogin() {
        const demoExpiry = Date.now() + (7 * 24 * 60 * 60 * 1000); // 7 days
        const authData = {
            authenticated: true,
            masterLogin: false,
            demoMode: true,
            demoExpiry: demoExpiry,
            username: 'Demo User',
            email: 'demo@claimcipher.com',
            loginTime: Date.now(),
            permissions: 'demo'
        };
        
        localStorage.setItem('claimcipher_auth', JSON.stringify(authData));
        return { success: true, type: 'demo' };
    }

    // Regular user login functionality
    attemptUserLogin(email, password, userData = {}) {
        // In production, this would validate against a backend
        // For now, accept any email/password combination
        const authData = {
            authenticated: true,
            masterLogin: false,
            demoMode: false,
            username: userData.name || email.split('@')[0],
            email: email,
            company: userData.company || '',
            phone: userData.phone || '',
            loginTime: Date.now(),
            permissions: 'user'
        };
        
        localStorage.setItem('claimcipher_auth', JSON.stringify(authData));
        return { success: true, type: 'user' };
    }

    isDemoMode() {
        return this.auth.demoMode || false;
    }

    isMasterLogin() {
        return this.auth.masterLogin || false;
    }

    isAuthenticated() {
        return this.auth.authenticated || false;
    }
}

// Initialize authentication when script loads
window.authManager = new AuthManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}
