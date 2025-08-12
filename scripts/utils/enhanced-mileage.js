// Enhanced Mileage Calculator with Data Persistence
class EnhancedMileageCalculator {
    constructor() {
        this.taxLog = [];
        this.userSettings = {
            homeAddress: '715 SANDHILL DR, DUDLEY, NC 28333',
            defaultFirm: '',
            mileageRate: 0.67
        };
        this.loadData();
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserSettings();
        this.displayTaxLog();
        console.log('📊 Enhanced Mileage Calculator initialized');
    }

    setupEventListeners() {
        // Calculate distance button
        const calculateBtn = document.querySelector('[onclick="calculateDistanceFixed()"]');
        if (calculateBtn) {
            calculateBtn.removeAttribute('onclick');
            calculateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.calculateDistance();
            });
        }

        // Calculate billing button
        const billingBtn = document.querySelector('[onclick="calculateBillingFixed()"]');
        if (billingBtn) {
            billingBtn.removeAttribute('onclick');
            billingBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.calculateBilling();
            });
        }

        // Clear form button
        const clearBtn = document.querySelector('[onclick="clearFormFixed()"]');
        if (clearBtn) {
            clearBtn.removeAttribute('onclick');
            clearBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.clearForm();
            });
        }

        // Save to log button
        const saveBtn = document.querySelector('[onclick="saveToLog()"]');
        if (saveBtn) {
            saveBtn.removeAttribute('onclick');
            saveBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.saveToLog();
            });
        }

        // Copy result button
        const copyBtn = document.querySelector('[onclick="copyResult()"]');
        if (copyBtn) {
            copyBtn.removeAttribute('onclick');
            copyBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.copyResult();
            });
        }

        // Save home address when changed
        const originInput = document.getElementById('origin');
        if (originInput) {
            originInput.addEventListener('blur', () => {
                this.userSettings.homeAddress = originInput.value;
                this.saveData();
            });
        }

        // Edit and delete buttons for tax log
        this.setupTaxLogEventListeners();

        // CSV import/export
        this.setupFileHandlers();
    }

    setupTaxLogEventListeners() {
        // Edit buttons
        const editButtons = document.querySelectorAll('.edit-log-btn');
        editButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => this.editLogEntry(index));
        });

        // Delete buttons
        const deleteButtons = document.querySelectorAll('.delete-log-btn');
        deleteButtons.forEach((btn, index) => {
            btn.addEventListener('click', () => this.deleteLogEntry(index));
        });
    }

    setupFileHandlers() {
        const importBtn = document.getElementById('import-csv');
        const exportBtn = document.getElementById('export-csv');
        const printBtn = document.getElementById('print-log');

        if (importBtn) importBtn.addEventListener('click', () => this.importCSV());
        if (exportBtn) exportBtn.addEventListener('click', () => this.exportCSV());
        if (printBtn) printBtn.addEventListener('click', () => this.printLog());
    }

    calculateDistance() {
        const origin = document.getElementById('origin').value;
        const destination = document.getElementById('destination').value;

        if (!origin || !destination) {
            this.showToast('Please enter both start and destination addresses', 'error');
            return;
        }

        // Simulate distance calculation (in real app, would use Google Maps API)
        const simulatedDistance = this.simulateDistance(origin, destination);
        
        document.getElementById('totalMiles').value = simulatedDistance.toFixed(1);
        
        this.showToast(`Distance calculated: ${simulatedDistance.toFixed(1)} miles`, 'success');
    }

    calculateBilling() {
        const firm = document.getElementById('firm').value;
        const totalMiles = parseFloat(document.getElementById('totalMiles').value);
        const tripType = document.getElementById('trip-type').value;

        if (!firm) {
            this.showToast('Please select a firm', 'error');
            return;
        }

        if (!totalMiles || totalMiles <= 0) {
            this.showToast('Please calculate distance first', 'error');
            return;
        }

        const firmRates = {
            'FirmA': 0.67, // AMA
            'FirmB': 0.55, // A-TEAM
            'FirmC': 0.63, // Claim Solution
            'FirmD': 0.65, // CCS
            'FirmE': 0.60, // HEA
            'FirmF': 0.65, // IAS
            'FirmG': 0.67  // Sedgwick
        };

        const rate = firmRates[firm] || 0.67;
        const billable = tripType === 'one-way' ? totalMiles / 2 : totalMiles;
        const amount = billable * rate;

        const billingResultEl = document.getElementById('billingResult');
        if (billingResultEl) {
            billingResultEl.innerHTML = `
                <div style="text-align: center;">
                    <div style="font-size: 24px; font-weight: bold; color: #22c55e;">$${amount.toFixed(2)}</div>
                    <div style="font-size: 14px; color: #666; margin-top: 5px;">
                        ${billable.toFixed(1)} miles × $${rate.toFixed(2)}/mile
                    </div>
                </div>
            `;
        }

        // Show the result container
        const resultContainer = document.getElementById('mileage-result');
        if (resultContainer) {
            resultContainer.style.display = 'block';
        }

        this.currentCalculation = {
            firm,
            totalMiles: billable,
            rate,
            amount,
            origin: document.getElementById('origin').value,
            destination: document.getElementById('destination').value,
            claimNumber: document.getElementById('claim-number').value,
            tripType
        };

        this.showToast(`Billing calculated: $${amount.toFixed(2)}`, 'success');
    }

    saveToLog() {
        if (!this.currentCalculation) {
            this.showToast('Please calculate billing first', 'error');
            return;
        }

        const logEntry = {
            id: Date.now().toString(),
            date: new Date().toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
            }),
            ...this.currentCalculation,
            savedAt: new Date().toISOString()
        };

        this.taxLog.unshift(logEntry); // Add to beginning of array
        this.saveData();
        this.displayTaxLog();
        this.clearForm();

        this.showToast('Entry saved to tax log', 'success');
    }

    editLogEntry(index) {
        if (!this.taxLog[index]) return;

        const entry = this.taxLog[index];
        
        // Populate form with entry data
        document.getElementById('firm').value = entry.firm || '';
        document.getElementById('claim-number').value = entry.claimNumber || '';
        document.getElementById('origin').value = entry.origin || '';
        document.getElementById('destination').value = entry.destination || '';
        document.getElementById('totalMiles').value = entry.totalMiles || '';
        document.getElementById('trip-type').value = entry.tripType || 'round-trip';

        // Remove the entry (will be re-added when saved)
        this.taxLog.splice(index, 1);
        this.saveData();
        this.displayTaxLog();

        this.showToast('Entry loaded for editing', 'info');
    }

    deleteLogEntry(index) {
        if (!this.taxLog[index]) return;

        if (confirm('Are you sure you want to delete this log entry?')) {
            const deletedEntry = this.taxLog.splice(index, 1)[0];
            this.saveData();
            this.displayTaxLog();
            this.showToast('Log entry deleted', 'info');
        }
    }

    displayTaxLog() {
        const tbody = document.getElementById('tax-log-tbody');
        if (!tbody) return;

        if (this.taxLog.length === 0) {
            tbody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 20px; color: #666;">
                        No mileage entries yet. Calculate and save your first trip above.
                    </td>
                </tr>
            `;
            this.updateSummary();
            return;
        }

        tbody.innerHTML = this.taxLog.map((entry, index) => `
            <tr>
                <td>${entry.date}</td>
                <td>${this.getFirmName(entry.firm)}</td>
                <td>${entry.claimNumber || '-'}</td>
                <td>${entry.origin} → ${entry.destination}</td>
                <td>${entry.totalMiles ? entry.totalMiles.toFixed(1) : '-'}</td>
                <td>$${entry.rate ? entry.rate.toFixed(2) : '0.67'}</td>
                <td class="text-success">$${entry.amount ? entry.amount.toFixed(2) : '0.00'}</td>
                <td>
                    <button class="btn btn--ghost btn--sm edit-log-btn" data-index="${index}">✏️ Edit</button>
                    <button class="btn btn--ghost btn--sm delete-log-btn" data-index="${index}">🗑️ Delete</button>
                </td>
            </tr>
        `).join('');

        // Re-attach event listeners for new buttons
        setTimeout(() => this.setupTaxLogEventListeners(), 100);
        this.updateSummary();
    }

    updateSummary() {
        const totalMiles = this.taxLog.reduce((sum, entry) => sum + (entry.totalMiles || 0), 0);
        const totalAmount = this.taxLog.reduce((sum, entry) => sum + (entry.amount || 0), 0);
        const avgTrip = this.taxLog.length > 0 ? totalMiles / this.taxLog.length : 0;

        const totalMilesEl = document.getElementById('total-miles-summary');
        const totalAmountEl = document.getElementById('total-amount-summary');
        const avgTripEl = document.getElementById('avg-trip-summary');
        const monthSummaryEl = document.getElementById('month-summary');

        if (totalMilesEl) totalMilesEl.textContent = totalMiles.toFixed(1);
        if (totalAmountEl) totalAmountEl.textContent = `$${totalAmount.toFixed(2)}`;
        if (avgTripEl) avgTripEl.textContent = `${avgTrip.toFixed(1)} mi`;
        if (monthSummaryEl) monthSummaryEl.textContent = `$${totalAmount.toFixed(2)}`;
    }

    getFirmName(firmCode) {
        const firmNames = {
            'FirmA': 'AMA',
            'FirmB': 'A-TEAM',
            'FirmC': 'Claim Solution',
            'FirmD': 'CCS',
            'FirmE': 'HEA',
            'FirmF': 'IAS',
            'FirmG': 'Sedgwick'
        };
        return firmNames[firmCode] || firmCode;
    }

    simulateDistance(origin, destination) {
        // Simulate realistic distance calculation
        // In real app, would use Google Maps Distance Matrix API
        const baseDistance = 15 + Math.random() * 30; // 15-45 miles
        return baseDistance;
    }

    clearForm() {
        document.getElementById('destination').value = '';
        document.getElementById('claim-number').value = '';
        document.getElementById('totalMiles').value = '';
        
        const resultContainer = document.getElementById('mileage-result');
        if (resultContainer) {
            resultContainer.style.display = 'none';
        }

        this.currentCalculation = null;
    }

    copyResult() {
        if (!this.currentCalculation) {
            this.showToast('No result to copy', 'error');
            return;
        }

        const text = `Mileage: ${this.currentCalculation.totalMiles.toFixed(1)} miles - $${this.currentCalculation.amount.toFixed(2)}`;
        
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showToast('Result copied to clipboard', 'success');
            });
        } else {
            // Fallback for older browsers
            const textarea = document.createElement('textarea');
            textarea.value = text;
            document.body.appendChild(textarea);
            textarea.select();
            document.execCommand('copy');
            document.body.removeChild(textarea);
            this.showToast('Result copied to clipboard', 'success');
        }
    }

    exportCSV() {
        if (this.taxLog.length === 0) {
            this.showToast('No data to export', 'error');
            return;
        }

        const csvContent = [
            ['Date', 'Firm', 'Claim Number', 'Origin', 'Destination', 'Miles', 'Rate', 'Amount'],
            ...this.taxLog.map(entry => [
                entry.date,
                this.getFirmName(entry.firm),
                entry.claimNumber || '',
                entry.origin || '',
                entry.destination || '',
                entry.totalMiles ? entry.totalMiles.toFixed(1) : '0',
                entry.rate ? entry.rate.toFixed(2) : '0.67',
                entry.amount ? entry.amount.toFixed(2) : '0.00'
            ])
        ];

        const csv = csvContent.map(row => row.map(field => `"${field}"`).join(',')).join('\n');
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `mileage-log-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        this.showToast('Mileage log exported', 'success');
    }

    importCSV() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.csv';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (!file) return;

            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const csv = e.target.result;
                    const lines = csv.split('\n');
                    const headers = lines[0].split(',').map(h => h.replace(/"/g, ''));
                    
                    const importedEntries = lines.slice(1)
                        .filter(line => line.trim())
                        .map(line => {
                            const values = line.split(',').map(v => v.replace(/"/g, ''));
                            return {
                                id: Date.now().toString() + Math.random(),
                                date: values[0] || '',
                                firm: this.getFirmCode(values[1]) || '',
                                claimNumber: values[2] || '',
                                origin: values[3] || '',
                                destination: values[4] || '',
                                totalMiles: parseFloat(values[5]) || 0,
                                rate: parseFloat(values[6]) || 0.67,
                                amount: parseFloat(values[7]) || 0,
                                imported: true
                            };
                        });

                    this.taxLog = [...importedEntries, ...this.taxLog];
                    this.saveData();
                    this.displayTaxLog();
                    this.showToast(`Imported ${importedEntries.length} entries`, 'success');
                } catch (error) {
                    this.showToast('Error importing CSV file', 'error');
                }
            };
            reader.readAsText(file);
        };
        input.click();
    }

    getFirmCode(firmName) {
        const firmCodes = {
            'AMA': 'FirmA',
            'A-TEAM': 'FirmB',
            'Claim Solution': 'FirmC',
            'CCS': 'FirmD',
            'HEA': 'FirmE',
            'IAS': 'FirmF',
            'Sedgwick': 'FirmG'
        };
        return firmCodes[firmName] || firmName;
    }

    printLog() {
        const printWindow = window.open('', '_blank');
        const printContent = `
            <html>
                <head>
                    <title>Mileage Tax Log</title>
                    <style>
                        body { font-family: Arial, sans-serif; margin: 20px; }
                        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        .summary { margin-top: 20px; display: flex; gap: 20px; }
                        .summary div { padding: 10px; background: #f9f9f9; border-radius: 5px; }
                        @media print { body { margin: 0; } }
                    </style>
                </head>
                <body>
                    <h1>Mileage Tax Log</h1>
                    <p>Generated on: ${new Date().toLocaleDateString()}</p>
                    <table>
                        <thead>
                            <tr><th>Date</th><th>Firm</th><th>Claim #</th><th>Route</th><th>Miles</th><th>Rate</th><th>Amount</th></tr>
                        </thead>
                        <tbody>
                            ${this.taxLog.map(entry => `
                                <tr>
                                    <td>${entry.date}</td>
                                    <td>${this.getFirmName(entry.firm)}</td>
                                    <td>${entry.claimNumber || '-'}</td>
                                    <td>${entry.origin} → ${entry.destination}</td>
                                    <td>${entry.totalMiles ? entry.totalMiles.toFixed(1) : '-'}</td>
                                    <td>$${entry.rate ? entry.rate.toFixed(2) : '0.67'}</td>
                                    <td>$${entry.amount ? entry.amount.toFixed(2) : '0.00'}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="summary">
                        <div><strong>Total Miles:</strong> ${this.taxLog.reduce((sum, entry) => sum + (entry.totalMiles || 0), 0).toFixed(1)}</div>
                        <div><strong>Total Amount:</strong> $${this.taxLog.reduce((sum, entry) => sum + (entry.amount || 0), 0).toFixed(2)}</div>
                        <div><strong>Entries:</strong> ${this.taxLog.length}</div>
                    </div>
                </body>
            </html>
        `;
        
        printWindow.document.write(printContent);
        printWindow.document.close();
        printWindow.print();
    }

    loadUserSettings() {
        const originInput = document.getElementById('origin');
        if (originInput && this.userSettings.homeAddress) {
            originInput.value = this.userSettings.homeAddress;
        }
    }

    loadData() {
        try {
            const savedSettings = localStorage.getItem('mileage-settings');
            if (savedSettings) {
                this.userSettings = { ...this.userSettings, ...JSON.parse(savedSettings) };
            }

            const savedLog = localStorage.getItem('mileage-tax-log');
            if (savedLog) {
                this.taxLog = JSON.parse(savedLog);
            }
        } catch (error) {
            console.error('Error loading mileage data:', error);
        }
    }

    saveData() {
        try {
            localStorage.setItem('mileage-settings', JSON.stringify(this.userSettings));
            localStorage.setItem('mileage-tax-log', JSON.stringify(this.taxLog));
        } catch (error) {
            console.error('Error saving mileage data:', error);
        }
    }

    showToast(message, type = 'info') {
        // Create toast notification
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#22c55e' : type === 'error' ? '#ef4444' : '#3b82f6'};
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            box-shadow: 0 4px 6px rgba(0,0,0,0.1);
            z-index: 1000;
            font-size: 14px;
            max-width: 300px;
            animation: slideIn 0.3s ease;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);

        // Add CSS animation
        if (!document.getElementById('toast-styles')) {
            const style = document.createElement('style');
            style.id = 'toast-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
            `;
            document.head.appendChild(style);
        }

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.mileageCalculator = new EnhancedMileageCalculator();
});
