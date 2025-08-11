// Toast Notification Component
class Toast {
    constructor() {
        this.toastElement = null;
        this.currentToast = null;
        this.queue = [];
        this.isShowing = false;
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        console.log('🍞 Toast component initialized');
    }

    setupElements() {
        this.toastElement = document.getElementById('toast');
        
        if (!this.toastElement) {
            console.warn('Toast element not found');
            return;
        }

        // Set initial ARIA attributes
        this.toastElement.setAttribute('role', 'alert');
        this.toastElement.setAttribute('aria-live', 'polite');
        this.toastElement.setAttribute('aria-atomic', 'true');
    }

    setupEventListeners() {
        // Close button click
        const closeBtn = document.getElementById('toast-close');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hide();
            });
        }

        // Auto-hide on click
        if (this.toastElement) {
            this.toastElement.addEventListener('click', (event) => {
                // Don't hide if clicking the close button
                if (event.target.id !== 'toast-close') {
                    this.hide();
                }
            });
        }

        // Listen for custom toast events
        document.addEventListener('show-toast', (event) => {
            const { title, message, type, duration } = event.detail;
            this.show(message, type, title, duration);
        });

        // Keyboard support
        document.addEventListener('keydown', (event) => {
            if (event.key === 'Escape' && this.isShowing) {
                this.hide();
            }
        });
    }

    show(message, type = 'success', title = null, duration = 4000) {
        const toastConfig = {
            message,
            type,
            title: title || this.getDefaultTitle(type),
            duration
        };

        // Add to queue if currently showing a toast
        if (this.isShowing) {
            this.queue.push(toastConfig);
            return;
        }

        this.displayToast(toastConfig);
    }

    displayToast({ message, type, title, duration }) {
        if (!this.toastElement) return;

        this.isShowing = true;
        this.currentToast = { message, type, title, duration };

        // Update content
        this.updateToastContent(title, message, type);

        // Show toast
        this.toastElement.classList.add('toast--show');

        // Auto-hide after duration
        if (duration > 0) {
            setTimeout(() => {
                this.hide();
            }, duration);
        }

        // Announce to screen readers
        this.announceToScreenReader(title, message);

        console.log(`🍞 Toast shown: ${type} - ${title}`);
    }

    updateToastContent(title, message, type) {
        const titleElement = document.getElementById('toast-title');
        const descriptionElement = document.getElementById('toast-description');
        const iconElement = document.getElementById('toast-icon');

        if (titleElement) {
            titleElement.textContent = title;
        }

        if (descriptionElement) {
            descriptionElement.textContent = message;
        }

        if (iconElement) {
            iconElement.textContent = this.getIcon(type);
        }

        // Update toast styling based on type
        this.updateToastStyling(type);
    }

    updateToastStyling(type) {
        if (!this.toastElement) return;

        // Remove existing type classes
        const typeClasses = ['toast--success', 'toast--error', 'toast--warning', 'toast--info'];
        typeClasses.forEach(className => {
            this.toastElement.classList.remove(className);
        });

        // Add new type class
        if (type && type !== 'success') {
            this.toastElement.classList.add(`toast--${type}`);
        }
    }

    hide() {
        if (!this.toastElement || !this.isShowing) return;

        this.toastElement.classList.remove('toast--show');
        this.isShowing = false;
        this.currentToast = null;

        // Process queue after animation completes
        setTimeout(() => {
            this.processQueue();
        }, 300); // Match CSS transition duration

        console.log('🍞 Toast hidden');
    }

    processQueue() {
        if (this.queue.length > 0) {
            const nextToast = this.queue.shift();
            this.displayToast(nextToast);
        }
    }

    getDefaultTitle(type) {
        const titles = {
            success: 'Success!',
            error: 'Error',
            warning: 'Warning',
            info: 'Info'
        };
        return titles[type] || 'Notification';
    }

    getIcon(type) {
        const icons = {
            success: '✓',
            error: '✕',
            warning: '⚠',
            info: 'ℹ'
        };
        return icons[type] || '✓';
    }

    announceToScreenReader(title, message) {
        // Create a live region announcement
        const announcement = `${title}: ${message}`;
        
        if (this.toastElement) {
            this.toastElement.setAttribute('aria-label', announcement);
        }
    }

    // Convenience methods for different toast types
    success(message, title = null, duration = 4000) {
        this.show(message, 'success', title, duration);
    }

    error(message, title = null, duration = 6000) {
        this.show(message, 'error', title, duration);
    }

    warning(message, title = null, duration = 5000) {
        this.show(message, 'warning', title, duration);
    }

    info(message, title = null, duration = 4000) {
        this.show(message, 'info', title, duration);
    }

    // Clear all toasts
    clear() {
        this.queue = [];
        this.hide();
    }

    // Get current toast info
    getCurrent() {
        return this.currentToast;
    }

    // Check if toast is currently showing
    isVisible() {
        return this.isShowing;
    }

    // Destroy toast component
    destroy() {
        this.clear();
        
        // Remove event listeners
        const closeBtn = document.getElementById('toast-close');
        if (closeBtn) {
            closeBtn.removeEventListener('click', this.hide);
        }

        if (this.toastElement) {
            this.toastElement.removeEventListener('click', this.hide);
        }

        console.log('🍞 Toast component destroyed');
    }
}

export default Toast;