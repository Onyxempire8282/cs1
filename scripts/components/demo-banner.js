// Demo Banner Component
class DemoBanner {
    constructor() {
        this.countdownElement = null;
        this.upgradeBtn = null;
        this.countdownInterval = null;
        this.demoExpiryDate = null;
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.initDemoExpiry();
        this.startCountdown();
        
        console.log('⏰ Demo Banner initialized');
    }

    setupElements() {
        this.countdownElement = document.getElementById('demo-countdown');
        this.upgradeBtn = document.getElementById('upgrade-btn');
        
        if (!this.countdownElement) {
            console.warn('Demo countdown element not found');
        }
    }

    setupEventListeners() {
        if (this.upgradeBtn) {
            this.upgradeBtn.addEventListener('click', () => {
                this.handleUpgradeClick();
            });
        }

        // Update countdown when window becomes visible
        document.addEventListener('visibilitychange', () => {
            if (!document.hidden) {
                this.updateCountdown();
            }
        });

        // Handle demo expiry
        document.addEventListener('demo-expired', () => {
            this.handleDemoExpiry();
        });
    }

    initDemoExpiry() {
        // Set demo expiry to 7 days from now (for demo purposes)
        // In production, this would come from the server
        const now = new Date();
        this.demoExpiryDate = new Date(now.getTime() + (6 * 24 + 14) * 60 * 60 * 1000); // 6 days, 14 hours
        
        console.log(`Demo expires at: ${this.demoExpiryDate.toISOString()}`);
    }

    startCountdown() {
        this.updateCountdown();
        
        // Update every minute
        this.countdownInterval = setInterval(() => {
            this.updateCountdown();
        }, 60000);
    }

    updateCountdown() {
        if (!this.countdownElement || !this.demoExpiryDate) return;

        const now = new Date();
        const timeRemaining = this.demoExpiryDate - now;

        if (timeRemaining <= 0) {
            this.handleDemoExpiry();
            return;
        }

        const { days, hours, minutes } = this.calculateTimeRemaining(timeRemaining);
        
        let countdownText = '';
        
        if (days > 0) {
            countdownText = `${days} day${days !== 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''} remaining`;
        } else if (hours > 0) {
            countdownText = `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
        } else {
            countdownText = `${minutes} minute${minutes !== 1 ? 's' : ''} remaining`;
        }

        this.countdownElement.textContent = countdownText;

        // Update urgency styling based on time remaining
        this.updateUrgencyLevel(timeRemaining);
    }

    calculateTimeRemaining(timeRemaining) {
        const days = Math.floor(timeRemaining / (1000 * 60 * 60 * 24));
        const hours = Math.floor((timeRemaining % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((timeRemaining % (1000 * 60 * 60)) / (1000 * 60));

        return { days, hours, minutes };
    }

    updateUrgencyLevel(timeRemaining) {
        const banner = document.querySelector('.demo-banner');
        if (!banner) return;

        // Remove existing urgency classes
        banner.classList.remove('demo-banner--urgent', 'demo-banner--critical');

        const hoursRemaining = timeRemaining / (1000 * 60 * 60);

        if (hoursRemaining <= 2) {
            banner.classList.add('demo-banner--critical');
            // Update countdown more frequently when critical
            if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = setInterval(() => {
                    this.updateCountdown();
                }, 30000); // Every 30 seconds
            }
        } else if (hoursRemaining <= 24) {
            banner.classList.add('demo-banner--urgent');
            // Update countdown more frequently when urgent
            if (this.countdownInterval) {
                clearInterval(this.countdownInterval);
                this.countdownInterval = setInterval(() => {
                    this.updateCountdown();
                }, 30000); // Every 30 seconds
            }
        }
    }

    handleUpgradeClick() {
        console.log('💳 Upgrade button clicked');
        
        // Dispatch upgrade event
        const upgradeEvent = new CustomEvent('upgrade-requested', {
            detail: {
                source: 'demo-banner',
                timeRemaining: this.getTimeRemaining()
            }
        });
        document.dispatchEvent(upgradeEvent);

        // Show upgrade modal or redirect to billing
        this.showUpgradeModal();
    }

    showUpgradeModal() {
        // In a real app, this would show a Stripe checkout or billing page
        const toast = new CustomEvent('show-toast', {
            detail: {
                title: 'Upgrade to Pro',
                message: 'Redirecting to billing page...',
                type: 'info',
                duration: 3000
            }
        });
        document.dispatchEvent(toast);

        // Simulate redirect delay
        setTimeout(() => {
            console.log('🔄 Would redirect to: /billing/upgrade');
            // In production: window.location.href = '/billing/upgrade';
        }, 1000);
    }

    handleDemoExpiry() {
        console.log('⏰ Demo expired');
        
        // Clear countdown
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        // Update countdown text
        if (this.countdownElement) {
            this.countdownElement.textContent = 'Demo expired';
        }

        // Dispatch expiry event
        const expiryEvent = new CustomEvent('demo-expired', {
            detail: {
                expiredAt: new Date().toISOString()
            }
        });
        document.dispatchEvent(expiryEvent);

        // Lock the application
        this.lockApplication();
    }

    lockApplication() {
        // Show upgrade required message
        const upgradeRequired = new CustomEvent('show-toast', {
            detail: {
                title: 'Demo Expired',
                message: 'Your demo has expired. Please upgrade to continue using Claim Cipher.',
                type: 'warning',
                duration: 0 // Don't auto-hide
            }
        });
        document.dispatchEvent(upgradeRequired);

        // Disable navigation (except settings for upgrade)
        const navLinks = document.querySelectorAll('.sidebar__nav-link:not([data-page="settings"])');
        navLinks.forEach(link => {
            link.style.pointerEvents = 'none';
            link.style.opacity = '0.5';
            link.setAttribute('aria-disabled', 'true');
        });

        // Show overlay on main content
        const mainContent = document.getElementById('main-content');
        if (mainContent) {
            mainContent.innerHTML = `
                <div class="demo-expired-overlay">
                    <div class="demo-expired-content">
                        <div class="demo-expired-icon">⏰</div>
                        <h2>Demo Expired</h2>
                        <p>Your 7-day Pro demo has ended. Upgrade now to continue using all Pro features.</p>
                        <div class="demo-expired-actions">
                            <button class="btn btn--primary btn--large" onclick="window.app.navigation.navigateTo('settings')">
                                Upgrade to Pro
                            </button>
                            <button class="btn btn--secondary" onclick="this.showBasicFeatures()">
                                Continue with Basic
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }
    }

    getTimeRemaining() {
        if (!this.demoExpiryDate) return 0;
        
        const now = new Date();
        return Math.max(0, this.demoExpiryDate - now);
    }

    // Method to extend demo (admin function)
    extendDemo(hours = 24) {
        if (this.demoExpiryDate) {
            this.demoExpiryDate = new Date(this.demoExpiryDate.getTime() + hours * 60 * 60 * 1000);
            this.updateCountdown();
            
            console.log(`Demo extended by ${hours} hours. New expiry: ${this.demoExpiryDate.toISOString()}`);
            
            const extendedToast = new CustomEvent('show-toast', {
                detail: {
                    title: 'Demo Extended',
                    message: `Your demo has been extended by ${hours} hours.`,
                    type: 'success'
                }
            });
            document.dispatchEvent(extendedToast);
        }
    }

    // Method to simulate upgrade completion
    completeUpgrade() {
        console.log('✅ Upgrade completed');
        
        // Hide demo banner
        const banner = document.querySelector('.demo-banner');
        if (banner) {
            banner.style.display = 'none';
        }

        // Clear countdown
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
            this.countdownInterval = null;
        }

        // Unlock application
        const navLinks = document.querySelectorAll('.sidebar__nav-link');
        navLinks.forEach(link => {
            link.style.pointerEvents = '';
            link.style.opacity = '';
            link.removeAttribute('aria-disabled');
        });

        // Show success message
        const upgradeSuccess = new CustomEvent('show-toast', {
            detail: {
                title: 'Upgrade Successful!',
                message: 'Welcome to Claim Cipher Pro! All features are now unlocked.',
                type: 'success',
                duration: 5000
            }
        });
        document.dispatchEvent(upgradeSuccess);
    }

    // Clean up
    destroy() {
        if (this.countdownInterval) {
            clearInterval(this.countdownInterval);
        }

        if (this.upgradeBtn) {
            this.upgradeBtn.removeEventListener('click', this.handleUpgradeClick);
        }

        console.log('⏰ Demo Banner destroyed');
    }
}

export default DemoBanner;