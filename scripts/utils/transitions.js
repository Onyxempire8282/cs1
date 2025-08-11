// Page transition and loading manager
class PageTransitionManager {
    constructor() {
        this.isTransitioning = false;
        this.init();
    }

    init() {
        this.addPageLoadAnimation();
        this.setupNavigationTransitions();
        this.setupLoadingStates();
    }

    addPageLoadAnimation() {
        // Add fade-in animation to main content on page load
        const main = document.querySelector('.main');
        if (main) {
            main.style.opacity = '0';
            main.style.transform = 'translateY(20px)';
            main.style.transition = 'opacity 0.3s ease-out, transform 0.3s ease-out';
            
            // Animate in after a short delay
            setTimeout(() => {
                main.style.opacity = '1';
                main.style.transform = 'translateY(0)';
            }, 100);
        }
    }

    setupNavigationTransitions() {
        // Add click handlers to navigation links for smooth transitions
        const navLinks = document.querySelectorAll('.sidebar__nav-link');
        
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                if (this.isTransitioning) {
                    e.preventDefault();
                    return;
                }
                
                // Don't intercept external links or current page
                const href = link.getAttribute('href');
                if (!href || href.startsWith('http') || href === window.location.pathname) {
                    return;
                }
                
                e.preventDefault();
                this.transitionToPage(href);
            });
        });
    }

    async transitionToPage(url) {
        if (this.isTransitioning) return;
        
        this.isTransitioning = true;
        
        try {
            // Show loading indicator
            this.showPageLoading();
            
            // Fade out current content
            const main = document.querySelector('.main');
            if (main) {
                main.style.opacity = '0';
                main.style.transform = 'translateY(-20px)';
            }
            
            // Wait for transition
            await this.delay(300);
            
            // Navigate to new page
            window.location.href = url;
            
        } catch (error) {
            console.error('Page transition failed:', error);
            this.hidePageLoading();
            this.isTransitioning = false;
        }
    }

    showPageLoading() {
        // Create or show loading overlay
        let loader = document.getElementById('page-loader');
        if (!loader) {
            loader = document.createElement('div');
            loader.id = 'page-loader';
            loader.innerHTML = `
                <div class="page-loader-content">
                    <div class="page-loader-spinner"></div>
                    <div class="page-loader-text">Loading...</div>
                </div>
            `;
            loader.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                bottom: 0;
                background: rgba(15, 23, 42, 0.8);
                backdrop-filter: blur(4px);
                z-index: 9999;
                display: flex;
                align-items: center;
                justify-content: center;
                opacity: 0;
                transition: opacity 0.2s ease-out;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                .page-loader-content {
                    text-align: center;
                    color: var(--text-primary);
                }
                
                .page-loader-spinner {
                    width: 32px;
                    height: 32px;
                    border: 3px solid var(--border);
                    border-top: 3px solid var(--primary);
                    border-radius: 50%;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 16px;
                }
                
                .page-loader-text {
                    font-size: 14px;
                    color: var(--text-secondary);
                }
            `;
            document.head.appendChild(style);
            document.body.appendChild(loader);
        }
        
        // Show with animation
        loader.style.display = 'flex';
        setTimeout(() => {
            loader.style.opacity = '1';
        }, 10);
    }

    hidePageLoading() {
        const loader = document.getElementById('page-loader');
        if (loader) {
            loader.style.opacity = '0';
            setTimeout(() => {
                loader.style.display = 'none';
            }, 200);
        }
    }

    setupLoadingStates() {
        // Add loading states to forms and buttons
        const forms = document.querySelectorAll('form');
        forms.forEach(form => {
            form.addEventListener('submit', (e) => {
                const submitBtn = form.querySelector('button[type="submit"]');
                if (submitBtn && !submitBtn.classList.contains('loading')) {
                    this.setButtonLoading(submitBtn, true);
                }
            });
        });
    }

    setButtonLoading(button, loading) {
        if (loading) {
            button.disabled = true;
            button.classList.add('loading');
            
            // Add spinner if not exists
            if (!button.querySelector('.btn-spinner')) {
                const originalText = button.innerHTML;
                button.setAttribute('data-original-text', originalText);
                
                button.innerHTML = `
                    <div class="btn-spinner"></div>
                    <span>Loading...</span>
                `;
            }
        } else {
            button.disabled = false;
            button.classList.remove('loading');
            
            // Restore original text
            const originalText = button.getAttribute('data-original-text');
            if (originalText) {
                button.innerHTML = originalText;
                button.removeAttribute('data-original-text');
            }
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Mobile navigation manager
class MobileNavManager {
    constructor() {
        this.isOpen = false;
        this.init();
    }

    init() {
        this.createMobileToggle();
        this.createOverlay();
        this.setupEventListeners();
    }

    createMobileToggle() {
        // Check if toggle already exists
        if (document.querySelector('.sidebar__mobile-toggle')) return;
        
        const toggle = document.createElement('button');
        toggle.className = 'sidebar__mobile-toggle';
        toggle.innerHTML = `
            <span></span>
            <span></span>
            <span></span>
        `;
        toggle.setAttribute('aria-label', 'Toggle mobile menu');
        
        document.body.appendChild(toggle);
    }

    createOverlay() {
        // Check if overlay already exists
        if (document.querySelector('.sidebar-overlay')) return;
        
        const overlay = document.createElement('div');
        overlay.className = 'sidebar-overlay';
        document.body.appendChild(overlay);
    }

    setupEventListeners() {
        const toggle = document.querySelector('.sidebar__mobile-toggle');
        const overlay = document.querySelector('.sidebar-overlay');
        const sidebar = document.querySelector('.sidebar');

        if (toggle) {
            toggle.addEventListener('click', () => {
                this.toggle();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', () => {
                this.close();
            });
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        // Close when clicking nav links on mobile
        const navLinks = document.querySelectorAll('.sidebar__nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                if (window.innerWidth <= 768) {
                    this.close();
                }
            });
        });
    }

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    open() {
        this.isOpen = true;
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const toggle = document.querySelector('.sidebar__mobile-toggle');

        if (sidebar) sidebar.classList.add('sidebar--open');
        if (overlay) overlay.classList.add('sidebar-overlay--show');
        if (toggle) toggle.classList.add('sidebar__mobile-toggle--active');
        
        // Prevent body scroll
        document.body.style.overflow = 'hidden';
    }

    close() {
        this.isOpen = false;
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');
        const toggle = document.querySelector('.sidebar__mobile-toggle');

        if (sidebar) sidebar.classList.remove('sidebar--open');
        if (overlay) overlay.classList.remove('sidebar-overlay--show');
        if (toggle) toggle.classList.remove('sidebar__mobile-toggle--active');
        
        // Restore body scroll
        document.body.style.overflow = '';
    }
}

// Initialize managers
window.pageTransitionManager = new PageTransitionManager();
window.mobileNavManager = new MobileNavManager();

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { PageTransitionManager, MobileNavManager };
}
