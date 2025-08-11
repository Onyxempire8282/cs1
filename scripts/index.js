// Main application entry point
import Navigation from './components/navigation.js';
import DemoBanner from './components/demo-banner.js';
import Toast from './components/toast.js';
import { APP_CONFIG } from './utils/constants.js';

class ClaimCipherApp {
    constructor() {
        this.currentPage = 'dashboard';
        this.isLoading = false;
        
        // Initialize components
        this.navigation = new Navigation();
        this.demoBanner = new DemoBanner();
        this.toast = new Toast();
        
        this.init();
    }

    async init() {
        try {
            console.log('🚀 Initializing Claim Cipher App...');
            
            // Show loading state
            this.showLoading(true);
            
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupApp());
            } else {
                this.setupApp();
            }
            
        } catch (error) {
            console.error('❌ App initialization failed:', error);
            this.toast.show('Application failed to load', 'error');
        }
    }

    setupApp() {
        // Initialize all components
        this.navigation.init();
        this.demoBanner.init();
        this.toast.init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load initial page
        this.loadPage(this.currentPage);
        
        // Hide loading state
        this.showLoading(false);
        
        console.log('✅ App initialized successfully');
        this.toast.show('Welcome to Claim Cipher!', 'success');
    }

    setupEventListeners() {
        // Navigation events
        document.addEventListener('navigate', (event) => {
            this.loadPage(event.detail.page);
        });

        // Global keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardShortcuts(event);
        });

        // Handle online/offline status
        window.addEventListener('online', () => {
            this.toast.show('Connection restored', 'success');
        });

        window.addEventListener('offline', () => {
            this.toast.show('You are now offline', 'warning');
        });

        // Handle visibility change (tab switching)
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                console.log('App hidden');
            } else {
                console.log('App visible');
                this.demoBanner.updateCountdown();
            }
        });
    }

    handleKeyboardShortcuts(event) {
        // Alt + number keys for quick navigation
        if (event.altKey && event.key >= '1' && event.key <= '9') {
            event.preventDefault();
            const pageIndex = parseInt(event.key) - 1;
            const pages = ['dashboard', 'mileage', 'routes', 'jobs', 'autoforms', 'comparables', 'firms', 'gear', 'help', 'settings'];
            
            if (pages[pageIndex]) {
                this.loadPage(pages[pageIndex]);
            }
        }

        // Escape key to close modals/menus
        if (event.key === 'Escape') {
            this.navigation.closeMobileMenu();
            // Close any open modals/dropdowns
            document.querySelectorAll('.modal--open, .dropdown--open').forEach(element => {
                element.classList.remove('modal--open', 'dropdown--open');
            });
        }

        // Ctrl/Cmd + K for search (future feature)
        if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
            event.preventDefault();
            console.log('Search shortcut triggered (future feature)');
        }
    }

    async loadPage(pageName) {
        if (this.isLoading || pageName === this.currentPage) return;

        try {
            this.showLoading(true);
            console.log(`📄 Loading page: ${pageName}`);

            // Simulate loading delay for demo
            await this.delay(300);

            const pageContent = await this.getPageContent(pageName);
            const mainContent = document.getElementById('main-content');
            
            if (mainContent && pageContent) {
                // Fade out current content
                mainContent.style.opacity = '0';
                
                await this.delay(150);
                
                // Update content
                mainContent.innerHTML = pageContent;
                
                // Fade in new content
                mainContent.style.opacity = '1';
                mainContent.classList.add('fade-in');
                
                // Update current page
                this.currentPage = pageName;
                
                // Initialize page-specific functionality
                await this.initPageScripts(pageName);
                
                // Update URL without page refresh
                window.history.pushState({ page: pageName }, '', `#${pageName}`);
                
                console.log(`✅ Page loaded: ${pageName}`);
            } else {
                throw new Error(`Failed to load page: ${pageName}`);
            }

        } catch (error) {
            console.error(`❌ Error loading page ${pageName}:`, error);
            this.toast.show(`Failed to load ${pageName} page`, 'error');
        } finally {
            this.showLoading(false);
        }
    }

    async getPageContent(pageName) {
        // In a real app, this would fetch from the server or load page modules
        // For now, we'll return static content based on the page name
        
        const pageContent = {
            dashboard: this.getDashboardContent(),
            mileage: this.getMileageContent(),
            routes: this.getRoutesContent(),
            jobs: this.getJobsContent(),
            autoforms: this.getAutoformsContent(),
            comparables: this.getComparablesContent(),
            firms: this.getFirmsContent(),
            gear: this.getGearContent(),
            help: this.getHelpContent(),
            settings: this.getSettingsContent()
        };

        return pageContent[pageName] || this.getNotFoundContent();
    }

    async initPageScripts(pageName) {
        try {
            // Dynamically import and initialize page-specific scripts
            const pageModule = await import(`./pages/${pageName}.js`);
            if (pageModule.default && typeof pageModule.default.init === 'function') {
                pageModule.default.init();
            }
        } catch (error) {
            // Page script doesn't exist or failed to load
            console.log(`ℹ️ No specific script for page: ${pageName}`);
        }
    }

    showLoading(show) {
        this.isLoading = show;
        const loadingSpinner = document.getElementById('loading-spinner');
        const mainContent = document.getElementById('main-content');
        
        if (loadingSpinner) {
            loadingSpinner.style.display = show ? 'flex' : 'none';
        }
        
        if (mainContent && !show) {
            mainContent.style.display = 'block';
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Page content methods (these would typically be in separate files)
    getDashboardContent() {
        return `
            <div class="page-dashboard">
                <header class="main__header">
                    <h1 class="main__title">Dashboard</h1>
                    <p class="main__subtitle">Welcome back! Here's your activity overview.</p>
                </header>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card__value">247</div>
                        <div class="stat-card__label">Miles This Month</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__value">18</div>
                        <div class="stat-card__label">Routes Optimized</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__value">42</div>
                        <div class="stat-card__label">Jobs Completed</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__value">$1,847</div>
                        <div class="stat-card__label">Total Earnings</div>
                    </div>
                </div>

                <div class="dashboard-grid">
                    <div class="card">
                        <div class="card__header">
                            <h3 class="card__title">Recent Routes</h3>
                            <button class="btn btn--secondary btn--small" onclick="window.app.loadPage('routes')">View All</button>
                        </div>
                        <div class="recent-routes">
                            <div class="route-item">
                                <div class="route-item__info">
                                    <h4>Downtown Route - Aug 9</h4>
                                    <p>8 stops • 47 miles • 3.2 hours</p>
                                </div>
                                <span class="badge badge--success">Completed</span>
                            </div>
                        </div>
                    </div>

                    <div class="card">
                        <div class="card__header">
                            <h3 class="card__title">Active Jobs</h3>
                            <button class="btn btn--secondary btn--small" onclick="window.app.loadPage('jobs')">Mobile Sync</button>
                        </div>
                        <div class="active-jobs">
                            <div class="job-item">
                                <div class="job-item__info">
                                    <h4>2021 Honda Accord - #CLM-4891</h4>
                                    <p>Photos: 8/12 uploaded</p>
                                </div>
                                <div class="spinner"></div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getRoutesContent() {
        return `
            <div class="page-routes">
                <header class="main__header">
                    <h1 class="main__title">Route Optimizer</h1>
                    <p class="main__subtitle">Group stops within 50-mile radius and optimize your daily routes</p>
                </header>

                <div class="card">
                    <div class="route-controls">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label">Start Address</label>
                                <input type="text" class="form-input" value="Home" placeholder="Enter starting location">
                            </div>
                            <div class="form-group">
                                <label class="form-label">Route Rules</label>
                                <div class="rule-badges">
                                    <span class="badge">Max 50mi radius</span>
                                    <span class="badge">Max 10 stops/day</span>
                                    <span class="badge">Spillover: Tomorrow</span>
                                    <button class="btn btn--secondary btn--small">Edit Rules</button>
                                </div>
                            </div>
                        </div>

                        <div class="add-stop-form">
                            <div class="form-group">
                                <label class="form-label">Add Stops</label>
                                <div class="input-group">
                                    <input type="text" class="form-input" placeholder="Enter address or claim location" id="new-stop-address">
                                    <input type="text" class="form-input" placeholder="Claim #" id="new-stop-claim" style="width: 120px;">
                                    <button class="btn btn--primary" id="add-stop-btn">Add Stop</button>
                                </div>
                            </div>
                        </div>

                        <div class="route-actions">
                            <button class="btn btn--secondary">Import from CSV</button>
                            <button class="btn btn--primary" id="optimize-routes-btn">Optimize Routes</button>
                        </div>
                    </div>
                </div>

                <div class="map-container">
                    <div class="map-placeholder">
                        <div class="map-icon">🗺️</div>
                        <div>Interactive map will display optimized routes with color-coded polylines</div>
                    </div>
                </div>

                <div class="route-tabs">
                    <button class="route-tab route-tab--active" data-day="1">Day 1 - Aug 10 (8 stops, 47 mi)</button>
                    <button class="route-tab" data-day="2">Day 2 - Aug 11 (5 stops, 32 mi)</button>
                    <button class="route-tab" data-day="3">Day 3 - Aug 12 (2 stops, 18 mi)</button>
                </div>

                <div class="route-content">
                    <div class="grid grid--2">
                        <div class="card">
                            <div class="card__header">
                                <h3 class="card__title">Route Stops - Day 1</h3>
                                <div class="route-day-actions">
                                    <button class="btn btn--secondary btn--small">📅 Sync Calendar</button>
                                    <button class="btn btn--success btn--small">📄 Export PDF</button>
                                </div>
                            </div>
                            
                            <div class="route-stops" id="route-stops-day-1">
                                <!-- Route stops will be populated here -->
                            </div>

                            <div class="route-summary">
                                <strong>Day 1 Totals:</strong> 47.2 miles • 3.2 hours • $31.62 reimbursement
                            </div>
                        </div>

                        <div class="card">
                            <div class="card__header">
                                <h3 class="card__title">Route Summary</h3>
                            </div>
                            
                            <div class="summary-stats">
                                <h4>Multi-Day Overview</h4>
                                <div class="stats-mini">
                                    <div class="stat-mini">
                                        <div class="stat-mini__value">3</div>
                                        <div class="stat-mini__label">Days Required</div>
                                    </div>
                                    <div class="stat-mini">
                                        <div class="stat-mini__value">15</div>
                                        <div class="stat-mini__label">Total Stops</div>
                                    </div>
                                    <div class="stat-mini">
                                        <div class="stat-mini__value">97</div>
                                        <div class="stat-mini__label">Total Miles</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getJobsContent() {
        return `
            <div class="page-jobs">
                <header class="main__header">
                    <h1 class="main__title">Mobile Sync</h1>
                    <p class="main__subtitle">Manage field inspections and sync photos from mobile devices</p>
                    <span class="badge badge--pro">PRO FEATURE</span>
                </header>

                <div class="stats-grid">
                    <div class="stat-card">
                        <div class="stat-card__value">3</div>
                        <div class="stat-card__label">Active Jobs</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__value">12</div>
                        <div class="stat-card__label">Completed This Week</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__value">247</div>
                        <div class="stat-card__label">Photos Synced</div>
                    </div>
                    <div class="stat-card">
                        <div class="stat-card__value">2</div>
                        <div class="stat-card__label">Pending Summaries</div>
                    </div>
                </div>

                <div class="grid grid--2">
                    <div class="card">
                        <div class="card__header">
                            <h3 class="card__title">Active Jobs</h3>
                            <button class="btn btn--primary btn--small">+ Create Job</button>
                        </div>

                        <div class="job-list" id="active-jobs-list">
                            <!-- Jobs will be populated here -->
                        </div>
                    </div>

                    <div class="card">
                        <div class="card__header">
                            <h3 class="card__title">Photo Gallery</h3>
                            <button class="btn btn--secondary btn--small">📤 Request Missing</button>
                        </div>

                        <div class="job-gallery" id="job-gallery">
                            <!-- Photo gallery will be populated here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    getAutoformsContent() {
        return `
            <div class="page-autoforms">
                <header class="main__header">
                    <h1 class="main__title">AutoForms</h1>
                    <p class="main__subtitle">Auto-fill PDF forms from CCC estimates</p>
                </header>

                <div class="grid grid--2">
                    <div class="card">
                        <div class="card__header">
                            <h3 class="card__title">Upload CCC Estimate</h3>
                        </div>

                        <div class="file-drop-zone" id="pdf-drop-zone">
                            <div class="drop-zone-content">
                                <div class="drop-zone-icon">📄</div>
                                <div class="drop-zone-text">
                                    <strong>Drop your CCC estimate here</strong><br>
                                    <span>or click to browse files</span>
                                </div>
                                <button class="btn btn--primary" id="choose-file-btn">Choose File</button>
                                <div class="drop-zone-note">
                                    Privacy: Files are not saved unless you choose to save them
                                </div>
                            </div>
                        </div>

                        <div class="form-group">
                            <label class="form-label">Target Form Template</label>
                            <select class="form-input" id="form-template-select">
                                <option>BCIF - Basic Claim Information Form</option>
                                <option>ACV - Actual Cash Value Worksheet</option>
                                <option>Custom Template 1</option>
                            </select>
                        </div>

                        <button class="btn btn--success btn--full" id="extract-fill-btn">Extract & Auto-Fill</button>
                    </div>

                    <div class="card">
                        <div class="card__header">
                            <h3 class="card__title">Form Preview</h3>
                            <div class="preview-actions">
                                <button class="btn btn--secondary btn--small">Edit Fields</button>
                                <button class="btn btn--primary btn--small">Download PDF</button>
                            </div>
                        </div>

                        <div class="pdf-preview" id="pdf-preview">
                            <div class="preview-placeholder">
                                <div class="preview-icon">📋</div>
                                <div class="preview-text">
                                    Upload a CCC estimate to see the auto-filled form preview here
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card__header">
                        <h3 class="card__title">Extracted Data</h3>
                        <span class="badge badge--success">95% auto-mapped</span>
                    </div>

                    <div class="extracted-data" id="extracted-data">
                        <!-- Extracted data will be populated here -->
                    </div>
                </div>
            </div>
        `;
    }

    getSettingsContent() {
        return `
            <div class="page-settings">
                <header class="main__header">
                    <h1 class="main__title">Settings</h1>
                    <p class="main__subtitle">Manage your profile, security, and business settings</p>
                </header>

                <div class="settings-tabs">
                    <button class="settings-tab settings-tab--active" data-tab="profile">Profile</button>
                    <button class="settings-tab" data-tab="security">Security</button>
                    <button class="settings-tab" data-tab="business">Business</button>
                    <button class="settings-tab" data-tab="billing">Billing</button>
                </div>

                <div class="settings-content">
                    <div class="settings-panel settings-panel--active" id="profile-panel">
                        <div class="card">
                            <div class="card__header">
                                <h3 class="card__title">Profile Information</h3>
                            </div>
                            
                            <form class="settings-form" id="profile-form">
                                <div class="form-group">
                                    <label class="form-label">Full Name</label>
                                    <input type="text" class="form-input" value="John Smith">
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Email Address</label>
                                    <input type="email" class="form-input" value="john.smith@example.com">
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Timezone</label>
                                    <select class="form-input">
                                        <option selected>Eastern Time (UTC-5)</option>
                                        <option>Central Time (UTC-6)</option>
                                        <option>Mountain Time (UTC-7)</option>
                                        <option>Pacific Time (UTC-8)</option>
                                    </select>
                                </div>

                                <div class="form-actions">
                                    <button type="submit" class="btn btn--success">Save Changes</button>
                                    <button type="button" class="btn btn--secondary">Cancel</button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div class="settings-panel" id="business-panel">
                        <div class="card">
                            <div class="card__header">
                                <h3 class="card__title">Route Optimization Rules</h3>
                            </div>
                            
                            <form class="settings-form" id="route-rules-form">
                                <div class="form-group">
                                    <label class="form-label">Max Radius (miles)</label>
                                    <input type="number" class="form-input" value="50" min="1" max="100">
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Max Stops per Day</label>
                                    <input type="number" class="form-input" value="10" min="1" max="20">
                                </div>

                                <div class="form-group">
                                    <label class="form-label">Spillover Rule</label>
                                    <select class="form-input">
                                        <option selected>Tomorrow</option>
                                        <option>Next Business Day</option>
                                        <option>Monday</option>
                                        <option>Tuesday</option>
                                        <option>Wednesday</option>
                                        <option>Thursday</option>
                                        <option>Friday</option>
                                    </select>
                                </div>

                                <div class="form-actions">
                                    <button type="submit" class="btn btn--success">Save Rules</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Placeholder methods for other pages
    getComparablesContent() {
        return `
            <div class="page-comparables">
                <header class="main__header">
                    <h1 class="main__title">Comparables</h1>
                    <p class="main__subtitle">Find vehicle comparables from multiple sources</p>
                    <span class="badge badge--pro">PRO FEATURE</span>
                </header>
                <div class="card">
                    <p>Comparables feature coming soon...</p>
                </div>
            </div>
        `;
    }

    getFirmsContent() {
        return `
            <div class="page-firms">
                <header class="main__header">
                    <h1 class="main__title">Firms Directory</h1>
                    <p class="main__subtitle">Browse insurance firms and contact information</p>
                </header>
                <div class="card">
                    <p>Firms directory coming soon...</p>
                </div>
            </div>
        `;
    }

    getGearContent() {
        return `
            <div class="page-gear">
                <header class="main__header">
                    <h1 class="main__title">Gear</h1>
                    <p class="main__subtitle">Recommended tools and equipment for adjusters</p>
                </header>
                <div class="card">
                    <p>Gear recommendations coming soon...</p>
                </div>
            </div>
        `;
    }

    getHelpContent() {
        return `
            <div class="page-help">
                <header class="main__header">
                    <h1 class="main__title">Help & Support</h1>
                    <p class="main__subtitle">Get help with using Claim Cipher</p>
                </header>
                <div class="card">
                    <p>Help documentation coming soon...</p>
                </div>
            </div>
        `;
    }

    getNotFoundContent() {
        return `
            <div class="page-not-found">
                <header class="main__header">
                    <h1 class="main__title">Page Not Found</h1>
                    <p class="main__subtitle">The requested page could not be loaded</p>
                </header>
                <div class="card">
                    <p>Please use the navigation menu to select a different page.</p>
                    <button class="btn btn--primary" onclick="window.app.loadPage('dashboard')">Go to Dashboard</button>
                </div>
            </div>
        `;
    }
}

// Initialize the app when the script loads
const app = new ClaimCipherApp();

// Make app globally accessible for debugging and button clicks
window.app = app;

export default app;
    }

    getMileageContent() {
        return `
            <div class="page-mileage">
                <header class="main__header">
                    <h1 class="main__title">Mileage Calculator</h1>
                    <p class="main__subtitle">Calculate mileage and add to your tax log</p>
                </header>

                <div class="card">
                    <form class="mileage-form" id="mileage-form">
                        <div class="form-grid">
                            <div class="form-group">
                                <label class="form-label" for="firm-select">Firm</label>
                                <select class="form-input" id="firm-select" required>
                                    <option value="">Select a firm...</option>
                                    <option value="sedgwick">Sedgwick Claims - $0.67/mile</option>
                                    <option value="acd">ACD Adjusters - $0.62/mile</option>
                                    <option value="independent">Independent - $0.70/mile</option>
                                </select>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="start-address">Start Address</label>
                                <input type="text" class="form-input" id="start-address" placeholder="123 Main St, City, State" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="end-address">Destination</label>
                                <input type="text" class="form-input" id="end-address" placeholder="456 Oak Ave, City, State" required>
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="claim-number">Claim Number (Optional)</label>
                                <input type="text" class="form-input" id="claim-number" placeholder="CLM-1234">
                            </div>

                            <div class="form-group">
                                <label class="form-label" for="trip-type">Trip Type</label>
                                <select class="form-input" id="trip-type">
                                    <option value="round-trip">Round Trip</option>
                                    <option value="one-way">One Way</option>
                                </select>
                            </div>

                            <div class="form-actions">
                                <button type="submit" class="btn btn--primary">Calculate Mileage</button>
                                <button type="reset" class="btn btn--secondary">Clear Form</button>
                            </div>
                        </div>
                    </form>

                    <div class="mileage-result" id="mileage-result" style="display: none;">
                        <div class="result-card">
                            <div class="result-value" id="result-miles">0 miles</div>
                            <div class="result-amount" id="result-amount">$0.00 reimbursement</div>
                            <div class="result-actions">
                                <button class="btn btn--secondary btn--small" id="copy-result">Copy</button>
                                <button class="btn btn--success btn--small" id="save-log">Save to Log</button>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="card">
                    <div class="card__header">
                        <h3 class="card__title">Recent Tax Log Entries</h3>
                        <button class="btn btn--secondary btn--small" id="export-csv">Export CSV</button>
                    </div>
                    <div class="tax-log-table">
                        <div class="table-responsive">
                            <table class="data-table">
                                <thead>
                                    <tr>
                                        <th>Date</th>
                                        <th>Claim #</th>
                                        <th>Route</th>
                                        <th>Miles</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr>
                                        <td>Aug 9, 2025</td>
                                        <td>CLM-4891</td>
                                        <td>Home → 123 Insurance Way</td>
                                        <td>23.1</td>
                                        <td class="amount-positive">$15.48</td>
                                    </tr>
                                    <tr>
                                        <td>Aug 9, 2025</td>
                                        <td>CLM-4902</td>
                                        <td>123 Insurance Way → 456 Claim St</td>
                                        <td>18.7</td>
                                        <td class="amount-positive">$12.53</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>