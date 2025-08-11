// Dashboard initialization and data management
function initializeDashboard() {
    const userType = getUserType();
    
    if (userType === 'demo') {
        loadDemoData();
    } else {
        loadUserData();
    }
}

function loadDemoData() {
    console.log('📊 Loading demo dashboard data...');
    
    // Load sample stats
    const stats = generateSampleStats();
    updateStatsDisplay(stats);
    
    // Load sample routes
    const routes = generateSampleRoutes();
    updateRoutesDisplay(routes);
    
    // Load sample jobs
    const jobs = generateSampleJobs();
    updateJobsDisplay(jobs);
    
    // Load sample activity
    const activities = generateSampleActivity();
    updateActivityDisplay(activities);
}

function loadUserData() {
    console.log('📊 Loading user dashboard data...');
    
    // In a real app, this would fetch from API
    // For now, load from localStorage or show empty state
    const savedStats = getStorage('userStats') || {
        miles: 0,
        routes: 0,
        jobs: 0,
        earnings: 0
    };
    
    updateStatsDisplay(savedStats);
    
    const savedRoutes = getStorage('userRoutes') || [];
    updateRoutesDisplay(savedRoutes);
    
    const savedJobs = getStorage('userJobs') || [];
    updateJobsDisplay(savedJobs);
    
    const savedActivity = getStorage('userActivity') || [];
    updateActivityDisplay(savedActivity);
}

function updateStatsDisplay(stats) {
    const elements = {
        miles: document.getElementById('miles-stat'),
        routes: document.getElementById('routes-stat'),
        jobs: document.getElementById('jobs-stat'),
        earnings: document.getElementById('earnings-stat')
    };
    
    if (elements.miles) elements.miles.textContent = formatNumber(stats.miles);
    if (elements.routes) elements.routes.textContent = formatNumber(stats.routes);
    if (elements.jobs) elements.jobs.textContent = formatNumber(stats.jobs);
    if (elements.earnings) elements.earnings.textContent = formatCurrency(stats.earnings);
}

function updateRoutesDisplay(routes) {
    const container = document.getElementById('recent-routes');
    if (!container) return;
    
    if (routes.length === 0) {
        container.innerHTML = '<p class="empty-state">No routes yet</p>';
        return;
    }
    
    const routesHtml = routes.map(route => `
        <div class="route-item">
            <div class="route-item__info">
                <h4>${route.name} - ${formatDate(route.date)}</h4>
                <p>${route.stops} stops • ${route.miles} miles • ${route.duration} hours</p>
            </div>
            <span class="badge badge--${route.status === 'completed' ? 'success' : 'warning'}">
                ${route.status === 'completed' ? 'Completed' : 'Planned'}
            </span>
        </div>
    `).join('');
    
    container.innerHTML = routesHtml;
}

function updateJobsDisplay(jobs) {
    const container = document.getElementById('active-jobs');
    if (!container) return;
    
    if (jobs.length === 0) {
        container.innerHTML = '<p class="empty-state">No active jobs</p>';
        return;
    }
    
    const jobsHtml = jobs.map(job => `
        <div class="job-item">
            <div class="job-item__info">
                <h4>${job.vehicle} - #${job.claimNumber}</h4>
                <p>${job.progress}</p>
            </div>
            ${job.status === 'uploading' ? 
                '<div class="spinner"></div>' : 
                job.action ? 
                    `<button class="btn btn--${job.status === 'ready' ? 'success' : 'primary'} btn--sm">${job.action}</button>` : 
                    ''
            }
        </div>
    `).join('');
    
    container.innerHTML = jobsHtml;
}

function updateActivityDisplay(activities) {
    const container = document.getElementById('activity-feed');
    if (!container) return;
    
    if (activities.length === 0) {
        container.innerHTML = '<p class="empty-state">No recent activity</p>';
        return;
    }
    
    const activitiesHtml = activities.map(activity => `
        <div class="activity-item">
            <div class="activity-icon activity-icon--${activity.type}">${activity.icon}</div>
            <div class="activity-content">
                <div class="activity-title">${activity.title}</div>
                <div class="activity-time">${formatRelativeTime(activity.time)}</div>
            </div>
        </div>
    `).join('');
    
    container.innerHTML = activitiesHtml;
}

function formatRelativeTime(date) {
    const now = new Date();
    const diff = now - new Date(date);
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (days > 0) {
        return days === 1 ? 'Yesterday' : `${days} days ago`;
    } else if (hours > 0) {
        return hours === 1 ? '1 hour ago' : `${hours} hours ago`;
    } else {
        return 'Just now';
    }
}

// Export for use in HTML
window.initializeDashboard = initializeDashboard;
