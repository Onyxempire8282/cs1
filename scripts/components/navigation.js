// Navigation Component
class Navigation {
    constructor() {
        this.activeLink = null;
        this.mobileMenuOpen = false;
        this.sidebarElement = null;
        this.mobileToggleBtn = null;
        this.overlay = null;
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

export default Navigation;