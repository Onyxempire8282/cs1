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
            coordinates: null, // Will be geocoded later
            distanceFromHome: this.calculateDistanceFromHome(address)
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
            
            // Display route on map if available
            if (window.displayRouteOnMap && this.optimizedRoute) {
                setTimeout(() => {
                    window.displayRouteOnMap(this.optimizedRoute);
                }, 500);
            }

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
            const isOptimized = this.optimizedRoute && this.optimizedRoute.days[this.activeDay - 1];
            const distanceInfo = stop.distanceFromHome ? `${stop.distanceFromHome.toFixed(1)} mi from home` : '';
            
            return `
                <div class="route-stop" data-stop-id="${stop.id}" draggable="true">
                    <div class="stop-marker">
                        <span class="stop-number ${isStart ? 'stop-number--start' : ''}">${isStart ? 'S' : stopNumber}</span>
                    </div>
                    <div class="stop-info">
                        <h4 class="stop-address">${stop.address}</h4>
                        <div class="stop-details">
                            ${stop.claimNumber ? `<span class="stop-claim">🗂️ Claim: ${stop.claimNumber}</span>` : ''}
                            ${stop.firm ? `<span class="stop-firm">🏢 ${stop.firm}</span>` : ''}
                            ${distanceInfo ? `<span class="stop-distance">📍 ${distanceInfo}</span>` : ''}
                            ${isOptimized ? '<span class="stop-status">✅ Optimized</span>' : '<span class="stop-status">⏳ Pending</span>'}
                        </div>
                    </div>
                    <div class="stop-actions">
                        <button class="btn btn--ghost btn--small edit-stop-btn" data-stop-id="${stop.id}">
                            ✏️ Edit
                        </button>
                        <button class="btn btn--ghost btn--small remove-stop-btn" data-stop-id="${stop.id}">
                            🗑️ Remove
                        </button>
                    </div>
                </div>
            `;
        }).join('');

        // Add event listeners for the newly created buttons
        this.attachStopEventListeners();

        // Update route summary for active day
        this.updateRouteSummary();
    }

    attachStopEventListeners() {
        // Remove stop buttons
        const removeButtons = document.querySelectorAll('.remove-stop-btn');
        removeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const stopId = button.getAttribute('data-stop-id');
                if (this.optimizedRoute) {
                    this.removeOptimizedStop(stopId);
                } else {
                    this.removeStop(stopId);
                }
            });
        });

        // Edit stop buttons
        const editButtons = document.querySelectorAll('.edit-stop-btn');
        editButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const stopId = button.getAttribute('data-stop-id');
                this.editStop(stopId);
            });
        });
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

    removeOptimizedStop(stopId) {
        if (!this.optimizedRoute) {
            // If not optimized, just remove from current stops
            this.removeStop(stopId);
            return;
        }

        // Find and remove from optimized route
        let removed = false;
        for (let dayIndex = 0; dayIndex < this.optimizedRoute.days.length; dayIndex++) {
            const stopIndex = this.optimizedRoute.days[dayIndex].findIndex(stop => stop.id === stopId);
            if (stopIndex !== -1) {
                const removedStop = this.optimizedRoute.days[dayIndex].splice(stopIndex, 1)[0];
                removed = true;
                
                // Recalculate totals for this day
                this.recalculateRouteDay(dayIndex);
                
                this.showToast(`Stop removed from Day ${dayIndex + 1}: ${removedStop.address}`, TOAST_TYPES.SUCCESS);
                break;
            }
        }

        if (removed) {
            this.saveRouteData();
            this.updateUI();
        }
    }

    // Recalculate route totals for a specific day
    recalculateRouteDay(dayIndex) {
        if (!this.optimizedRoute || !this.optimizedRoute.days[dayIndex]) return;

        const dayStops = this.optimizedRoute.days[dayIndex];
        if (dayStops.length === 0) {
            this.optimizedRoute.totalMiles = this.calculateTotalMiles(this.optimizedRoute.days);
            return;
        }

        // Recalculate total miles for the entire route
        this.optimizedRoute.totalMiles = this.calculateTotalMiles(this.optimizedRoute.days);
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
            distanceFromHome: this.calculateDistanceFromHome(stopData.address || ''),
            ...stopData
        };
        
        this.currentStops.push(stop);
        this.saveRouteData();
        this.updateUI();
    }

    // Enhanced calculation methods for transparent route optimization
    
    // Calculate realistic distance from home address
    calculateDistanceFromHome(address) {
        if (!address) return 0;
        
        // In a real application, this would use Google Maps Distance Matrix API
        // For demonstration, we'll simulate realistic distances based on address patterns
        
        const homeAddress = this.routeRules.startAddress.toLowerCase();
        const targetAddress = address.toLowerCase();
        
        // Simulate different distances based on common address patterns
        let baseDistance = 15; // Default ~15 miles
        
        // Same city/area indicators
        if (this.addressesInSameCity(homeAddress, targetAddress)) {
            baseDistance = Math.random() * 10 + 5; // 5-15 miles for same city
        }
        // Different cities
        else if (this.addressesInDifferentStates(homeAddress, targetAddress)) {
            baseDistance = Math.random() * 50 + 25; // 25-75 miles for different states
        }
        // Different counties/areas
        else {
            baseDistance = Math.random() * 30 + 10; // 10-40 miles for different areas
        }
        
        return Math.round(baseDistance * 10) / 10; // Round to 1 decimal
    }

    // Calculate distance between two stops for route optimization
    calculateDistanceBetweenStops(stop1, stop2) {
        if (!stop1 || !stop2) return 0;
        
        // In a real app, this would use actual geocoding and distance calculation
        // For simulation, calculate based on relative distance from home
        
        const distance1 = stop1.distanceFromHome || 0;
        const distance2 = stop2.distanceFromHome || 0;
        
        // Simulate distance based on triangulation
        // If both stops are similar distance from home, they're likely closer to each other
        const distanceDiff = Math.abs(distance1 - distance2);
        let betweenDistance;
        
        if (distanceDiff < 5) {
            // Similar distances from home = likely close to each other
            betweenDistance = Math.random() * 8 + 2; // 2-10 miles
        } else if (distanceDiff < 15) {
            // Moderate difference = moderate distance
            betweenDistance = Math.random() * 15 + 5; // 5-20 miles
        } else {
            // Large difference = potentially far apart
            betweenDistance = Math.random() * 25 + 10; // 10-35 miles
        }
        
        return Math.round(betweenDistance * 10) / 10;
    }

    // Helper method to determine if addresses are in the same city
    addressesInSameCity(addr1, addr2) {
        const cityKeywords = ['st', 'ave', 'rd', 'blvd', 'ln', 'dr', 'ct'];
        return cityKeywords.some(keyword => 
            addr1.includes(keyword) && addr2.includes(keyword)
        );
    }

    // Helper method to determine if addresses are in different states
    addressesInDifferentStates(addr1, addr2) {
        const stateAbbr = ['al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md', 'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj', 'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc', 'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy'];
        
        const addr1States = stateAbbr.filter(state => addr1.includes(state));
        const addr2States = stateAbbr.filter(state => addr2.includes(state));
        
        return addr1States.length > 0 && addr2States.length > 0 && 
               !addr1States.some(state => addr2States.includes(state));
    }

    // Calculate total route distance including return to home
    calculateTotalRouteDistance(stops) {
        if (!stops || stops.length === 0) return 0;
        
        let totalDistance = 0;
        
        // Distance from home to first stop
        if (stops[0] && stops[0].distanceFromHome) {
            totalDistance += stops[0].distanceFromHome;
        }
        
        // Distance between consecutive stops
        for (let i = 0; i < stops.length - 1; i++) {
            totalDistance += this.calculateDistanceBetweenStops(stops[i], stops[i + 1]);
        }
        
        // Distance from last stop back to home (return journey)
        if (stops[stops.length - 1] && stops[stops.length - 1].distanceFromHome) {
            totalDistance += stops[stops.length - 1].distanceFromHome;
        }
        
        return Math.round(totalDistance * 10) / 10;
    }

    // Estimate travel time based on distance and traffic conditions
    estimateTravelTime(distanceMiles, timeOfDay = 'midday') {
        if (!distanceMiles) return 0;
        
        // Base speed assumptions
        let avgSpeed = 35; // mph for city driving
        
        // Adjust for time of day
        switch (timeOfDay) {
            case 'morning':
                avgSpeed = 25; // Rush hour traffic
                break;
            case 'evening':
                avgSpeed = 30; // Evening traffic
                break;
            case 'midday':
                avgSpeed = 35; // Normal traffic
                break;
            case 'night':
                avgSpeed = 45; // Light traffic
                break;
        }
        
        const baseTime = distanceMiles / avgSpeed;
        const bufferTime = 0.1; // 6 minutes buffer for parking, stops, etc.
        
        return Math.round((baseTime + bufferTime) * 10) / 10;
    }

    // Cleanup method
    destroy() {
        // Remove event listeners and clean up
        console.log('🗺️ Routes page destroyed');
    }
}

// Initialize routes page when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    const routesPage = new RoutesPage();
    routesPage.init();
    
    // Make it globally accessible for debugging
    window.routesPage = routesPage;
});

export default RoutesPage;