document.addEventListener('DOMContentLoaded', function() {
    // Check authentication first
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        console.log('❌ User not authenticated, redirecting to login');
        window.location.href = '../login.html';
        return;
    }

    const userType = localStorage.getItem('userType');
    const userEmail = localStorage.getItem('userEmail');
    
    console.log(`✅ User authenticated - Type: ${userType}, Email: ${userEmail}`);

    // Create and inject the navigation sidebar
    const sidebar = createSidebar(userType, userEmail);
    document.body.insertBefore(sidebar, document.body.firstChild);

    // Show demo banner if user is in demo mode
    if (userType === 'demo') {
        showDemoBanner();
    }

    // Show admin analytics if user is admin
    if (userType === 'admin') {
        initializeAdminAnalytics();
    }

    // Set up logout functionality
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', handleLogout);
    }
});

function createSidebar(userType, userEmail) {
    const sidebar = document.createElement('aside');
    sidebar.className = 'sidebar';
    sidebar.id = 'sidebar';

    // Get user display info
    const userDisplayInfo = getUserDisplayInfo(userType, userEmail);

    sidebar.innerHTML = `
        <div class="sidebar-header">
            <div class="logo">
                <h2>Claim Cipher</h2>
            </div>
        </div>
        
        <div class="user-profile">
            <div class="user-avatar">
                <span class="user-initials">${userDisplayInfo.initials}</span>
            </div>
            <div class="user-info">
                <div class="user-name">${userDisplayInfo.name}</div>
                <div class="user-type-badge badge badge--${userDisplayInfo.badgeType}">${userDisplayInfo.typeLabel}</div>
            </div>
        </div>
        
        <nav class="sidebar-nav">
            ${generateNavigationMenu(userType)}
        </nav>
        
        <div class="sidebar-footer">
            <button class="btn btn--ghost btn--small" id="logoutBtn">
                <span class="icon">🚪</span>
                Sign Out
            </button>
        </div>
    `;

    return sidebar;
}

function getUserDisplayInfo(userType, userEmail) {
    let name, initials, typeLabel, badgeType;

    switch (userType) {
        case 'admin':
            // Determine which admin (you or your wife)
            name = userEmail.includes('inspects@flav8r.net') ? 'Admin User' : 'Admin User';
            initials = 'AU';
            typeLabel = 'Master Access';
            badgeType = 'error'; // Red for admin
            break;
            
        case 'pro':
            name = 'Pro User';
            initials = 'PU';
            typeLabel = 'Pro Access';
            badgeType = 'success'; // Green for pro
            break;
            
        case 'basic':
            name = 'Basic User';
            initials = 'BU';
            typeLabel = 'Basic Access';
            badgeType = 'warning'; // Yellow for basic
            break;
            
        case 'demo':
            const demoUserData = localStorage.getItem(`demoUser_${userEmail}`);
            if (demoUserData) {
                const userData = JSON.parse(demoUserData);
                name = `${userData.firstName} ${userData.lastName}`;
                initials = userData.firstName.charAt(0) + userData.lastName.charAt(0);
            } else {
                name = 'Demo User';
                initials = 'DU';
            }
            
            const daysRemaining = getDemoRemainingDays();
            typeLabel = `Trial (${daysRemaining} days left)`;
            badgeType = 'info'; // Blue for demo
            break;
            
        default:
            name = 'User';
            initials = 'U';
            typeLabel = 'User';
            badgeType = 'neutral';
    }

    return { name, initials, typeLabel, badgeType };
}

function generateNavigationMenu(userType) {
    const allMenuItems = [
        { href: 'dashboard.html', icon: '📊', label: 'Dashboard', access: ['admin', 'pro', 'basic', 'demo'] },
        { href: 'jobs.html', icon: '💼', label: 'Jobs', access: ['admin', 'pro', 'basic', 'demo'] },
        { href: 'routes.html', icon: '🗺️', label: 'Route Optimizer', access: ['admin', 'pro', 'basic', 'demo'] },
        { href: 'mileage.html', icon: '🚗', label: 'Mileage Calculator', access: ['admin', 'pro', 'basic', 'demo'] },
        { href: 'autoforms.html', icon: '📝', label: 'Auto Forms', access: ['admin', 'pro', 'basic', 'demo'] },
        { href: 'comparables.html', icon: '📈', label: 'Comparables', access: ['admin', 'pro', 'basic', 'demo'] },
        { href: 'firms.html', icon: '🏢', label: 'Firms & Rates', access: ['admin', 'pro', 'basic', 'demo'] },
        { href: 'gear.html', icon: '⚙️', label: 'Equipment', access: ['admin', 'pro', 'demo'], proRequired: true },
        { href: 'settings.html', icon: '⚙️', label: 'Settings', access: ['admin', 'pro', 'basic', 'demo'] },
        { href: 'help.html', icon: '❓', label: 'Help & Support', access: ['admin', 'pro', 'basic', 'demo'] }
    ];

    // Add Mobile Sync as a pro feature
    allMenuItems.splice(4, 0, { 
        href: 'jobs.html', 
        icon: '�', 
        label: 'Mobile Sync', 
        access: ['admin', 'pro', 'demo'], 
        proRequired: true,
        id: 'mobile-sync'
    });

    // Filter menu items based on user access
    let menuHTML = '';
    
    allMenuItems.forEach(item => {
        const isActive = window.location.pathname.includes(item.href);
        const activeClass = isActive ? ' nav-link--active' : '';
        
        // Check if user has access to this item
        const hasAccess = item.access.includes(userType);
        
        if (hasAccess) {
            // User has access - show normally (no Pro badge for admin/pro/demo users)
            menuHTML += `
                <a href="${item.href}" class="nav-link${activeClass}">
                    <span class="nav-icon">${item.icon}</span>
                    <span class="nav-label">${item.label}</span>
                </a>
            `;
        } else if (item.proRequired && userType === 'basic') {
            // Basic user trying to access Pro feature - show with Pro badge and restriction
            menuHTML += `
                <div class="nav-link nav-link--restricted" onclick="showUpgradePrompt('${item.label}')">
                    <span class="nav-icon">${item.icon}</span>
                    <span class="nav-label">${item.label}</span>
                    <span class="badge badge--small badge--warning">Pro</span>
                </div>
            `;
        }
        // If user doesn't have access and it's not a pro feature, don't show it at all
    });

    // Add admin-only items
    if (userType === 'admin') {
        menuHTML += `
            <a href="users.html" class="nav-link">
                <span class="nav-icon">�</span>
                <span class="nav-label">User Management</span>
            </a>
            <a href="analytics.html" class="nav-link">
                <span class="nav-icon">📈</span>
                <span class="nav-label">System Analytics</span>
            </a>
        `;
    }

    return menuHTML;
}

function showDemoBanner() {
    const existingBanner = document.querySelector('.demo-banner');
    if (existingBanner) return; // Don't create duplicate banners

    const daysRemaining = getDemoRemainingDays();
    const hoursRemaining = getDemoRemainingHours();
    
    if (daysRemaining <= 0 && hoursRemaining <= 0) {
        // Trial expired
        showTrialExpiredBanner();
        return;
    }

    const banner = document.createElement('div');
    banner.className = 'demo-banner';
    banner.innerHTML = `
        <div class="demo-banner-content">
            <span class="demo-icon">🚀</span>
            <div class="demo-text">
                <strong>Free Trial Active</strong>
                <span class="demo-timer">
                    ${daysRemaining > 0 ? `${daysRemaining} days` : `${hoursRemaining} hours`} remaining
                </span>
            </div>
            <a href="upgrade.html" class="btn btn--small btn--primary">Upgrade Now</a>
        </div>
    `;

    // Insert banner at the top of the page
    document.body.insertBefore(banner, document.body.firstChild);

    // Update timer every hour
    setInterval(() => {
        updateDemoBannerTimer();
    }, 3600000); // 1 hour
}

function showTrialExpiredBanner() {
    const banner = document.createElement('div');
    banner.className = 'demo-banner demo-banner--expired';
    banner.innerHTML = `
        <div class="demo-banner-content">
            <span class="demo-icon">⏰</span>
            <div class="demo-text">
                <strong>Trial Expired</strong>
                <span>Upgrade to continue using Claim Cipher</span>
            </div>
            <a href="upgrade.html" class="btn btn--small btn--primary">Upgrade Now</a>
        </div>
    `;

    document.body.insertBefore(banner, document.body.firstChild);
}

function updateDemoBannerTimer() {
    const banner = document.querySelector('.demo-banner');
    if (!banner) return;

    const daysRemaining = getDemoRemainingDays();
    const hoursRemaining = getDemoRemainingHours();
    
    if (daysRemaining <= 0 && hoursRemaining <= 0) {
        // Trial expired, reload page to show expired banner
        window.location.reload();
        return;
    }

    const timerElement = banner.querySelector('.demo-timer');
    if (timerElement) {
        timerElement.textContent = daysRemaining > 0 ? `${daysRemaining} days remaining` : `${hoursRemaining} hours remaining`;
    }
}

function getDemoRemainingDays() {
    const demoExpiry = parseInt(localStorage.getItem('demoExpiry') || '0');
    const now = Date.now();
    const remaining = demoExpiry - now;
    return Math.ceil(remaining / (1000 * 60 * 60 * 24));
}

function getDemoRemainingHours() {
    const demoExpiry = parseInt(localStorage.getItem('demoExpiry') || '0');
    const now = Date.now();
    const remaining = demoExpiry - now;
    return Math.ceil(remaining / (1000 * 60 * 60));
}

function initializeAdminAnalytics() {
    // Add admin-specific functionality
    console.log('🔧 Admin analytics initialized');
    
    // This could load additional admin widgets, stats, etc.
    // For now, just log that admin features are available
}

function showUpgradePrompt(featureName = 'this feature') {
    // Create upgrade modal
    const modal = document.createElement('div');
    modal.className = 'upgrade-modal-overlay';
    modal.innerHTML = `
        <div class="upgrade-modal">
            <div class="upgrade-modal-header">
                <h3>🚀 Upgrade to Pro</h3>
                <button class="modal-close" onclick="closeUpgradeModal()">&times;</button>
            </div>
            <div class="upgrade-modal-content">
                <div class="upgrade-icon">⭐</div>
                <h4>Unlock ${featureName}</h4>
                <p>This feature requires a Pro subscription. Upgrade now to access:</p>
                <ul class="feature-list">
                    <li>✅ Equipment Management</li>
                    <li>✅ Mobile Sync</li>
                    <li>✅ Advanced Analytics</li>
                    <li>✅ Priority Support</li>
                    <li>✅ Unlimited Projects</li>
                </ul>
                <div class="pricing-info">
                    <div class="price">$24.99/month</div>
                    <div class="price-note">or $199/year (save 33%)</div>
                </div>
            </div>
            <div class="upgrade-modal-actions">
                <button class="btn btn--primary btn--full-width" onclick="goToBilling()">
                    Upgrade to Pro
                </button>
                <button class="btn btn--ghost btn--full-width" onclick="closeUpgradeModal()">
                    Maybe Later
                </button>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // Animate in
    setTimeout(() => {
        modal.classList.add('upgrade-modal-overlay--show');
    }, 10);
}

function closeUpgradeModal() {
    const modal = document.querySelector('.upgrade-modal-overlay');
    if (modal) {
        modal.classList.remove('upgrade-modal-overlay--show');
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    }
}

function goToBilling() {
    // Close modal first
    closeUpgradeModal();
    
    // Redirect to billing/upgrade page
    setTimeout(() => {
        window.location.href = 'billing.html';
    }, 300);
}

function handleLogout() {
    // Clear all authentication data
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userType');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('demoStartTime');
    localStorage.removeItem('demoExpiry');
    localStorage.removeItem('rememberMe');
    
    console.log('🚪 User logged out');
    window.location.href = '../login.html';
}

// Export functions for use in other scripts
window.Navigation = {
    getUserType: () => localStorage.getItem('userType'),
    getUserEmail: () => localStorage.getItem('userEmail'),
    isDemoUser: () => localStorage.getItem('userType') === 'demo',
    isAdminUser: () => localStorage.getItem('userType') === 'admin',
    getDemoRemainingDays,
    getDemoRemainingHours,
    
    // Test functions to simulate different user types
    simulateUserType: (userType) => {
        localStorage.setItem('userType', userType);
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', `test@${userType}.com`);
        window.location.reload();
    },
    
    testBasicUser: () => window.Navigation.simulateUserType('basic'),
    testProUser: () => window.Navigation.simulateUserType('pro'),
    testAdminUser: () => window.Navigation.simulateUserType('admin'),
    testDemoUser: () => {
        localStorage.setItem('userType', 'demo');
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userEmail', 'test@demo.com');
        localStorage.setItem('demoExpiry', (Date.now() + 7 * 24 * 60 * 60 * 1000).toString());
        window.location.reload();
    }
};