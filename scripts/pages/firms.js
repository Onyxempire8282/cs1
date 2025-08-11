// Firms Directory JavaScript
class FirmsDirectory {
    constructor() {
        this.firms = [];
        this.filteredFirms = [];
        this.currentView = 'cards';
        this.selectedFirm = null;
        
        this.init();
    }

    init() {
        this.loadSampleData();
        this.bindEventListeners();
        this.renderFirms();
        this.updateFilters();
        
        // Hide loading container
        document.getElementById('loading-container').style.display = 'none';
    }

    // Real firm data from master sheet
    loadSampleData() {
        this.firms = [
            // Nationwide Daily Auto Companies
            {
                id: 1,
                name: "AutoClaims Direct (ACD)",
                type: "independent",
                contactName: "Claims Department",
                phone: "",
                email: "",
                website: "https://acd.autoclaimsdirect.com",
                address: "",
                city: "Nationwide",
                state: "Nationwide",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto/Heavy - Driving Your Success"
            },
            {
                id: 2,
                name: "SCA Claims",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "https://www.sca-appraisal.com",
                address: "",
                city: "Nationwide",
                state: "Nationwide",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto/Heavy"
            },
            {
                id: 3,
                name: "Sedgwick",
                type: "tpa",
                contactName: "",
                phone: "",
                email: "",
                website: "https://www.sedgwick.com/autoappraisals",
                address: "",
                city: "Nationwide",
                state: "Nationwide",
                zip: "",
                specialties: ["auto"],
                notes: "formerly Nationwide Appraisals, LLC - Daily Auto/Heavy"
            },
            {
                id: 4,
                name: "TheBest Claims Solutions",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "https://www.thebestirs.com/",
                address: "",
                city: "Nationwide",
                state: "Nationwide",
                zip: "",
                specialties: ["auto", "property"],
                notes: "Daily Auto, Catastrophic, Desk Deployments"
            },
            {
                id: 5,
                name: "Claim Solution Inc.",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "http://www.claimsolution.com",
                address: "",
                city: "Nationwide",
                state: "Nationwide",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto/Heavy"
            },
            {
                id: 6,
                name: "Eberl",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "https://www.eberls.com/",
                address: "",
                city: "Nationwide",
                state: "Nationwide",
                zip: "",
                specialties: ["auto", "property"],
                notes: "Daily Auto, Catastrophic, Desk Deployments"
            },
            {
                id: 7,
                name: "The Doan Group",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "http://www.doan.com",
                address: "",
                city: "Nationwide",
                state: "Nationwide",
                zip: "",
                specialties: ["auto", "property"],
                notes: "Daily Auto, Heavy, Some Property"
            },
            {
                id: 8,
                name: "Kirk's Appraisal Service",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "https://www.kirksappraisal.com/",
                address: "",
                city: "Nationwide",
                state: "Nationwide",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto Heavy"
            },
            {
                id: 9,
                name: "QA Claims",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "https://www.qaclaims.com/",
                address: "",
                city: "Nationwide",
                state: "Nationwide",
                zip: "",
                specialties: ["auto", "property"],
                notes: "Daily Auto, Catastrophic, Desk Deployments"
            },
            {
                id: 10,
                name: "Primeclaims Group",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "https://primeclaims.com/",
                address: "",
                city: "Nationwide",
                state: "Nationwide",
                zip: "",
                specialties: ["auto", "property"],
                notes: "Daily Auto & Property"
            },
            {
                id: 11,
                name: "DEKRA Services Inc.",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "https://www.dekra.us/en/home-page/",
                address: "",
                city: "Nationwide",
                state: "Nationwide",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto"
            },
            {
                id: 12,
                name: "Nexterra",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "https://nexterras.com/",
                address: "",
                city: "Nationwide",
                state: "Nationwide",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto (mainly hail)"
            },
            // Regional Daily Claim Companies
            {
                id: 13,
                name: "Complete Claims Service",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "https://www.completeclaims.com",
                address: "",
                city: "East Coast",
                state: "Multi-State",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto - East Coast Coverage"
            },
            {
                id: 14,
                name: "McAnally Appraisal Services",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "https://macclaims.com",
                address: "",
                city: "Texas & Georgia",
                state: "TX",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto"
            },
            {
                id: 15,
                name: "Rapid Appraisal Services",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "https://rasofhouston.com/",
                address: "",
                city: "Texas, New Mexico, Louisiana",
                state: "TX",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto"
            },
            {
                id: 16,
                name: "CGIA Solutions",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "https://cgiasolutions.com",
                address: "",
                city: "Texas",
                state: "TX",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto/Heavy"
            },
            {
                id: 17,
                name: "S&S Appraisal Services, LLC",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "N/A",
                address: "",
                city: "East Coast Area surrounding VA",
                state: "VA",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto"
            },
            {
                id: 18,
                name: "Viking Auto Appraisal",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "n/a",
                address: "",
                city: "Massachusetts",
                state: "MA",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto/Heavy"
            },
            {
                id: 19,
                name: "Frontline Appraisals LLC",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "https://frontlineadjusting.com/",
                address: "",
                city: "VA, WV, DC, MD, NC, OH, IN, KY, TN, PA, SC, MI, DE",
                state: "VA",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto"
            },
            {
                id: 20,
                name: "Cal West Appraisal Services",
                type: "independent",
                contactName: "",
                phone: "",
                email: "",
                website: "http://www.calwestas.com",
                address: "",
                city: "CA, OR, NV, AZ",
                state: "CA",
                zip: "",
                specialties: ["auto"],
                notes: "Daily Auto"
            }
        ];
        
        this.filteredFirms = [...this.firms];
    }

    bindEventListeners() {
        // Search functionality
        const searchInput = document.getElementById('firms-search');
        searchInput?.addEventListener('input', (e) => {
            this.filterFirms();
        });

        // Filter dropdowns
        const stateFilter = document.getElementById('state-filter');
        const typeFilter = document.getElementById('type-filter');
        const specialtyFilter = document.getElementById('specialty-filter');
        
        stateFilter?.addEventListener('change', () => this.filterFirms());
        typeFilter?.addEventListener('change', () => this.filterFirms());
        specialtyFilter?.addEventListener('change', () => this.filterFirms());

        // Clear filters
        document.getElementById('clear-filters-btn')?.addEventListener('click', () => {
            searchInput.value = '';
            stateFilter.value = '';
            typeFilter.value = '';
            specialtyFilter.value = '';
            this.filterFirms();
        });

        // View toggles
        document.getElementById('cards-view-btn')?.addEventListener('click', () => {
            this.switchView('cards');
        });
        
        document.getElementById('table-view-btn')?.addEventListener('click', () => {
            this.switchView('table');
        });

        // Add firm button
        document.getElementById('add-firm-btn')?.addEventListener('click', () => {
            this.showAddFirmModal();
        });

        // Modal controls
        document.getElementById('modal-close-btn')?.addEventListener('click', () => {
            this.hideModal();
        });
        
        document.getElementById('cancel-btn')?.addEventListener('click', () => {
            this.hideModal();
        });

        // Form submission
        document.getElementById('firm-form')?.addEventListener('submit', (e) => {
            e.preventDefault();
            this.saveFirm();
        });

        // Import/Export buttons
        document.getElementById('import-firms-btn')?.addEventListener('click', () => {
            this.importFirms();
        });
        
        document.getElementById('export-firms-btn')?.addEventListener('click', () => {
            this.exportFirms();
        });

        // File input for CSV import
        document.getElementById('csv-file-input')?.addEventListener('change', (e) => {
            this.handleFileImport(e);
        });

        // Close modal on outside click
        document.getElementById('firm-modal')?.addEventListener('click', (e) => {
            if (e.target.id === 'firm-modal') {
                this.hideModal();
            }
        });
    }

    filterFirms() {
        const searchTerm = document.getElementById('firms-search')?.value.toLowerCase() || '';
        const stateFilter = document.getElementById('state-filter')?.value || '';
        const typeFilter = document.getElementById('type-filter')?.value || '';
        const specialtyFilter = document.getElementById('specialty-filter')?.value || '';

        this.filteredFirms = this.firms.filter(firm => {
            const matchesSearch = !searchTerm || 
                firm.name.toLowerCase().includes(searchTerm) ||
                firm.city.toLowerCase().includes(searchTerm) ||
                firm.contactName?.toLowerCase().includes(searchTerm) ||
                firm.notes?.toLowerCase().includes(searchTerm);

            const matchesState = !stateFilter || firm.state === stateFilter;
            const matchesType = !typeFilter || firm.type === typeFilter;
            const matchesSpecialty = !specialtyFilter || 
                firm.specialties.includes(specialtyFilter);

            return matchesSearch && matchesState && matchesType && matchesSpecialty;
        });

        this.renderFirms();
        this.updateResultsCount();
    }

    renderFirms() {
        if (this.currentView === 'cards') {
            this.renderCardsView();
        } else {
            this.renderTableView();
        }
    }

    renderCardsView() {
        const container = document.getElementById('firms-cards');
        if (!container) return;

        if (this.filteredFirms.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        container.innerHTML = this.filteredFirms.map(firm => `
            <div class="firm-card" data-firm-id="${firm.id}">
                <div class="firm-card__header">
                    <h4 class="firm-card__name">${firm.name}</h4>
                    <span class="firm-card__type">${this.getTypeLabel(firm.type)}</span>
                </div>
                
                <div class="firm-card__location">
                    📍 ${firm.city}, ${firm.state} ${firm.zip || ''}
                </div>
                
                <div class="firm-card__contact">
                    ${firm.contactName ? `<div class="contact-item">👤 ${firm.contactName}</div>` : ''}
                    ${firm.phone ? `<a href="tel:${firm.phone}" class="contact-item">📞 ${firm.phone}</a>` : ''}
                    ${firm.email ? `<a href="mailto:${firm.email}" class="contact-item">📧 ${firm.email}</a>` : ''}
                    ${firm.website ? `<a href="${firm.website}" target="_blank" class="contact-item">🌐 Website</a>` : ''}
                </div>
                
                ${firm.specialties?.length ? `
                    <div class="firm-card__specialties">
                        <div class="specialties-list">
                            ${firm.specialties.map(specialty => 
                                `<span class="specialty-tag">${this.getSpecialtyLabel(specialty)}</span>`
                            ).join('')}
                        </div>
                    </div>
                ` : ''}
                
                <div class="firm-card__actions">
                    <button class="btn btn--ghost btn--small" onclick="firmsDirectory.editFirm(${firm.id})">
                        ✏️ Edit
                    </button>
                    <button class="btn btn--danger btn--small" onclick="firmsDirectory.deleteFirm(${firm.id})">
                        🗑️ Delete
                    </button>
                </div>
            </div>
        `).join('');
    }

    renderTableView() {
        const tbody = document.getElementById('firms-table-body');
        if (!tbody) return;

        if (this.filteredFirms.length === 0) {
            this.showEmptyState();
            return;
        }

        this.hideEmptyState();
        
        tbody.innerHTML = this.filteredFirms.map(firm => `
            <tr data-firm-id="${firm.id}">
                <td class="table-firm-name">${firm.name}</td>
                <td><span class="table-firm-type">${this.getTypeLabel(firm.type)}</span></td>
                <td>${firm.city}, ${firm.state}</td>
                <td>${firm.phone || '-'}</td>
                <td class="table-contact">${firm.contactName || '-'}</td>
                <td class="table-actions">
                    <button class="btn btn--ghost btn--small" onclick="firmsDirectory.editFirm(${firm.id})">
                        ✏️
                    </button>
                    <button class="btn btn--danger btn--small" onclick="firmsDirectory.deleteFirm(${firm.id})">
                        🗑️
                    </button>
                </td>
            </tr>
        `).join('');
    }

    switchView(view) {
        this.currentView = view;
        
        // Update button states
        const cardsBtn = document.getElementById('cards-view-btn');
        const tableBtn = document.getElementById('table-view-btn');
        
        cardsBtn?.classList.toggle('view-toggle--active', view === 'cards');
        tableBtn?.classList.toggle('view-toggle--active', view === 'table');
        
        // Show/hide containers
        const cardsContainer = document.getElementById('firms-cards');
        const tableContainer = document.getElementById('firms-table-container');
        
        if (cardsContainer) cardsContainer.style.display = view === 'cards' ? 'grid' : 'none';
        if (tableContainer) tableContainer.style.display = view === 'table' ? 'block' : 'none';
        
        this.renderFirms();
    }

    updateResultsCount() {
        const countElement = document.getElementById('firms-count');
        if (countElement) {
            const count = this.filteredFirms.length;
            countElement.textContent = `${count} firm${count !== 1 ? 's' : ''} found`;
        }
    }

    showAddFirmModal() {
        this.selectedFirm = null;
        document.getElementById('modal-title').textContent = 'Add New Firm';
        document.getElementById('firm-form').reset();
        document.getElementById('save-firm-btn').textContent = 'Save Firm';
        this.showModal();
    }

    editFirm(firmId) {
        this.selectedFirm = this.firms.find(f => f.id === firmId);
        if (!this.selectedFirm) return;

        document.getElementById('modal-title').textContent = 'Edit Firm';
        document.getElementById('save-firm-btn').textContent = 'Update Firm';
        
        // Populate form fields
        document.getElementById('firm-name').value = this.selectedFirm.name || '';
        document.getElementById('firm-type').value = this.selectedFirm.type || '';
        document.getElementById('contact-name').value = this.selectedFirm.contactName || '';
        document.getElementById('firm-phone').value = this.selectedFirm.phone || '';
        document.getElementById('firm-email').value = this.selectedFirm.email || '';
        document.getElementById('firm-website').value = this.selectedFirm.website || '';
        document.getElementById('firm-address').value = this.selectedFirm.address || '';
        document.getElementById('firm-city').value = this.selectedFirm.city || '';
        document.getElementById('firm-state').value = this.selectedFirm.state || '';
        document.getElementById('firm-zip').value = this.selectedFirm.zip || '';
        document.getElementById('firm-notes').value = this.selectedFirm.notes || '';
        
        // Handle specialties checkboxes
        const checkboxes = document.querySelectorAll('#specialties-group input[type="checkbox"]');
        checkboxes.forEach(checkbox => {
            checkbox.checked = this.selectedFirm.specialties?.includes(checkbox.value) || false;
        });
        
        this.showModal();
    }

    showModal() {
        const modal = document.getElementById('firm-modal');
        if (modal) {
            modal.classList.add('show');
            // Focus first input
            setTimeout(() => {
                const firstInput = modal.querySelector('input:not([type="checkbox"])');
                if (firstInput) firstInput.focus();
            }, 100);
        }
    }

    hideModal() {
        const modal = document.getElementById('firm-modal');
        if (modal) {
            modal.classList.remove('show');
        }
    }

    deleteFirm(firmId) {
        if (confirm('Are you sure you want to delete this firm?')) {
            this.firms = this.firms.filter(f => f.id !== firmId);
            this.filterFirms();
            this.showToast('Firm deleted successfully', 'success');
        }
    }

    saveFirm() {
        const formData = new FormData(document.getElementById('firm-form'));
        
        // Get selected specialties
        const specialties = Array.from(document.querySelectorAll('#specialties-group input[type="checkbox"]:checked'))
            .map(cb => cb.value);
        
        const firmData = {
            name: document.getElementById('firm-name').value,
            type: document.getElementById('firm-type').value,
            contactName: document.getElementById('contact-name').value,
            phone: document.getElementById('firm-phone').value,
            email: document.getElementById('firm-email').value,
            website: document.getElementById('firm-website').value,
            address: document.getElementById('firm-address').value,
            city: document.getElementById('firm-city').value,
            state: document.getElementById('firm-state').value,
            zip: document.getElementById('firm-zip').value,
            specialties: specialties,
            notes: document.getElementById('firm-notes').value
        };

        if (this.selectedFirm) {
            // Edit existing firm
            Object.assign(this.selectedFirm, firmData);
            this.showToast('Firm updated successfully', 'success');
        } else {
            // Add new firm
            firmData.id = Math.max(...this.firms.map(f => f.id), 0) + 1;
            this.firms.push(firmData);
            this.showToast('Firm added successfully', 'success');
        }

        this.hideModal();
        this.filterFirms();
        this.updateFilters();
    }

    hideModal() {
        document.getElementById('firm-modal').classList.remove('show');
    }

    importFirms() {
        document.getElementById('csv-file-input').click();
    }

    handleFileImport(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const text = e.target.result;
                const lines = text.split('\n');
                const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
                
                const importedFirms = [];
                for (let i = 1; i < lines.length; i++) {
                    if (lines[i].trim()) {
                        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
                        const firm = {
                            id: Math.max(...this.firms.map(f => f.id), 0) + importedFirms.length + 1,
                            name: values[0] || '',
                            type: values[1] || '',
                            contactName: values[2] || '',
                            phone: values[3] || '',
                            email: values[4] || '',
                            city: values[5] || '',
                            state: values[6] || '',
                            specialties: values[7] ? values[7].split(';') : []
                        };
                        importedFirms.push(firm);
                    }
                }
                
                this.firms.push(...importedFirms);
                this.filterFirms();
                this.showToast(`${importedFirms.length} firms imported successfully`, 'success');
            } catch (error) {
                this.showToast('Error importing firms. Please check file format.', 'error');
                console.error('Import error:', error);
            }
        };
        reader.readAsText(file);
    }

    exportFirms() {
        const csvContent = [
            'Name,Type,Contact,Phone,Email,City,State,Specialties',
            ...this.firms.map(firm => [
                firm.name,
                this.getTypeLabel(firm.type),
                firm.contactName || '',
                firm.phone || '',
                firm.email || '',
                firm.city,
                firm.state,
                firm.specialties?.join(';') || ''
            ].map(field => `"${field}"`).join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'firms-directory.csv';
        a.click();
        URL.revokeObjectURL(url);
    }

    showEmptyState() {
        document.getElementById('empty-state').style.display = 'block';
        document.getElementById('firms-cards').style.display = 'none';
        document.getElementById('firms-table-container').style.display = 'none';
    }

    hideEmptyState() {
        document.getElementById('empty-state').style.display = 'none';
        if (this.currentView === 'cards') {
            document.getElementById('firms-cards').style.display = 'grid';
        } else {
            document.getElementById('firms-table-container').style.display = 'block';
        }
    }

    updateFilters() {
        // Update state filter with unique states
        const states = [...new Set(this.firms.map(f => f.state))].sort();
        const stateFilter = document.getElementById('state-filter');
        if (stateFilter) {
            const currentValue = stateFilter.value;
            stateFilter.innerHTML = '<option value="">All States</option>' +
                states.map(state => `<option value="${state}">${state}</option>`).join('');
            stateFilter.value = currentValue;
        }
    }

    getTypeLabel(type) {
        const labels = {
            'carrier': 'Insurance Carrier',
            'independent': 'Independent Adjuster',
            'tpa': 'Third Party Administrator',
            'law-firm': 'Law Firm',
            'vendor': 'Vendor',
            'restoration': 'Restoration'
        };
        return labels[type] || type;
    }

    getSpecialtyLabel(specialty) {
        const labels = {
            'auto': 'Auto Claims',
            'property': 'Property Claims',
            'liability': 'Liability',
            'workers-comp': 'Workers Comp',
            'marine': 'Marine',
            'commercial': 'Commercial'
        };
        return labels[specialty] || specialty;
    }

    showToast(message, type = 'success') {
        // Use existing toast component
        if (window.showToast) {
            window.showToast(message);
        }
    }
}

// Initialize the firms directory when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.firmsDirectory = new FirmsDirectory();
});

// Export for potential external use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FirmsDirectory;
}
