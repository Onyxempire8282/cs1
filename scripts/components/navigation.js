// Navigation Component
class Navigation {
    constructor() {
        this.activeLink = null;
        this.mobileMenuOpen = false;
        this.sidebarElement = null;
        this.mobileToggleBtn = null;
        this.overlay = null;
        this.currentPath = window.location.pathname;
    }

    static generateSidebarHTML() {
        const auth = JSON.parse(localStorage.getItem('claimcipher_auth') || '{}');
        const userName = auth.username || 'User';
        const userRole = auth.demoMode ? 'Demo Mode' : auth.masterLogin ? 'Master Admin' : 'Pro User';
        const userAvatar = userName.substring(0, 2).toUpperCase();
        
        // Determine relative path prefix based on current location
        const isInPagesFolder = window.location.pathname.includes('/pages/');
        const pathPrefix = isInPagesFolder ? '../' : '';
        
        return `
            <!-- Demo Banner (shown only for demo users) -->
            <div class="demo-banner" id="demo-banner" style="display: none;">
                🎯 Pro Demo Active - <span id="demo-countdown">6 days, 14 hours remaining</span>
                <button class="btn btn--primary btn--small" style="margin-left: 16px;" onclick="window.location.href='${pathPrefix}login.html'">Upgrade Now</button>
            </div>

            <!-- Sidebar Navigation -->
            <nav class="sidebar" id="sidebar">
                <div>
                    <div class="sidebar__logo">
                        <a href="${pathPrefix}pages/dashboard.html">Claim Cipher</a>
                    </div>
                    <ul class="sidebar__nav">
                        <li class="sidebar__nav-item">
                            <a href="${pathPrefix}pages/dashboard.html" class="sidebar__nav-link" data-page="dashboard">
                                <span>📊</span> Dashboard
                            </a>
                        </li>
                        <li class="sidebar__nav-item">
                            <a href="${pathPrefix}pages/mileage.html" class="sidebar__nav-link" data-page="mileage">
                                <span>🚗</span> Mileage Calculator
                            </a>
                        </li>
                        <li class="sidebar__nav-item">
                            <a href="${pathPrefix}pages/routes.html" class="sidebar__nav-link" data-page="routes">
                                <span>🗺️</span> Route Optimizer
                            </a>
                        </li>
                        <li class="sidebar__nav-item">
                            <a href="${pathPrefix}pages/jobs.html" class="sidebar__nav-link" data-page="jobs">
                                <span>📱</span> Mobile Sync
                                <span class="badge badge--pro">PRO</span>
                            </a>
                        </li>
                        <li class="sidebar__nav-item">
                            <a href="${pathPrefix}pages/autoforms.html" class="sidebar__nav-link" data-page="autoforms">
                                <span>📄</span> AutoForms
                            </a>
                        </li>
                        <li class="sidebar__nav-item">
                            <a href="${pathPrefix}pages/comparables.html" class="sidebar__nav-link" data-page="comparables">
                                <span>🔍</span> Comparables
                                <span class="badge badge--pro">PRO</span>
                            </a>
                        </li>
                        <li class="sidebar__nav-item">
                            <a href="${pathPrefix}pages/firms.html" class="sidebar__nav-link" data-page="firms">
                                <span>🏢</span> Firms Directory
                            </a>
                        </li>
                        <li class="sidebar__nav-item">
                            <a href="${pathPrefix}pages/gear.html" class="sidebar__nav-link" data-page="gear">
                                <span>⚙️</span> Gear
                            </a>
                        </li>
                        <li class="sidebar__nav-item">
                            <a href="${pathPrefix}pages/help.html" class="sidebar__nav-link" data-page="help">
                                <span>❓</span> Help
                            </a>
                        </li>
                        <li class="sidebar__nav-item">
                            <a href="${pathPrefix}pages/settings.html" class="sidebar__nav-link" data-page="settings">
                                <span>⚙️</span> Settings
                            </a>
                        </li>
                    </ul>
                </div>
                
                <!-- User info and logout -->
                <div class="sidebar__footer">
                    <div class="sidebar__user" id="sidebar-user">
                        <div class="user-avatar" id="user-avatar">${userAvatar}</div>
                        <div class="user-info">
                            <div class="user-name" id="user-name">${userName}</div>
                            <div class="user-role" id="user-role">${userRole}</div>
                        </div>
                    </div>
                    <button class="sidebar__logout" id="logout-btn">
                        <span>🚪</span> Logout
                    </button>
                </div>
            </nav>
        `;
    }

    static initializeGlobalSidebar() {
        // Add sidebar to all pages that don't have it
        if (!document.getElementById('sidebar')) {
            document.body.insertAdjacentHTML('afterbegin', Navigation.generateSidebarHTML());
            
            // Initialize sidebar functionality
            const nav = new Navigation();
            nav.init();
            nav.setupGlobalSidebar();
            
            // Setup authentication and demo banner logic
            nav.initializeUserContext();
        }
    }

    setupGlobalSidebar() {
        // Show sidebar on ALL pages (as per requirement)
        const sidebar = document.getElementById('sidebar');
        if (sidebar) {
            sidebar.style.display = 'block';
            this.setActiveNavigationFromPath();
        }
    }

    initializeUserContext() {
        const auth = JSON.parse(localStorage.getItem('claimcipher_auth') || '{}');
        const userType = auth.demoMode ? 'demo' : 'authenticated';
        
        // Set user type attribute on body
        document.body.setAttribute('data-user-type', userType);
        
        // Show/hide demo elements
        const demoBanner = document.getElementById('demo-banner');
        
        if (userType === 'demo' && demoBanner) {
            demoBanner.style.display = 'flex';
            this.updateDemoCountdown();
        }
        
        // Setup logout handler
        this.setupLogoutHandler();
    }

    updateDemoCountdown() {
        const auth = JSON.parse(localStorage.getItem('claimcipher_auth') || '{}');
        if (!auth.demoExpiry) return;
        
        const timeLeft = auth.demoExpiry - Date.now();
        const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        
        const countdownEl = document.getElementById('demo-countdown');
        if (countdownEl) {
            countdownEl.textContent = `${days} days, ${hours} hours remaining`;
        }
    }

    setupLogoutHandler() {
        const logoutBtn = document.getElementById('logout-btn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', function() {
                localStorage.removeItem('claimcipher_auth');
                const pathPrefix = window.location.pathname.includes('/pages/') ? '../' : '';
                window.location.href = pathPrefix + 'login.html';
            });
        }
    }

    setActiveNavigationFromPath() {
        const path = window.location.pathname;
        let currentPage = 'dashboard';
        
        if (path.includes('/mileage.html')) currentPage = 'mileage';
        else if (path.includes('/routes.html')) currentPage = 'routes';
        else if (path.includes('/jobs.html')) currentPage = 'jobs';
        else if (path.includes('/autoforms.html')) currentPage = 'autoforms';
        else if (path.includes('/comparables.html')) currentPage = 'comparables';
        else if (path.includes('/firms.html')) currentPage = 'firms';
        else if (path.includes('/gear.html')) currentPage = 'gear';
        else if (path.includes('/help.html')) currentPage = 'help';
        else if (path.includes('/settings.html')) currentPage = 'settings';
        
        this.setActiveLink(currentPage);
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.setupMobileMenu();
        this.setActiveLink('dashboard'); // Set default active link
        
        console.log('🧭 Navigation initialized');
    }

    setupElements() {
        this.sidebarElement = document.querySelector('.sidebar');
        this.mobileToggleBtn = document.getElementById('mobile-menu-btn');
        
        // Create mobile overlay
        this.createMobileOverlay();
    }

    setupEventListeners() {
        // Navigation link clicks
        const navLinks = document.querySelectorAll('.sidebar__nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', (event) => {
                event.preventDefault();
                this.handleNavClick(link);
            });

            // Keyboard navigation
            link.addEventListener('keydown', (event) => {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.handleNavClick(link);
                }
            });
        });

        // Mobile menu toggle
        if (this.mobileToggleBtn) {
            this.mobileToggleBtn.addEventListener('click', () => {
                this.toggleMobileMenu();
            });
        }

        // Close mobile menu when clicking overlay
        if (this.overlay) {
            this.overlay.addEventListener('click', () => {
                this.closeMobileMenu();
            });
        }

        // Handle browser back/forward buttons
        window.addEventListener('popstate', (event) => {
            if (event.state && event.state.page) {
                this.setActiveLink(event.state.page);
                // Don't trigger navigation event to prevent infinite loop
            }
        });

        // Close mobile menu when clicking on navigation links
        document.addEventListener('navigate', () => {
            this.closeMobileMenu();
        });
    }

    setupMobileMenu() {
        // Set up mobile menu functionality
        if (window.innerWidth <= 768) {
            this.initMobileMenu();
        }

        // Handle window resize
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) {
                this.closeMobileMenu();
            }
        });
    }

    initMobileMenu() {
        // Add mobile menu classes and attributes
        if (this.sidebarElement) {
            this.sidebarElement.setAttribute('aria-hidden', 'true');
        }
    }

    handleNavClick(link) {
        const page = link.getAttribute('data-page');
        const href = link.getAttribute('href');
        
        if (!page) {
            console.warn('No data-page attribute found on navigation link');
            return;
        }

        // Check for Pro features
        const badge = link.querySelector('.badge--pro');
        if (badge && !this.hasProAccess()) {
            this.showProRequiredMessage();
            return;
        }

        // Set active link immediately for better UX
        this.setActiveLink(page);

        // Dispatch navigation event
        const navigationEvent = new CustomEvent('navigate', {
            detail: { 
                page,
                href,
                link 
            }
        });
        
        document.dispatchEvent(navigationEvent);
    }

    setActiveLink(page) {
        // Remove active class from all links
        const allLinks = document.querySelectorAll('.sidebar__nav-link');
        allLinks.forEach(link => {
            link.classList.remove('sidebar__nav-link--active', 'active');
        });

        // Add active class to current page link
        const activeLink = document.querySelector(`[data-page="${page}"]`);
        if (activeLink) {
            activeLink.classList.add('sidebar__nav-link--active', 'active');
            this.activeLink = activeLink;

            // Update ARIA attributes for accessibility
            allLinks.forEach(link => {
                link.setAttribute('aria-current', 'false');
            });
            activeLink.setAttribute('aria-current', 'page');
        }
    }

    toggleMobileMenu() {
        if (this.mobileMenuOpen) {
            this.closeMobileMenu();
        } else {
            this.openMobileMenu();
        }
    }

    openMobileMenu() {
        if (!this.sidebarElement) return;

        this.mobileMenuOpen = true;
        this.sidebarElement.classList.add('sidebar--open');
        
        if (this.overlay) {
            this.overlay.classList.add('sidebar-overlay--show');
        }

        // Update ARIA attributes
        this.sidebarElement.setAttribute('aria-hidden', 'false');
        
        // Focus management
        const firstLink = this.sidebarElement.querySelector('.sidebar__nav-link');
        if (firstLink) {
            firstLink.focus();
        }

        // Prevent body scroll
        document.body.style.overflow = 'hidden';

        console.log('📱 Mobile menu opened');
    }

    closeMobileMenu() {
        if (!this.sidebarElement) return;

        this.mobileMenuOpen = false;
        this.sidebarElement.classList.remove('sidebar--open');
        
        if (this.overlay) {
            this.overlay.classList.remove('sidebar-overlay--show');
        }

        // Update ARIA attributes
        this.sidebarElement.setAttribute('aria-hidden', 'true');

        // Restore body scroll
        document.body.style.overflow = '';

        console.log('📱 Mobile menu closed');
    }

    createMobileOverlay() {
        // Create overlay element for mobile menu
        this.overlay = document.createElement('div');
        this.overlay.className = 'sidebar-overlay';
        this.overlay.setAttribute('aria-hidden', 'true');
        document.body.appendChild(this.overlay);
    }

    hasProAccess() {
        // Check if user has Pro access (demo or paid)
        // This would normally check the user's subscription status
        return true; // For demo purposes, always return true
    }

    showProRequiredMessage() {
        // Show message that Pro subscription is required
        const toast = document.querySelector('.toast');
        if (toast) {
            // Dispatch toast event
            const toastEvent = new CustomEvent('show-toast', {
                detail: {
                    title: 'Pro Feature',
                    message: 'This feature requires a Pro subscription. Upgrade now to access it!',
                    type: 'warning'
                }
            });
            document.dispatchEvent(toastEvent);
        }
    }

    // Method to programmatically navigate
    navigateTo(page) {
        const link = document.querySelector(`[data-page="${page}"]`);
        if (link) {
            this.handleNavClick(link);
        }
    }

    // Get current active page
    getCurrentPage() {
        return this.activeLink ? this.activeLink.getAttribute('data-page') : 'dashboard';
    }

    // Method to highlight navigation based on current route
    updateFromRoute() {
        const hash = window.location.hash.substring(1);
        if (hash) {
            this.setActiveLink(hash);
        }
    }

    // Keyboard navigation for sidebar
    handleKeyboardNavigation(event) {
        const focusedElement = document.activeElement;
        const navLinks = Array.from(document.querySelectorAll('.sidebar__nav-link'));
        const currentIndex = navLinks.indexOf(focusedElement);

        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                const nextIndex = (currentIndex + 1) % navLinks.length;
                navLinks[nextIndex].focus();
                break;
            
            case 'ArrowUp':
                event.preventDefault();
                const prevIndex = currentIndex === 0 ? navLinks.length - 1 : currentIndex - 1;
                navLinks[prevIndex].focus();
                break;
            
            case 'Home':
                event.preventDefault();
                navLinks[0].focus();
                break;
            
            case 'End':
                event.preventDefault();
                navLinks[navLinks.length - 1].focus();
                break;
        }
    }

    // Clean up event listeners
    destroy() {
        if (this.overlay && this.overlay.parentNode) {
            this.overlay.parentNode.removeChild(this.overlay);
        }
        
        // Remove event listeners
        const navLinks = document.querySelectorAll('.sidebar__nav-link');
        navLinks.forEach(link => {
            link.removeEventListener('click', this.handleNavClick);
        });

        if (this.mobileToggleBtn) {
            this.mobileToggleBtn.removeEventListener('click', this.toggleMobileMenu);
        }

        console.log('🧭 Navigation destroyed');
    }
}

// Auto-initialize sidebar on all pages
document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    const auth = JSON.parse(localStorage.getItem('claimcipher_auth') || '{}');
    if (!auth.authenticated && !window.location.pathname.includes('login.html')) {
        const pathPrefix = window.location.pathname.includes('/pages/') ? '../' : '';
        window.location.href = pathPrefix + 'login.html';
        return;
    }
    
    // Initialize global sidebar on authenticated pages
    if (auth.authenticated) {
        Navigation.initializeGlobalSidebar();
    }
});

export default Navigation;