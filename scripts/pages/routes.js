// Routes/Route Optimizer Page Module
import { EVENT_TYPES, TOAST_TYPES, SPILLOVER_RULES } from '../utils/constants.js';
import { storageHelpers, validationHelpers, performanceHelpers } from '../utils/helpers.js';

class RoutesPage {
    constructor() {
        this.currentStops = [];
        this.optimizedRoute = null;
        this.activeDay = 1;
        this.routeRules = {
            maxRadius: 50,
            maxStopsPerDay: 10,
            spilloverRule: SPILLOVER_RULES.TOMORROW,
            startAddress: 'Home'
        };
        this.isOptimizing = false;
    }

    init() {
        this.loadRouteData();
        this.loadRouteRules();
        this.setupEventListeners();
        this.updateUI();
        this.setupAddressAutocomplete();
        
        console.log('🗺️ Routes page initialized');
    }

    setupEventListeners() {
        // Add stop form
        const addStopBtn = document.getElementById('add-stop-btn');
        if (addStopBtn) {
            addStopBtn.addEventListener('click', () => {
                this.handleAddStop();
            });
        }

        // Add stop on Enter key
        const addressInput = document.getElementById('new-stop-address');
        if (addressInput) {
            addressInput.addEventListener('keypress', (event) => {
                if (event.key === 'Enter') {
                    event.preventDefault();
                    this.handleAddStop();
                }
            });
        }

        // Optimize routes button
        const optimizeBtn = document.getElementById('optimize-routes-btn');
        if (optimizeBtn) {
            optimizeBtn.addEventListener('click', () => {
                this.optimizeRoutes();
            });
        }

        // Clear stops button
        const clearBtn = document.getElementById('clear-stops-btn');
        if (clearBtn) {
            clearBtn.addEventListener('click', () => {
                this.clearAllStops();
            });
        }

        // Import CSV button
        const importBtn = document.getElementById('import-csv-btn');
        const csvInput = document.getElementById('route-csv-input');
        if (importBtn && csvInput) {
            importBtn.addEventListener('click', () => {
                csvInput.click();
            });
            
            csvInput.addEventListener('change', (event) => {
                this.handleCSVImport(event);
            });
        }

        // Route tabs
        const routeTabs = document.querySelectorAll('.route-tab');
        routeTabs.forEach((tab, index) => {
            tab.addEventListener('click', () => {
                this.switchDay(index + 1);
            });
        });

        // Edit rules button
        const editRulesBtn = document.getElementById('edit-rules-btn');
        if (editRulesBtn) {
            editRulesBtn.addEventListener('click', () => {
                this.openRulesModal();
            });
        }

        // Rules modal
        this.setupRulesModal();

        // Calendar sync button
        const calendarBtn = document.getElementById('sync-calendar-btn');
        if (calendarBtn) {
            calendarBtn.addEventListener('click', () => {
                this.syncWithCalendar();
            });
        }

        // Export PDF button
        const exportBtn = document.getElementById('export-pdf-btn');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportRoutePDF();
            });
        }

        // Drag and drop for stops reordering
        this.setupDragAndDrop();
    }

    setupRulesModal() {
        const rulesModal = document.getElementById('rules-modal');
        const closeBtn = document.getElementById('close-rules-modal');
        const cancelBtn = document.getElementById('cancel-rules-btn');
        const saveBtn = document.getElementById('save-rules-btn');

        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeRulesModal();
            });
        }

        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.closeRulesModal();
            });
        }

        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveRouteRules();
            });
        }

        // Close modal on backdrop click
        if (rulesModal) {
            rulesModal.addEventListener('click', (event) => {
                if (event.target === rulesModal) {
                    this.closeRulesModal();
                }
            });
        }
    }

    setupAddressAutocomplete() {
        // Implement address autocomplete functionality
        const addressInputs = document.querySelectorAll('input[type="text"][placeholder*="address"]');
        
        addressInputs.forEach(input => {
            input.addEventListener('input', performanceHelpers.debounce((event) => {
                this.handleAddressInput(event.target);
            }, 300));
        });
    }

    setupDragAndDrop() {
        const stopsContainer = document.getElementById('route-stops-container');
        if (!stopsContainer) return;

        // Enable drag and drop for route stops
        stopsContainer.addEventListener('dragstart', (event) => {
            if (event.target.closest('.route-stop')) {
                event.dataTransfer.setData('text/plain', event.target.closest('.route-stop').dataset.stopId);
                event.target.closest('.route-stop').style.opacity = '0.5';
            }
        });

        stopsContainer.addEventListener('dragend', (event) => {
            if (event.target.closest('.route-stop')) {
                event.target.closest('.route-stop').style.opacity = '1';
            }
        });

        stopsContainer.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        stopsContainer.addEventListener('drop', (event) => {
            event.preventDefault();
            const draggedId = event.dataTransfer.getData('text/plain');
            const dropTarget = event.target.closest('.route-stop');
            
            if (dropTarget && draggedId) {
                this.reorderStops(draggedId, dropTarget.dataset.stopId);
            }
        });
    }

    loadRouteData() {
        this.currentStops = storageHelpers.getItem('current-route-stops', []);
        this.optimizedRoute = storageHelpers.getItem('optimized-route', null);
    }

    loadRouteRules() {
        const savedRules = storageHelpers.getItem('route-rules', {});
        this.routeRules = { ...this.routeRules, ...savedRules };
    }

    saveRouteData() {
        storageHelpers.setItem('current-route-stops', this.currentStops);
        if (this.optimizedRoute) {
            storageHelpers.setItem('optimized-route', this.optimizedRoute);
        }
    }

    saveRouteRules() {
        const form = document.getElementById('rules-form');
        if (!form) return;

        const formData = new FormData(form);
        const rules = {
            maxRadius: parseInt(formData.get('max-radius')) || 50,
            maxStopsPerDay: parseInt(formData.get('max-stops')) || 10,
            spilloverRule: formData.get('spillover-rule') || SPILLOVER_RULES.TOMORROW
        };

        // Validate rules
        if (rules.maxRadius < 10 || rules.maxRadius > 200) {
            this.showToast('Max radius must be between 10 and 200 miles', TOAST_TYPES.ERROR);
            return;
        }

        if (rules.maxStopsPerDay < 1 || rules.maxStopsPerDay > 30) {
            this.showToast('Max stops per day must be between 1 and 30', TOAST_TYPES.ERROR);
            return;
        }

        this.routeRules = { ...this.routeRules, ...rules };
        storageHelpers.setItem('route-rules', this.routeRules);
        
        this.updateRuleBadges();
        this.closeRulesModal();
        this.showToast('Route rules updated', TOAST_TYPES.SUCCESS);
    }

    handleAddStop() {
        const addressInput = document.getElementById('new-stop-address');
        const claimInput = document.getElementById('new-stop-claim');
        const firmSelect = document.getElementById('new-stop-firm');

        if (!addressInput) return;

        const address = addressInput.value.trim();
        const claimNumber = claimInput?.value.trim() || '';
        const firm = firmSelect?.value || '';

        if (!address) {
            this.showToast('Please enter an address', TOAST_TYPES.ERROR);
            addressInput.focus();
            return;
        }

        // Validate address format (basic validation)
        if (address.length < 5) {
            this.showToast('Please enter a complete address', TOAST_TYPES.ERROR);
            return;
        }

        const newStop = {
            id: Date.now().toString(),
            address: address,
            claimNumber: claimNumber,
            firm: firm,
            day: null,
            order: null,
            coordinates: null // Will be geocoded later
        };

        this.currentStops.push(newStop);
        this.saveRouteData();
        this.updateStopsDisplay();
        this.updateOverview();

        // Clear form
        addressInput.value = '';
        if (claimInput) claimInput.value = '';
        if (firmSelect) firmSelect.value = '';

        this.showToast(`Stop added: ${address}`, TOAST_TYPES.SUCCESS);
    }

    async optimizeRoutes() {
        if (this.currentStops.length === 0) {
            this.showToast('Please add some stops first', TOAST_TYPES.WARNING);
            return;
        }

        if (this.isOptimizing) return;

        this.isOptimizing = true;
        this.updateOptimizeButton(true);

        try {
            this.showToast('Optimizing routes...', TOAST_TYPES.INFO);

            // Simulate optimization process
            await this.performOptimization();

            this.updateRouteTabs();
            this.updateStopsDisplay();
            this.updateOverview();
            this.saveRouteData();

            this.showToast('Routes optimized successfully!', TOAST_TYPES.SUCCESS);

        } catch (error) {
            console.error('Route optimization failed:', error);
            this.showToast('Route optimization failed. Please try again.', TOAST_TYPES.ERROR);
        } finally {
            this.isOptimizing = false;
            this.updateOptimizeButton(false);
        }
    }

    async performOptimization() {
        // Simulate API call delay
        await performanceHelpers.delay(2000);

        // Simple clustering algorithm simulation
        const groupedStops = this.clusterStops(this.currentStops);
        
        this.optimizedRoute = {
            days: groupedStops,
            totalDays: groupedStops.length,
            totalStops: this.currentStops.length,
            totalMiles: this.calculateTotalMiles(groupedStops),
            optimizedAt: new Date().toISOString()
        };

        return this.optimizedRoute;
    }

    clusterStops(stops) {
        // Simulate clustering based on rules
        const { maxStopsPerDay, spilloverRule } = this.routeRules;
        const grouped = [];
        let currentDay = [];
        
        stops.forEach((stop, index) => {
            if (currentDay.length >= maxStopsPerDay) {
                grouped.push(currentDay);
                currentDay = [];
            }
            
            // Simulate distance calculation and assignment
            const dayNumber = grouped.length + 1;
            const optimizedStop = {
                ...stop,
                day: dayNumber,
                order: currentDay.length + 1,
                estimatedMiles: Math.random() * 15 + 5, // Random miles
                estimatedTime: Math.random() * 30 + 15 // Random minutes
            };
            
            currentDay.push(optimizedStop);
        });

        if (currentDay.length > 0) {
            grouped.push(currentDay);
        }

        return grouped;
    }

    calculateTotalMiles(groupedStops) {
        return groupedStops.reduce((total, dayStops) => {
            return total + dayStops.reduce((dayTotal, stop) => {
                return dayTotal + (stop.estimatedMiles || 0);
            }, 0);
        }, 0);
    }

    switchDay(dayNumber) {
        this.activeDay = dayNumber;
        
        // Update tab appearance
        const tabs = document.querySelectorAll('.route-tab');
        tabs.forEach((tab, index) => {
            tab.classList.toggle('route-tab--active', index + 1 === dayNumber);
        });

        // Update current day title
        const dayTitle = document.getElementById('current-day-title');
        if (dayTitle) {
            dayTitle.textContent = `Day ${dayNumber}`;
        }

        this.updateStopsDisplay();
    }

    updateUI() {
        this.updateRuleBadges();
        this.updateStopsDisplay();
        this.updateOverview();
        this.updateRouteTabs();
    }

    updateRuleBadges() {
        const radiusBadge = document.getElementById('radius-badge');
        const stopsBadge = document.getElementById('stops-badge');
        const spilloverBadge = document.getElementById('spillover-badge');

        if (radiusBadge) {
            radiusBadge.textContent = `Max ${this.routeRules.maxRadius}mi radius`;
        }
        if (stopsBadge) {
            stopsBadge.textContent = `Max ${this.routeRules.maxStopsPerDay} stops/day`;
        }
        if (spilloverBadge) {
            const spilloverText = this.routeRules.spilloverRule.replace('-', ' ');
            spilloverBadge.textContent = `Spillover: ${spilloverText}`;
        }

        // Update rules display in overview
        const currentRadius = document.getElementById('current-radius');
        const currentMaxStops = document.getElementById('current-max-stops');
        const currentSpillover = document.getElementById('current-spillover');

        if (currentRadius) currentRadius.textContent = `${this.routeRules.maxRadius} miles`;
        if (currentMaxStops) currentMaxStops.textContent = `${this.routeRules.maxStopsPerDay} stops`;
        if (currentSpillover) currentSpillover.textContent = this.routeRules.spilloverRule.replace('-', ' ');
    }

    updateStopsDisplay() {
        const container = document.getElementById('route-stops-container');
        if (!container) return;

        if (this.currentStops.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state__icon">📍</div>
                    <div class="empty-state__title">No stops added yet</div>
                    <div class="empty-state__description">Add some stops above to see your optimized route</div>
                </div>
            `;
            return;
        }

        let stopsToShow = this.currentStops;
        
        // If optimized, show stops for active day
        if (this.optimizedRoute && this.optimizedRoute.days[this.activeDay - 1]) {
            stopsToShow = this.optimizedRoute.days[this.activeDay - 1];
        }

        container.innerHTML = stopsToShow.map((stop, index) => {
            const stopNumber = index + 1;
            const isStart = index === 0 && stop.address === this.routeRules.startAddress;
            
            return `
                <div class="route-stop" data-stop-id="${stop.id}" draggable="true">
                    <div class="stop-marker">
                        <span class="stop-number ${isStart ? 'stop-number--start' : ''}">${isStart ? 'S' : stopNumber}</span>
                    </div>
                    <div class="stop-info">
                        <h4 class="stop-address">${stop.address}</h4>
                        <div class="stop-details">
                            ${stop.claimNumber ? `<span class="stop-claim">Claim: ${stop.claimNumber}</span>` : ''}
                            ${stop.firm ? `<span class="stop-firm">Firm: ${stop.firm}</span>` : ''}
                            ${stop.estimatedMiles ? `<span class="stop-distance">${stop.estimatedMiles.toFixed(1)} mi</span>` : ''}
                        </div>
                    </div>
                    <div class="stop-actions">
                        <button class="btn btn--ghost btn--small" onclick="this.editStop('${stop.id}')">Edit</button>
                        <button class="btn btn--ghost btn--small" onclick="this.removeStop('${stop.id}')">Remove</button>
                    </div>
                </div>
            `;
        }).join('');

        // Update route summary for active day
        this.updateRouteSummary();
    }

    updateRouteSummary() {
        const summaryElement = document.getElementById('route-summary');
        if (!summaryElement) return;

        if (!this.optimizedRoute) {
            summaryElement.style.display = 'none';
            return;
        }

        const activeDayStops = this.optimizedRoute.days[this.activeDay - 1] || [];
        const totalMiles = activeDayStops.reduce((sum, stop) => sum + (stop.estimatedMiles || 0), 0);
        const totalTime = activeDayStops.reduce((sum, stop) => sum + (stop.estimatedTime || 0), 0);
        const avgRate = 0.67; // Default rate
        const totalAmount = totalMiles * avgRate;

        document.getElementById('total-miles').textContent = `${totalMiles.toFixed(1)} miles`;
        document.getElementById('total-time').textContent = `${(totalTime / 60).toFixed(1)} hours`;
        document.getElementById('total-amount').textContent = `$${totalAmount.toFixed(2)}`;

        summaryElement.style.display = 'block';
    }

    updateOverview() {
        const totalDays = document.getElementById('total-days');
        const totalStopsCount = document.getElementById('total-stops-count');
        const overviewTotalMiles = document.getElementById('overview-total-miles');

        if (this.optimizedRoute) {
            if (totalDays) totalDays.textContent = this.optimizedRoute.totalDays;
            if (totalStopsCount) totalStopsCount.textContent = this.optimizedRoute.totalStops;
            if (overviewTotalMiles) overviewTotalMiles.textContent = Math.round(this.optimizedRoute.totalMiles);
        } else {
            if (totalDays) totalDays.textContent = '0';
            if (totalStopsCount) totalStopsCount.textContent = this.currentStops.length;
            if (overviewTotalMiles) overviewTotalMiles.textContent = '0';
        }
    }

    updateRouteTabs() {
        const tabsContainer = document.getElementById('route-tabs');
        if (!tabsContainer) return;

        if (!this.optimizedRoute) {
            tabsContainer.innerHTML = `
                <button class="route-tab route-tab--active" data-day="1">
                    Day 1 - <span class="tab-date">Pending</span> 
                    (<span class="tab-stops">0 stops</span>, <span class="tab-miles">0 mi</span>)
                </button>
            `;
            return;
        }

        const tabs = this.optimizedRoute.days.map((dayStops, index) => {
            const dayNumber = index + 1;
            const isActive = dayNumber === this.activeDay;
            const totalMiles = dayStops.reduce((sum, stop) => sum + (stop.estimatedMiles || 0), 0);
            const date = this.getDateForDay(dayNumber);

            return `
                <button class="route-tab ${isActive ? 'route-tab--active' : ''}" data-day="${dayNumber}">
                    Day ${dayNumber} - <span class="tab-date">${date}</span> 
                    (<span class="tab-stops">${dayStops.length} stops</span>, <span class="tab-miles">${Math.round(totalMiles)} mi</span>)
                </button>
            `;
        }).join('');

        tabsContainer.innerHTML = tabs;

        // Re-attach event listeners to new tabs
        tabsContainer.querySelectorAll('.route-tab').forEach((tab, index) => {
            tab.addEventListener('click', () => {
                this.switchDay(index + 1);
            });
        });
    }

    getDateForDay(dayNumber) {
        const today = new Date();
        const targetDate = new Date(today);
        targetDate.setDate(today.getDate() + dayNumber - 1);
        
        return targetDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric' 
        });
    }

    updateOptimizeButton(isOptimizing) {
        const button = document.getElementById('optimize-routes-btn');
        if (!button) return;

        if (isOptimizing) {
            button.disabled = true;
            button.innerHTML = '<div class="spinner"></div> Optimizing...';
            button.classList.add('btn--loading');
        } else {
            button.disabled = false;
            button.innerHTML = 'Optimize Routes';
            button.classList.remove('btn--loading');
        }
    }

    removeStop(stopId) {
        this.currentStops = this.currentStops.filter(stop => stop.id !== stopId);
        this.optimizedRoute = null; // Clear optimization when stops change
        this.saveRouteData();
        this.updateUI();
        this.showToast('Stop removed', TOAST_TYPES.SUCCESS);
    }

    clearAllStops() {
        if (this.currentStops.length === 0) return;

        if (confirm('Are you sure you want to clear all stops? This action cannot be undone.')) {
            this.currentStops = [];
            this.optimizedRoute = null;
            this.saveRouteData();
            this.updateUI();
            this.showToast('All stops cleared', TOAST_TYPES.SUCCESS);
        }
    }

    openRulesModal() {
        const modal = document.getElementById('rules-modal');
        if (!modal) return;

        // Populate form with current rules
        const form = document.getElementById('rules-form');
        if (form) {
            form.querySelector('#max-radius').value = this.routeRules.maxRadius;
            form.querySelector('#max-stops').value = this.routeRules.maxStopsPerDay;
            form.querySelector('#spillover-rule').value = this.routeRules.spilloverRule;
        }

        modal.style.display = 'flex';
        document.body.style.overflow = 'hidden';
    }

    closeRulesModal() {
        const modal = document.getElementById('rules-modal');
        if (modal) {
            modal.style.display = 'none';
            document.body.style.overflow = '';
        }
    }

    async syncWithCalendar() {
        if (!this.optimizedRoute) {
            this.showToast('Please optimize your route first', TOAST_TYPES.WARNING);
            return;
        }

        try {
            this.showToast('Syncing with calendar...', TOAST_TYPES.INFO);
            
            // Simulate calendar sync
            await performanceHelpers.delay(1500);
            
            this.showToast('Route synced with Google Calendar', TOAST_TYPES.SUCCESS);
        } catch (error) {
            this.showToast('Calendar sync failed', TOAST_TYPES.ERROR);
        }
    }

    exportRoutePDF() {
        if (!this.optimizedRoute) {
            this.showToast('Please optimize your route first', TOAST_TYPES.WARNING);
            return;
        }

        // Simulate PDF generation and download
        this.showToast('Generating PDF...', TOAST_TYPES.INFO);
        
        setTimeout(() => {
            this.showToast('Route PDF downloaded', TOAST_TYPES.SUCCESS);
        }, 1000);
    }

    handleCSVImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== 'text/csv') {
            this.showToast('Please select a CSV file', TOAST_TYPES.ERROR);
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                this.parseCSVStops(e.target.result);
            } catch (error) {
                this.showToast('Failed to parse CSV file', TOAST_TYPES.ERROR);
            }
        };
        reader.readAsText(file);
    }

    parseCSVStops(csvContent) {
        const lines = csvContent.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        // Validate required columns
        const requiredColumns = ['address'];
        const hasRequired = requiredColumns.every(col => 
            headers.some(h => h.includes(col))
        );

        if (!hasRequired) {
            this.showToast('CSV must contain an "address" column', TOAST_TYPES.ERROR);
            return;
        }

        const newStops = [];
        for (let i = 1; i < lines.length; i++) {
            const values = lines[i].split(',').map(v => v.trim());
            if (values.length < headers.length || !values[0]) continue;

            const stop = {
                id: Date.now().toString() + i,
                address: values[0],
                claimNumber: values[1] || '',
                firm: values[2] || '',
                day: null,
                order: null
            };

            newStops.push(stop);
        }

        if (newStops.length > 0) {
            this.currentStops = [...this.currentStops, ...newStops];
            this.optimizedRoute = null;
            this.saveRouteData();
            this.updateUI();
            this.showToast(`Imported ${newStops.length} stops from CSV`, TOAST_TYPES.SUCCESS);
        } else {
            this.showToast('No valid stops found in CSV', TOAST_TYPES.WARNING);
        }
    }

    reorderStops(draggedId, targetId) {
        const draggedIndex = this.currentStops.findIndex(stop => stop.id === draggedId);
        const targetIndex = this.currentStops.findIndex(stop => stop.id === targetId);

        if (draggedIndex === -1 || targetIndex === -1) return;

        // Reorder stops
        const [draggedStop] = this.currentStops.splice(draggedIndex, 1);
        this.currentStops.splice(targetIndex, 0, draggedStop);

        this.optimizedRoute = null; // Clear optimization
        this.saveRouteData();
        this.updateStopsDisplay();
    }

    handleAddressInput(input) {
        // Simulate address autocomplete
        const query = input.value.trim();
        if (query.length < 3) return;

        // In a real implementation, this would call a geocoding API
        console.log(`Searching for addresses matching: ${query}`);
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

    // Public API methods
    getRouteData() {
        return {
            stops: this.currentStops,
            optimized: this.optimizedRoute,
            rules: this.routeRules
        };
    }

    addStopProgrammatically(stopData) {
        const stop = {
            id: Date.now().toString(),
            day: null,
            order: null,
            ...stopData
        };
        
        this.currentStops.push(stop);
        this.saveRouteData();
        this.updateUI();
    }

    // Cleanup method
    destroy() {
        // Remove event listeners and clean up
        console.log('