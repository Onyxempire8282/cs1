// Mileage calculator functionality
// Mileage Calculator Page
import { APP_CONFIG, EVENT_TYPES, TOAST_TYPES } from '../utils/constants.js';

class MileagePage {
    constructor() {
        this.form = null;
        this.resultContainer = null;
        this.currentCalculation = null;
        this.taxLog = [];
    }

    init() {
        this.setupElements();
        this.setupEventListeners();
        this.loadTaxLog();
        
        console.log('🚗 Mileage page initialized');
    }

    setupElements() {
        this.form = document.getElementById('mileage-form');
        this.resultContainer = document.getElementById('mileage-result');
        
        if (!this.form) {
            console.warn('Mileage form not found');
            return;
        }
    }

    setupEventListeners() {
        // Form submission
        if (this.form) {
            this.form.addEventListener('submit', (event) => {
                event.preventDefault();
                this.calculateMileage();
            });

            // Form reset
            this.form.addEventListener('reset', () => {
                this.hideResult();
            });
        }

        // Copy result button
        const copyBtn = document.getElementById('copy-result');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                this.copyResult();
            });
        }

        // Save to log button
        const saveBtn = document.getElementById('save-log');
        if (saveBtn) {
            saveBtn.addEventListener('click', () => {
                this.saveToLog();
            });
        }

        // Export CSV button
        const exportBtn = document.getElementById('export-csv');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportCSV();
            });
        }

        // Auto-calculate on input change (debounced)
        const inputs = this.form?.querySelectorAll('.form-input');
        if (inputs) {
            inputs.forEach(input => {
                input.addEventListener('input', this.debounce(() => {
                    if (this.isFormValid()) {
                        this.calculateMileage();
                    }
                }, 1000));
            });
        }
    }

    async calculateMileage() {
        const formData = this.getFormData();
        
        if (!this.validateForm(formData)) {
            return;
        }

        try {
            // Show loading state
            this.setCalculatingState(true);

            // Simulate API call to Google Distance Matrix
            const result = await this.callDistanceAPI(formData);
            
            // Update result display
            this.displayResult(result);
            
            // Store current calculation
            this.currentCalculation = {
                ...formData,
                ...result,
                timestamp: new Date().toISOString()
            };

            // Dispatch calculation event
            this.dispatchEvent(EVENT_TYPES.MILEAGE_CALCULATED, {
                calculation: this.currentCalculation
            });

        } catch (error) {
            console.error('Mileage calculation failed:', error);
            this.showError('Failed to calculate mileage. Please try again.');
        } finally {
            this.setCalculatingState(false);
        }
    }

    getFormData() {
        const form = this.form;
        if (!form) return null;

        return {
            firm: form.querySelector('#firm-select')?.value,
            startAddress: form.querySelector('#start-address')?.value,
            endAddress: form.querySelector('#end-address')?.value,
            claimNumber: form.querySelector('#claim-number')?.value,
            tripType: form.querySelector('#trip-type')?.value
        };
    }

    validateForm(data) {
        const errors = [];

        if (!data.firm) {
            errors.push('Please select a firm');
        }

        if (!data.startAddress) {
            errors.push('Please enter a start address');
        }

        if (!data.endAddress) {
            errors.push('Please enter a destination address');
        }

        if (errors.length > 0) {
            this.showValidationErrors(errors);
            return false;
        }

        return true;
    }

    isFormValid() {
        const formData = this.getFormData();
        return formData && formData.firm && formData.startAddress && formData.endAddress;
    }

    async callDistanceAPI(formData) {
        // Simulate Google Distance Matrix API call
        // In production, this would make an actual API request
        
        return new Promise((resolve) => {
            setTimeout(() => {
                // Simulate realistic mileage calculation
                const baseMiles = Math.random() * 40 + 10; // 10-50 miles
                const miles = formData.tripType === 'round-trip' ? baseMiles * 2 : baseMiles;
                const rate = this.getFirmRate(formData.firm);
                const amount = miles * rate;

                resolve({
                    miles: Math.round(miles * 10) / 10,
                    rate: rate,
                    amount: Math.round(amount * 100) / 100,
                    route: `${formData.startAddress} → ${formData.endAddress}`,
                    duration: Math.round((miles / 35) * 60) // Estimate travel time
                });
            }, 800); // Simulate network delay
        });
    }

    getFirmRate(firmKey) {
        const rates = {
            'sedgwick': 0.67,
            'acd': 0.62,
            'independent': 0.70
        };
        return rates[firmKey] || APP_CONFIG.mileageRates.default;
    }

    displayResult(result) {
        if (!this.resultContainer) return;

        const milesEl = document.getElementById('result-miles');
        const amountEl = document.getElementById('result-amount');

        if (milesEl) {
            milesEl.textContent = `${result.miles} miles`;
        }

        if (amountEl) {
            amountEl.textContent = `$${result.amount.toFixed(2)} reimbursement`;
        }

        // Show result container
        this.showResult();

        // Add success animation
        this.resultContainer.classList.add('slide-up');
    }

    showResult() {
        if (this.resultContainer) {
            this.resultContainer.style.display = 'block';
            this.resultContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    }

    hideResult() {
        if (this.resultContainer) {
            this.resultContainer.style.display = 'none';
        }
        this.currentCalculation = null;
    }

    setCalculatingState(calculating) {
        const submitBtn = this.form?.querySelector('button[type="submit"]');
        const resultActions = document.querySelectorAll('#copy-result, #save-log');

        if (submitBtn) {
            submitBtn.disabled = calculating;
            submitBtn.textContent = calculating ? 'Calculating...' : 'Calculate Mileage';
            
            if (calculating) {
                submitBtn.classList.add('btn--loading');
            } else {
                submitBtn.classList.remove('btn--loading');
            }
        }

        resultActions.forEach(btn => {
            btn.disabled = calculating || !this.currentCalculation;
        });
    }

    async copyResult() {
        if (!this.currentCalculation) return;

        const text = this.formatResultForCopy(this.currentCalculation);
        
        try {
            await navigator.clipboard.writeText(text);
            this.showToast('Result copied to clipboard', TOAST_TYPES.SUCCESS);
        } catch (error) {
            // Fallback for older browsers
            this.fallbackCopyToClipboard(text);
        }
    }

    formatResultForCopy(calculation) {
        return [
            `Mileage Calculation`,
            `Date: ${new Date(calculation.timestamp).toLocaleDateString()}`,
            `Route: ${calculation.route}`,
            `Distance: ${calculation.miles} miles`,
            `Rate: $${calculation.rate}/mile`,
            `Total: $${calculation.amount.toFixed(2)}`,
            calculation.claimNumber ? `Claim: ${calculation.claimNumber}` : '',
            `Trip Type: ${calculation.tripType}`
        ].filter(line => line).join('\n');
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Result copied to clipboard', TOAST_TYPES.SUCCESS);
        } catch (error) {
            this.showToast('Failed to copy result', TOAST_TYPES.ERROR);
        }
        
        document.body.removeChild(textArea);
    }

    saveToLog() {
        if (!this.currentCalculation) return;

        // Add to tax log
        const logEntry = {
            id: Date.now(),
            date: new Date().toISOString(),
            ...this.currentCalculation
        };

        this.taxLog.unshift(logEntry);
        this.saveTaxLog();
        this.updateTaxLogDisplay();
        
        this.showToast('Entry saved to tax log', TOAST_TYPES.SUCCESS);
    }

    loadTaxLog() {
        try {
            const stored = localStorage.getItem('claim-cipher-tax-log');
            this.taxLog = stored ? JSON.parse(stored) : this.getDefaultTaxLog();
        } catch (error) {
            console.warn('Failed to load tax log from localStorage');
            this.taxLog = this.getDefaultTaxLog();
        }
        
        this.updateTaxLogDisplay();
    }

    saveTaxLog() {
        try {
            localStorage.setItem('claim-cipher-tax-log', JSON.stringify(this.taxLog));
        } catch (error) {
            console.warn('Failed to save tax log to localStorage');
        }
    }

    getDefaultTaxLog() {
        // Return some sample data for demo purposes
        return [
            {
                id: 1,
                date: '2025-08-09T10:30:00.000Z',
                claimNumber: 'CLM-4891',
                route: 'Home → 123 Insurance Way',
                miles: 23.1,
                rate: 0.67,
                amount: 15.48,
                firm: 'sedgwick'
            },
            {
                id: 2,
                date: '2025-08-09T14:15:00.000Z',
                claimNumber: 'CLM-4902',
                route: '123 Insurance Way → 456 Claim St',
                miles: 18.7,
                rate: 0.67,
                amount: 12.53,
                firm: 'sedgwick'
            }
        ];
    }

    updateTaxLogDisplay() {
        const tableBody = document.querySelector('.data-table tbody');
        if (!tableBody) return;

        if (this.taxLog.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="5" style="text-align: center; color: var(--text-muted);">
                        No entries found. Calculate some mileage to get started!
                    </td>
                </tr>
            `;
            return;
        }

        tableBody.innerHTML = this.taxLog.slice(0, 10).map(entry => `
            <tr>
                <td>${new Date(entry.date).toLocaleDateString()}</td>
                <td>${entry.claimNumber || '-'}</td>
                <td>${entry.route}</td>
                <td>${entry.miles}</td>
                <td class="amount-positive">${entry.amount.toFixed(2)}</td>
            </tr>
        `).join('');
    }

    exportCSV() {
        if (this.taxLog.length === 0) {
            this.showToast('No data to export', TOAST_TYPES.WARNING);
            return;
        }

        const headers = ['Date', 'Claim Number', 'Route', 'Miles', 'Rate', 'Amount', 'Firm'];
        const csvContent = [
            headers.join(','),
            ...this.taxLog.map(entry => [
                new Date(entry.date).toLocaleDateString(),
                entry.claimNumber || '',
                `"${entry.route}"`,
                entry.miles,
                entry.rate,
                entry.amount.toFixed(2),
                entry.firm || ''
            ].join(','))
        ].join('\n');

        this.downloadCSV(csvContent, `mileage-log-${new Date().toISOString().split('T')[0]}.csv`);
        this.showToast('CSV file downloaded', TOAST_TYPES.SUCCESS);
    }

    downloadCSV(content, filename) {
        const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }

    showValidationErrors(errors) {
        const errorMessage = errors.join(', ');
        this.showToast(errorMessage, TOAST_TYPES.ERROR);
    }

    showError(message) {
        this.showToast(message, TOAST_TYPES.ERROR);
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

    dispatchEvent(type, detail) {
        const event = new CustomEvent(type, { detail });
        document.dispatchEvent(event);
    }

    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    // Cleanup method
    destroy() {
        // Remove event listeners
        if (this.form) {
            this.form.removeEventListener('submit', this.calculateMileage);
            this.form.removeEventListener('reset', this.hideResult);
        }

        // Clear any pending timeouts/intervals
        // Save current state
        this.saveTaxLog();

        console.log('🚗 Mileage page destroyed');
    }

    // Public methods for external access
    getTaxLogSummary() {
        const totalMiles = this.taxLog.reduce((sum, entry) => sum + entry.miles, 0);
        const totalAmount = this.taxLog.reduce((sum, entry) => sum + entry.amount, 0);
        
        return {
            totalEntries: this.taxLog.length,
            totalMiles: Math.round(totalMiles * 10) / 10,
            totalAmount: Math.round(totalAmount * 100) / 100,
            averageMiles: this.taxLog.length > 0 ? Math.round((totalMiles / this.taxLog.length) * 10) / 10 : 0
        };
    }

    clearTaxLog() {
        if (confirm('Are you sure you want to clear all tax log entries? This action cannot be undone.')) {
            this.taxLog = [];
            this.saveTaxLog();
            this.updateTaxLogDisplay();
            this.showToast('Tax log cleared', TOAST_TYPES.SUCCESS);
        }
    }

    // Import tax log from CSV
    importFromCSV(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const csv = e.target.result;
                const lines = csv.split('\n');
                const headers = lines[0].split(',');
                
                // Validate headers
                const requiredHeaders = ['Date', 'Route', 'Miles', 'Amount'];
                const hasRequiredHeaders = requiredHeaders.every(header => 
                    headers.some(h => h.toLowerCase().includes(header.toLowerCase()))
                );
                
                if (!hasRequiredHeaders) {
                    throw new Error('Invalid CSV format. Required columns: Date, Route, Miles, Amount');
                }

                // Parse entries
                const entries = lines.slice(1)
                    .filter(line => line.trim())
                    .map((line, index) => {
                        const values = line.split(',');
                        return {
                            id: Date.now() + index,
                            date: new Date(values[0]).toISOString(),
                            claimNumber: values[1] || '',
                            route: values[2].replace(/"/g, ''),
                            miles: parseFloat(values[3]),
                            rate: parseFloat(values[4]) || APP_CONFIG.mileageRates.default,
                            amount: parseFloat(values[5]),
                            firm: values[6] || 'imported'
                        };
                    });

                // Add to existing log
                this.taxLog = [...entries, ...this.taxLog];
                this.saveTaxLog();
                this.updateTaxLogDisplay();
                
                this.showToast(`Imported ${entries.length} entries`, TOAST_TYPES.SUCCESS);
                
            } catch (error) {
                this.showToast(`Import failed: ${error.message}`, TOAST_TYPES.ERROR);
            }
        };
        
        reader.readAsText(file);
    }
}

// Export as default for dynamic import
export default {
    init: () => {
        const mileagePage = new MileagePage();
        mileagePage.init();
        
        // Make it globally accessible for debugging
        window.mileagePage = mileagePage;
        
        return mileagePage;
    }
};