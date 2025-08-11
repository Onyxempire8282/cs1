// Dashboard Page Module
import { EVENT_TYPES, TOAST_TYPES } from '../utils/constants.js';
import { storageHelpers, dateHelpers, numberHelpers } from '../utils/helpers.js';

class DashboardPage {
    constructor() {
        this.refreshInterval = null;
        this.userType = this.getUserType(); // Determine user type early
        this.statsData = {
            milesThisMonth: 0,
            routesOptimized: 0,
            jobsCompleted: 0,
            totalEarnings: 0
        };
        this.recentActivity = [];
        this.activeJobs = [];
        this.recentRoutes = [];
    }

    getUserType() {
        const auth = JSON.parse(localStorage.getItem('claimcipher_auth') || '{}');
        if (auth.demoMode) return 'demo';
        if (auth.masterLogin) return 'master';
        return 'authenticated';
    }

    init() {
        this.loadDashboardData();
        this.setupEventListeners();
        this.updateUserInterface();
        this.updateStats();
        this.updateRecentActivity();
        this.updateActiveJobs();
        this.updateRecentRoutes();
        this.startAutoRefresh();
        
        console.log(`📊 Dashboard page initialized for ${this.userType} user`);
    }

    updateUserInterface() {
        // Set user type attribute on body
        document.body.setAttribute('data-user-type', this.userType);
        
        if (this.userType === 'demo') {
            this.showDemoNotice();
        } else {
            this.hideDemoNotice();
        }
        
        // Update dashboard subtitle based on user type
        this.updateDashboardSubtitle();
    }

    updateDashboardSubtitle() {
        const subtitleEl = document.getElementById('dashboard-subtitle');
        if (!subtitleEl) return;
        
        const auth = JSON.parse(localStorage.getItem('claimcipher_auth') || '{}');
        const userName = auth.username || 'User';
        
        switch (this.userType) {
            case 'demo':
                subtitleEl.textContent = `Welcome to the demo! Here's what you'll be able to track.`;
                break;
            case 'master':
                subtitleEl.textContent = `Welcome back, ${userName}! You have full system access.`;
                break;
            default:
                subtitleEl.textContent = `Welcome back, ${userName}! Here's your activity overview.`;
        }
    }

    showDemoNotice() {
        const demoNotice = document.getElementById('demo-notice');
        if (demoNotice) {
            demoNotice.style.display = 'block';
        }
    }

    hideDemoNotice() {
        const demoNotice = document.getElementById('demo-notice');
        if (demoNotice) {
            demoNotice.style.display = 'none';
        }
    }

    setupEventListeners() {
        // Quick action buttons
        const quickActionButtons = document.querySelectorAll('.quick-actions .btn');
        quickActionButtons.forEach(btn => {
            btn.addEventListener('click', (event) => {
                this.handleQuickAction(event);
            });
        });

        // Refresh button (if exists)
        const refreshBtn = document.getElementById('refresh-dashboard');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshDashboard();
            });
        }

        // View all buttons
        document.addEventListener('click', (event) => {
            if (event.target.matches('[data-navigate]')) {
                const page = event.target.getAttribute('data-navigate');
                this.navigateToPage(page);
            }
        });

        // Card hover interactions
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.addEventListener('mouseenter', () => {
                this.highlightRelatedData(card);
            });
            
            card.addEventListener('mouseleave', () => {
                this.clearHighlights();
            });
        });

        // Activity timeline interactions
        const activityItems = document.querySelectorAll('.activity-item');
        activityItems.forEach(item => {
            item.addEventListener('click', () => {
                this.handleActivityClick(item);
            });
        });
    }

    loadDashboardData() {
        if (this.userType === 'demo') {
            // Load demo/example data
            this.loadDemoData();
        } else {
            // Load actual user data from storage or API
            this.loadUserData();
        }
    }

    loadDemoData() {
        // Demo users see example data to understand the functionality
        this.statsData = this.generateSampleStats();
        this.recentActivity = this.generateSampleActivity();
        this.activeJobs = this.generateSampleJobs();
        this.recentRoutes = this.generateSampleRoutes();
        
        console.log('📊 Demo data loaded');
    }

    loadUserData() {
        // Authenticated users see their actual data
        this.statsData = storageHelpers.getItem(`dashboard-stats-${this.getUserId()}`, {
            milesThisMonth: 0,
            routesOptimized: 0,
            jobsCompleted: 0,
            totalEarnings: 0
        });
        
        this.recentActivity = storageHelpers.getItem(`recent-activity-${this.getUserId()}`, []);
        this.activeJobs = storageHelpers.getItem(`active-jobs-${this.getUserId()}`, []);
        this.recentRoutes = storageHelpers.getItem(`recent-routes-${this.getUserId()}`, []);
        
        // If user has no data yet, show empty state or onboarding
        if (this.recentActivity.length === 0) {
            this.recentActivity = this.generateWelcomeActivity();
        }
        
        console.log('📊 User data loaded');
    }

    getUserId() {
        const auth = JSON.parse(localStorage.getItem('claimcipher_auth') || '{}');
        return auth.email ? auth.email.replace(/[^a-zA-Z0-9]/g, '_') : 'default_user';
    }

    generateWelcomeActivity() {
        return [
            {
                id: 1,
                type: 'info',
                icon: '🎉',
                title: 'Welcome to Claim Cipher!',
                description: 'Your dashboard will show real activity as you use the tools',
                timestamp: new Date().toISOString(),
                relatedPage: 'dashboard'
            },
            {
                id: 2,
                type: 'info',
                icon: '🚗',
                title: 'Start tracking mileage',
                description: 'Use the Mileage Calculator to log your first trip',
                timestamp: new Date().toISOString(),
                relatedPage: 'mileage'
            }
        ];
    }

    generateSampleStats() {
        const now = new Date();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const currentDay = now.getDate();
        
        // Generate realistic data based on current date
        const avgMilesPerDay = 12.3;
        const avgRoutesPerWeek = 4.5;
        const avgJobsPerDay = 2.1;
        const avgRatePerMile = 0.67;
        
        const milesThisMonth = Math.round(avgMilesPerDay * currentDay + Math.random() * 50);
        const routesOptimized = Math.round(avgRoutesPerWeek * (currentDay / 7));
        const jobsCompleted = Math.round(avgJobsPerDay * currentDay);
        const totalEarnings = Math.round(milesThisMonth * avgRatePerMile * 100) / 100;

        return {
            milesThisMonth,
            routesOptimized,
            jobsCompleted,
            totalEarnings
        };
    }

    generateSampleActivity() {
        const activities = [
            {
                id: 1,
                type: 'success',
                icon: '✓',
                title: 'Route optimized',
                description: 'Downtown route with 8 stops completed successfully',
                timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
                relatedPage: 'routes'
            },
            {
                id: 2,
                type: 'info',
                icon: '📱',
                title: 'Photos synced from mobile',
                description: '12 photos uploaded for CLM-4891',
                timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
                relatedPage: 'jobs'
            },
            {
                id: 3,
                type: 'warning',
                icon: '📄',
                title: 'Form auto-filled',
                description: 'BCIF completed for 2021 Honda Accord',
                timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
                relatedPage: 'autoforms'
            },
            {
                id: 4,
                type: 'success',
                icon: '💰',
                title: 'Mileage logged',
                description: '23.1 miles added to tax log ($15.48)',
                timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
                relatedPage: 'mileage'
            }
        ];

        return activities;
    }

    generateSampleJobs() {
        return [
            {
                id: 'job-1',
                title: '2021 Honda Accord',
                claimNumber: 'CLM-4891',
                status: 'in-progress',
                progress: 67,
                photosUploaded: 8,
                photosTotal: 12,
                device: 'iPhone 14 Pro',
                lastUpdate: new Date(Date.now() - 30 * 60 * 1000).toISOString()
            },
            {
                id: 'job-2',
                title: '2019 Toyota Camry',
                claimNumber: 'CLM-4902',
                status: 'complete',
                progress: 100,
                photosUploaded: 12,
                photosTotal: 12,
                device: 'Samsung Galaxy S24',
                lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
            },
            {
                id: 'job-3',
                title: '2020 Ford F-150',
                claimNumber: 'CLM-4876',
                status: 'pending',
                progress: 0,
                scheduledTime: '2:00 PM',
                location: '456 Oak Ave, Cary',
                lastUpdate: new Date().toISOString()
            }
        ];
    }

    generateSampleRoutes() {
        return [
            {
                id: 'route-1',
                name: 'Downtown Route',
                date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
                stops: 8,
                miles: 47,
                duration: 3.2,
                status: 'completed'
            },
            {
                id: 'route-2',
                name: 'Northside Loop',
                date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
                stops: 12,
                miles: 63,
                duration: 4.1,
                status: 'completed'
            },
            {
                id: 'route-3',
                name: 'Weekend Claims',
                date: new Date().toISOString(),
                stops: 5,
                miles: 28,
                duration: 2.0,
                status: 'planned'
            }
        ];
    }

    updateStats() {
        // Update stat cards with current data
        const statElements = {
            milesThisMonth: document.getElementById('miles-stat'),
            routesOptimized: document.getElementById('routes-stat'),
            jobsCompleted: document.getElementById('jobs-stat'),
            totalEarnings: document.getElementById('earnings-stat')
        };

        // Animate the numbers
        Object.keys(statElements).forEach(key => {
            const element = statElements[key];
            if (element) {
                this.animateNumber(element, this.statsData[key], key === 'totalEarnings');
            }
        });

        // Update progress indicators if they exist
        this.updateProgressIndicators();
    }

    animateNumber(element, targetValue, isCurrency = false) {
        const currentValue = parseFloat(element.textContent.replace(/[^0-9.-]/g, '')) || 0;
        const increment = (targetValue - currentValue) / 20;
        let currentStep = 0;

        const animate = () => {
            currentStep++;
            const newValue = currentValue + (increment * currentStep);
            
            if (currentStep >= 20) {
                element.textContent = isCurrency 
                    ? numberHelpers.formatCurrency(targetValue)
                    : numberHelpers.formatNumber(Math.round(targetValue));
                return;
            }

            element.textContent = isCurrency 
                ? numberHelpers.formatCurrency(newValue)
                : numberHelpers.formatNumber(Math.round(newValue));
            
            requestAnimationFrame(animate);
        };

        animate();
    }

    updateProgressIndicators() {
        // Update any progress bars or charts
        const progressBars = document.querySelectorAll('.progress-fill');
        progressBars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-progress') || '0';
            bar.style.width = `${targetWidth}%`;
        });
    }

    updateRecentActivity() {
        const activityContainer = document.querySelector('.activity-feed');
        if (!activityContainer) return;

        activityContainer.innerHTML = this.recentActivity.map(activity => `
            <div class="activity-item" data-activity-id="${activity.id}" data-page="${activity.relatedPage}">
                <div class="activity-icon activity-icon--${activity.type}">${activity.icon}</div>
                <div class="activity-content">
                    <div class="activity-title">${activity.title}</div>
                    <div class="activity-description">${activity.description}</div>
                    <div class="activity-time">${dateHelpers.getRelativeTime(activity.timestamp)}</div>
                </div>
            </div>
        `).join('');

        // Add click handlers to new activity items
        activityContainer.querySelectorAll('.activity-item').forEach(item => {
            item.addEventListener('click', () => {
                this.handleActivityClick(item);
            });
        });
    }

    updateActiveJobs() {
        const jobsContainer = document.querySelector('.active-jobs');
        if (!jobsContainer) return;

        jobsContainer.innerHTML = this.activeJobs.map(job => {
            let statusContent = '';
            
            if (job.status === 'in-progress') {
                statusContent = `
                    <div class="spinner"></div>
                `;
            } else if (job.status === 'complete') {
                statusContent = `
                    <button class="btn btn--success btn--small">Generate Summary</button>
                `;
            } else if (job.status === 'pending') {
                statusContent = `
                    <button class="btn btn--primary btn--small">Assign Device</button>
                `;
            }

            let progressText = '';
            if (job.photosTotal) {
                progressText = `Photos: ${job.photosUploaded}/${job.photosTotal} uploaded`;
            } else if (job.scheduledTime) {
                progressText = `Scheduled for today, ${job.scheduledTime}`;
            } else {
                progressText = `Last update: ${dateHelpers.getRelativeTime(job.lastUpdate)}`;
            }

            return `
                <div class="job-item" data-job-id="${job.id}">
                    <div class="job-item__info">
                        <h4>${job.title} - ${job.claimNumber}</h4>
                        <p>${progressText}</p>
                    </div>
                    ${statusContent}
                </div>
            `;
        }).join('');
    }

    updateRecentRoutes() {
        const routesContainer = document.querySelector('.recent-routes');
        if (!routesContainer) return;

        routesContainer.innerHTML = this.recentRoutes.map(route => {
            const badgeClass = route.status === 'completed' ? 'badge--success' : 'badge--warning';
            const statusText = route.status === 'completed' ? 'Completed' : 'Planned';

            return `
                <div class="route-item" data-route-id="${route.id}">
                    <div class="route-item__info">
                        <h4>${route.name} - ${dateHelpers.formatDate(route.date, { month: 'short', day: 'numeric' })}</h4>
                        <p>${route.stops} stops • ${route.miles} miles • ${route.duration} hours</p>
                    </div>
                    <span class="badge ${badgeClass}">${statusText}</span>
                </div>
            `;
        }).join('');
    }

    handleQuickAction(event) {
        const button = event.target.closest('.btn');
        if (!button) return;

        const action = button.textContent.trim();
        let targetPage = '';

        if (action.includes('Mileage')) {
            targetPage = 'mileage';
        } else if (action.includes('Route')) {
            targetPage = 'routes';
        } else if (action.includes('Form')) {
            targetPage = 'autoforms';
        }

        if (targetPage) {
            this.showToast(`Opening ${action}...`, TOAST_TYPES.INFO);
            setTimeout(() => {
                this.navigateToPage(targetPage);
            }, 500);
        }
    }

    handleActivityClick(item) {
        const activityId = item.getAttribute('data-activity-id');
        const relatedPage = item.getAttribute('data-page');
        
        if (relatedPage) {
            this.navigateToPage(relatedPage);
        }
    }

    navigateToPage(page) {
        const navigationEvent = new CustomEvent(EVENT_TYPES.NAVIGATE, {
            detail: { page }
        });
        document.dispatchEvent(navigationEvent);
    }

    highlightRelatedData(card) {
        // Add visual feedback when hovering over stat cards
        card.style.transform = 'scale(1.02)';
        card.style.boxShadow = 'var(--shadow-xl)';
    }

    clearHighlights() {
        // Remove visual feedback
        const statCards = document.querySelectorAll('.stat-card');
        statCards.forEach(card => {
            card.style.transform = '';
            card.style.boxShadow = '';
        });
    }

    refreshDashboard() {
        this.showToast('Refreshing dashboard...', TOAST_TYPES.INFO);
        
        // Simulate loading delay
        setTimeout(() => {
            this.loadDashboardData();
            this.updateStats();
            this.updateRecentActivity();
            this.updateActiveJobs();
            this.updateRecentRoutes();
            
            this.showToast('Dashboard refreshed', TOAST_TYPES.SUCCESS);
        }, 1000);
    }

    startAutoRefresh() {
        // Refresh dashboard data every 5 minutes
        this.refreshInterval = setInterval(() => {
            this.loadDashboardData();
            this.updateStats();
            this.updateRecentActivity();
            this.updateActiveJobs();
            this.updateRecentRoutes();
        }, 5 * 60 * 1000);
    }

    stopAutoRefresh() {
        if (this.refreshInterval) {
            clearInterval(this.refreshInterval);
            this.refreshInterval = null;
        }
    }

    addActivity(activity) {
        // Add new activity to the timeline
        this.recentActivity.unshift({
            id: Date.now(),
            timestamp: new Date().toISOString(),
            ...activity
        });

        // Keep only the last 10 activities
        this.recentActivity = this.recentActivity.slice(0, 10);
        
        // Save to storage and update UI
        storageHelpers.setItem('recent-activity', this.recentActivity);
        this.updateRecentActivity();
    }

    updateJobStatus(jobId, updates) {
        // Update specific job data
        const jobIndex = this.activeJobs.findIndex(job => job.id === jobId);
        if (jobIndex !== -1) {
            this.activeJobs[jobIndex] = { ...this.activeJobs[jobIndex], ...updates };
            storageHelpers.setItem('active-jobs', this.activeJobs);
            this.updateActiveJobs();
        }
    }

    updateStatistic(statName, value) {
        // Update specific statistic
        if (this.statsData.hasOwnProperty(statName)) {
            this.statsData[statName] = value;
            storageHelpers.setItem('dashboard-stats', this.statsData);
            this.updateStats();
        }
    }

    showToast(message, type = TOAST_TYPES.INFO) {
        const event = new CustomEvent(EVENT_TYPES.SHOW_TOAST, {
            detail: {
                message,
                type,
                title: this.getToastTitle(type)
            }
        });
        document.dispatchEvent(event);
    }

    getToastTitle(type) {
        const titles = {
            [TOAST_TYPES.SUCCESS]: 'Success!',
            [TOAST_TYPES.ERROR]: 'Error',
            [TOAST_TYPES.WARNING]: 'Warning',
            [TOAST_TYPES.INFO]: 'Info'
        };
        return titles[type] || 'Notification';
    }

    // Public API methods for other modules to interact with dashboard
    getDashboardData() {
        return {
            stats: this.statsData,
            recentActivity: this.recentActivity,
            activeJobs: this.activeJobs,
            recentRoutes: this.recentRoutes
        };
    }

    // Method to be called when page becomes visible
    onPageVisible() {
        this.refreshDashboard();
    }

    // Method to be called when page becomes hidden
    onPageHidden() {
        // Could pause auto-refresh when not visible to save resources
    }

    // Cleanup method
    destroy() {
        this.stopAutoRefresh();
        
        // Remove event listeners
        const quickActionButtons = document.querySelectorAll('.quick-actions .btn');
        quickActionButtons.forEach(btn => {
            btn.removeEventListener('click', this.handleQuickAction);
        });

        console.log('📊 Dashboard page destroyed');
    }
}

// Export as default for dynamic import
export default {
    init: () => {
        const dashboardPage = new DashboardPage();
        dashboardPage.init();
        
        // Make it globally accessible for debugging and external access
        window.dashboardPage = dashboardPage;
        
        return dashboardPage;
    }
};