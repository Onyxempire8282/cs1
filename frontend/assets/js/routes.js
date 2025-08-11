// Route Optimizer functionality
let stops = [];
let routeRules = {
    maxRadius: 50,
    maxStopsPerDay: 10,
    spilloverStrategy: 'tomorrow'
};

function initializeRoutes() {
    console.log('🗺️ Initializing Route Optimizer...');
    
    // Bind event listeners
    setupEventListeners();
    
    // Load saved data if any
    loadSavedRoutes();
    
    // Load demo stops for demonstration
    if (isDemo()) {
        loadDemoStops();
    }
}

function setupEventListeners() {
    // Add stop functionality
    const addStopBtn = document.getElementById('add-stop-btn');
    const newStopAddress = document.getElementById('new-stop-address');
    const newStopClaim = document.getElementById('new-stop-claim');
    
    if (addStopBtn) {
        addStopBtn.addEventListener('click', addNewStop);
    }
    
    // Enter key support for adding stops
    if (newStopAddress) {
        newStopAddress.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addNewStop();
        });
    }
    
    if (newStopClaim) {
        newStopClaim.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') addNewStop();
        });
    }
    
    // Optimize routes
    const optimizeBtn = document.getElementById('optimize-routes-btn');
    if (optimizeBtn) {
        optimizeBtn.addEventListener('click', optimizeRoutes);
    }
    
    // Rules modal
    const editRulesBtn = document.getElementById('edit-rules-btn');
    const rulesModal = document.getElementById('rules-modal');
    const closeModalBtn = document.getElementById('close-modal');
    const modalBackdrop = document.getElementById('modal-backdrop');
    const cancelRulesBtn = document.getElementById('cancel-rules');
    const saveRulesBtn = document.getElementById('save-rules');
    
    if (editRulesBtn) {
        editRulesBtn.addEventListener('click', () => showModal('rules-modal'));
    }
    
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => hideModal('rules-modal'));
    if (modalBackdrop) modalBackdrop.addEventListener('click', () => hideModal('rules-modal'));
    if (cancelRulesBtn) cancelRulesBtn.addEventListener('click', () => hideModal('rules-modal'));
    if (saveRulesBtn) saveRulesBtn.addEventListener('click', saveRouteRules);
    
    // Import CSV
    const importCsvBtn = document.getElementById('import-csv-btn');
    if (importCsvBtn) {
        importCsvBtn.addEventListener('click', importCsv);
    }
    
    // Action buttons
    const syncCalendarBtn = document.getElementById('sync-calendar-btn');
    const exportPdfBtn = document.getElementById('export-pdf-btn');
    const saveRouteBtn = document.getElementById('save-route-btn');
    
    if (syncCalendarBtn) syncCalendarBtn.addEventListener('click', syncToCalendar);
    if (exportPdfBtn) exportPdfBtn.addEventListener('click', exportToPdf);
    if (saveRouteBtn) saveRouteBtn.addEventListener('click', saveRoute);
}

function addNewStop() {
    const addressInput = document.getElementById('new-stop-address');
    const claimInput = document.getElementById('new-stop-claim');
    
    if (!addressInput || !claimInput) return;
    
    const address = addressInput.value.trim();
    const claimNumber = claimInput.value.trim();
    
    if (!address) {
        showToast('Please enter an address', 'warning');
        return;
    }
    
    const newStop = {
        id: Date.now(),
        address: address,
        claimNumber: claimNumber || `CLM-${Math.floor(Math.random() * 9999)}`,
        lat: Math.random() * 2 - 1, // Demo coordinates
        lng: Math.random() * 2 - 1,
        estimatedTime: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
        priority: 'normal'
    };
    
    stops.push(newStop);
    
    // Clear inputs
    addressInput.value = '';
    claimInput.value = '';
    
    showToast(`Added stop: ${address}`, 'success');
    
    // Update display
    updateStopsDisplay();
}

function loadDemoStops() {
    const demoStops = [
        { id: 1, address: '123 Main St, Downtown', claimNumber: 'CLM-4891', lat: 0.1, lng: 0.1, estimatedTime: 45, priority: 'high' },
        { id: 2, address: '456 Oak Ave, Midtown', claimNumber: 'CLM-4892', lat: 0.2, lng: 0.15, estimatedTime: 60, priority: 'normal' },
        { id: 3, address: '789 Pine Rd, Northside', claimNumber: 'CLM-4893', lat: 0.3, lng: 0.2, estimatedTime: 30, priority: 'normal' },
        { id: 4, address: '321 Elm St, Southside', claimNumber: 'CLM-4894', lat: -0.1, lng: -0.1, estimatedTime: 50, priority: 'low' },
        { id: 5, address: '654 Maple Dr, Westside', claimNumber: 'CLM-4895', lat: -0.2, lng: 0.1, estimatedTime: 40, priority: 'normal' },
        { id: 6, address: '987 Cedar Ln, Eastside', claimNumber: 'CLM-4896', lat: 0.1, lng: -0.2, estimatedTime: 55, priority: 'high' },
        { id: 7, address: '147 Birch St, Central', claimNumber: 'CLM-4897', lat: 0.05, lng: 0.05, estimatedTime: 35, priority: 'normal' }
    ];
    
    stops = demoStops;
    updateStopsDisplay();
}

function optimizeRoutes() {
    if (stops.length === 0) {
        showToast('Please add some stops first', 'warning');
        return;
    }
    
    console.log('🎯 Optimizing routes...');
    showToast('Optimizing routes...', 'info');
    
    // Simulate optimization process
    setTimeout(() => {
        const optimizedRoutes = clusterStops(stops, routeRules);
        displayOptimizedRoutes(optimizedRoutes);
        showToast('Routes optimized successfully!', 'success');
    }, 1500);
}

function clusterStops(stops, rules) {
    // Simple clustering algorithm based on proximity
    const clusters = [];
    const unassigned = [...stops];
    let dayCounter = 1;
    
    while (unassigned.length > 0) {
        const cluster = {
            day: dayCounter,
            stops: [],
            totalMiles: 0,
            totalTime: 0,
            totalAmount: 0
        };
        
        // Start with the first unassigned stop
        const firstStop = unassigned.shift();
        cluster.stops.push(firstStop);
        cluster.totalTime += firstStop.estimatedTime;
        
        // Find nearby stops within radius and max stops limit
        while (cluster.stops.length < rules.maxStopsPerDay && unassigned.length > 0) {
            let closestStop = null;
            let closestDistance = Infinity;
            let closestIndex = -1;
            
            // Find the closest unassigned stop to any stop in the current cluster
            unassigned.forEach((stop, index) => {
                cluster.stops.forEach(clusterStop => {
                    const distance = calculateDistance(stop, clusterStop);
                    if (distance < closestDistance && distance <= rules.maxRadius) {
                        closestDistance = distance;
                        closestStop = stop;
                        closestIndex = index;
                    }
                });
            });
            
            if (closestStop) {
                unassigned.splice(closestIndex, 1);
                cluster.stops.push(closestStop);
                cluster.totalTime += closestStop.estimatedTime;
                cluster.totalMiles += closestDistance;
            } else {
                // No more stops within radius
                break;
            }
        }
        
        // Calculate totals
        cluster.totalMiles += cluster.stops.length * 5; // Base mileage between stops
        cluster.totalTime += cluster.stops.length * 15; // Travel time between stops
        cluster.totalAmount = cluster.totalMiles * 0.67; // IRS mileage rate
        
        clusters.push(cluster);
        dayCounter++;
    }
    
    return clusters;
}

function calculateDistance(stop1, stop2) {
    // Simple Euclidean distance for demo (in real app, use proper geo distance)
    const dx = stop1.lat - stop2.lat;
    const dy = stop1.lng - stop2.lng;
    return Math.sqrt(dx * dx + dy * dy) * 69; // Approximate miles per degree
}

function displayOptimizedRoutes(routes) {
    const resultsContainer = document.getElementById('route-results');
    const tabsContainer = document.getElementById('route-tabs');
    
    if (!resultsContainer || !tabsContainer) return;
    
    // Show results
    resultsContainer.style.display = 'block';
    
    // Create tabs
    const tabsHtml = routes.map((route, index) => `
        <button class="btn ${index === 0 ? 'btn--primary' : 'btn--outline'} btn--sm route-tab" 
                data-day="${route.day}" onclick="showRouteDay(${route.day})">
            Day ${route.day}
        </button>
    `).join('');
    
    tabsContainer.innerHTML = tabsHtml;
    
    // Store routes globally
    window.optimizedRoutes = routes;
    
    // Show first route
    showRouteDay(1);
}

function showRouteDay(day) {
    const routes = window.optimizedRoutes;
    if (!routes) return;
    
    const route = routes.find(r => r.day === day);
    if (!route) return;
    
    // Update active tab
    document.querySelectorAll('.route-tab').forEach(tab => {
        tab.className = tab.dataset.day == day ? 
            'btn btn--primary btn--sm route-tab' : 
            'btn btn--outline btn--sm route-tab';
    });
    
    // Update content
    const titleEl = document.getElementById('current-day-title');
    const summaryEl = document.getElementById('route-summary');
    const stopsContainer = document.getElementById('route-stops-container');
    
    if (titleEl) titleEl.textContent = `Day ${day}`;
    if (summaryEl) {
        summaryEl.innerHTML = `
            <span id="total-miles">${Math.round(route.totalMiles)} miles</span> • 
            <span id="total-time">${Math.round(route.totalTime / 60)} hours</span> • 
            <span id="total-amount">${formatCurrency(route.totalAmount)}</span>
        `;
    }
    
    if (stopsContainer) {
        const stopsHtml = route.stops.map((stop, index) => `
            <div class="route-stop">
                <div class="stop-number">${index + 1}</div>
                <div class="stop-details">
                    <h4 class="stop-address">${stop.address}</h4>
                    <p class="stop-claim">Claim: ${stop.claimNumber}</p>
                    <p class="stop-time">Est. ${stop.estimatedTime} minutes</p>
                </div>
                <div class="stop-actions">
                    <span class="badge badge--${getPriorityColor(stop.priority)}">${stop.priority}</span>
                </div>
            </div>
        `).join('');
        
        stopsContainer.innerHTML = stopsHtml;
    }
}

function getPriorityColor(priority) {
    switch (priority) {
        case 'high': return 'error';
        case 'low': return 'info';
        default: return 'warning';
    }
}

function showModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
        
        // Load current rules
        if (modalId === 'rules-modal') {
            document.getElementById('max-radius').value = routeRules.maxRadius;
            document.getElementById('max-stops').value = routeRules.maxStopsPerDay;
            document.getElementById('spillover-strategy').value = routeRules.spilloverStrategy;
        }
    }
}

function hideModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
        modal.style.display = 'none';
        document.body.style.overflow = '';
    }
}

function saveRouteRules() {
    const maxRadius = parseInt(document.getElementById('max-radius').value);
    const maxStops = parseInt(document.getElementById('max-stops').value);
    const spilloverStrategy = document.getElementById('spillover-strategy').value;
    
    routeRules = {
        maxRadius,
        maxStopsPerDay: maxStops,
        spilloverStrategy
    };
    
    // Update badges
    updateRuleBadges();
    
    // Save to storage
    setStorage('routeRules', routeRules);
    
    hideModal('rules-modal');
    showToast('Route rules updated', 'success');
}

function updateRuleBadges() {
    const radiusBadge = document.getElementById('radius-badge');
    const stopsBadge = document.getElementById('stops-badge');
    const spilloverBadge = document.getElementById('spillover-badge');
    
    if (radiusBadge) radiusBadge.textContent = `Max ${routeRules.maxRadius}mi radius`;
    if (stopsBadge) stopsBadge.textContent = `Max ${routeRules.maxStopsPerDay} stops/day`;
    if (spilloverBadge) {
        const strategyText = {
            'tomorrow': 'Tomorrow',
            'next-available': 'Next Available Day',
            'manual': 'Manual Assignment'
        };
        spilloverBadge.textContent = `Spillover: ${strategyText[routeRules.spilloverStrategy]}`;
    }
}

function updateStopsDisplay() {
    // This would update a stops list if we had one in the UI
    console.log(`📍 ${stops.length} stops loaded`);
}

function loadSavedRoutes() {
    const savedRules = getStorage('routeRules');
    if (savedRules) {
        routeRules = savedRules;
        updateRuleBadges();
    }
    
    const savedStops = getStorage('routeStops');
    if (savedStops) {
        stops = savedStops;
        updateStopsDisplay();
    }
}

function importCsv() {
    // In a real app, this would open a file picker
    showToast('CSV import functionality coming soon!', 'info');
}

function syncToCalendar() {
    showToast('Calendar sync functionality coming soon!', 'info');
}

function exportToPdf() {
    showToast('PDF export functionality coming soon!', 'info');
}

function saveRoute() {
    if (!window.optimizedRoutes) {
        showToast('No optimized routes to save', 'warning');
        return;
    }
    
    setStorage('savedRoutes', window.optimizedRoutes);
    showToast('Routes saved successfully!', 'success');
}

// Make functions globally available
window.initializeRoutes = initializeRoutes;
window.showRouteDay = showRouteDay;
