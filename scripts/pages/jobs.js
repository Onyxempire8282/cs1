/**
 * Jobs Page Controller
 * Handles mobile sync, photo management, and job tracking functionality
 */

import { showToast } from '../components/toast.js';
import { validateFile } from '../utils/helpers.js';
import { STORAGE_KEYS, FILE_TYPES } from '../utils/constants.js';

class JobsManager {
  constructor() {
    this.jobs = this.loadJobs();
    this.selectedPhotos = new Set();
    this.isLoading = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderJobs();
    this.updateStats();
    this.setupMobileSync();
  }

  bindEvents() {
    // Job creation
    const jobForm = document.querySelector('.jobs__form');
    if (jobForm) {
      jobForm.addEventListener('submit', (e) => this.handleJobSubmit(e));
    }

    // Photo upload
    const photoUpload = document.querySelector('.photo-upload');
    if (photoUpload) {
      this.setupPhotoUpload(photoUpload);
    }

    // Bulk actions
    const selectAllBtn = document.querySelector('.jobs__select-all');
    const deleteSelectedBtn = document.querySelector('.jobs__delete-selected');
    const syncSelectedBtn = document.querySelector('.jobs__sync-selected');

    if (selectAllBtn) {
      selectAllBtn.addEventListener('click', () => this.selectAllJobs());
    }
    if (deleteSelectedBtn) {
      deleteSelectedBtn.addEventListener('click', () => this.deleteSelectedJobs());
    }
    if (syncSelectedBtn) {
      syncSelectedBtn.addEventListener('click', () => this.syncSelectedJobs());
    }

    // Search and filter
    const searchInput = document.querySelector('.jobs__search');
    const statusFilter = document.querySelector('.jobs__status-filter');
    const dateFilter = document.querySelector('.jobs__date-filter');

    if (searchInput) {
      searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
    }
    if (statusFilter) {
      statusFilter.addEventListener('change', (e) => this.handleStatusFilter(e.target.value));
    }
    if (dateFilter) {
      dateFilter.addEventListener('change', (e) => this.handleDateFilter(e.target.value));
    }

    // Modal events
    this.bindModalEvents();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
  }

  bindModalEvents() {
    // Job detail modal
    const jobModal = document.querySelector('#job-detail-modal');
    const jobModalClose = document.querySelector('.job-modal__close');

    if (jobModalClose) {
      jobModalClose.addEventListener('click', () => this.closeJobModal());
    }

    // Photo viewer modal
    const photoModal = document.querySelector('#photo-viewer-modal');
    const photoModalClose = document.querySelector('.photo-modal__close');

    if (photoModalClose) {
      photoModalClose.addEventListener('click', () => this.closePhotoModal());
    }

    // Click outside to close
    [jobModal, photoModal].forEach(modal => {
      if (modal) {
        modal.addEventListener('click', (e) => {
          if (e.target === modal) {
            this.closeJobModal();
            this.closePhotoModal();
          }
        });
      }
    });
  }

  handleJobSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    const jobData = {
      id: Date.now().toString(),
      clientName: formData.get('client-name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      serviceType: formData.get('service-type'),
      priority: formData.get('priority'),
      notes: formData.get('notes'),
      status: 'pending',
      createdAt: new Date().toISOString(),
      photos: [],
      syncStatus: 'local'
    };

    // Validate required fields
    if (!jobData.clientName || !jobData.address || !jobData.serviceType) {
      showToast('Please fill in all required fields', 'error');
      return;
    }

    this.addJob(jobData);
    e.target.reset();
    showToast('Job created successfully', 'success');
  }

  addJob(jobData) {
    this.jobs.unshift(jobData);
    this.saveJobs();
    this.renderJobs();
    this.updateStats();
  }

  updateJob(jobId, updates) {
    const jobIndex = this.jobs.findIndex(job => job.id === jobId);
    if (jobIndex !== -1) {
      this.jobs[jobIndex] = { ...this.jobs[jobIndex], ...updates };
      this.saveJobs();
      this.renderJobs();
      this.updateStats();
    }
  }

  deleteJob(jobId) {
    this.jobs = this.jobs.filter(job => job.id !== jobId);
    this.saveJobs();
    this.renderJobs();
    this.updateStats();
  }

  selectAllJobs() {
    const checkboxes = document.querySelectorAll('.job-item__checkbox');
    const allChecked = Array.from(checkboxes).every(cb => cb.checked);
    
    checkboxes.forEach(checkbox => {
      checkbox.checked = !allChecked;
      const jobId = checkbox.dataset.jobId;
      if (!allChecked) {
        this.selectedPhotos.add(jobId);
      } else {
        this.selectedPhotos.delete(jobId);
      }
    });

    this.updateBulkActions();
    showToast(`${allChecked ? 'Deselected' : 'Selected'} all jobs`, 'info');
  }

  deleteSelectedJobs() {
    if (this.selectedPhotos.size === 0) {
      showToast('No jobs selected', 'warning');
      return;
    }

    if (!confirm(`Delete ${this.selectedPhotos.size} selected jobs?`)) {
      return;
    }

    this.jobs = this.jobs.filter(job => !this.selectedPhotos.has(job.id));
    this.selectedPhotos.clear();
    this.saveJobs();
    this.renderJobs();
    this.updateStats();
    this.updateBulkActions();
    
    showToast('Selected jobs deleted', 'success');
  }

  syncSelectedJobs() {
    if (this.selectedPhotos.size === 0) {
      showToast('No jobs selected', 'warning');
      return;
    }

    this.isLoading = true;
    this.updateLoadingState();

    // Simulate sync process
    setTimeout(() => {
      this.selectedPhotos.forEach(jobId => {
        this.updateJob(jobId, { 
          syncStatus: 'synced',
          syncedAt: new Date().toISOString()
        });
      });

      this.selectedPhotos.clear();
      this.isLoading = false;
      this.updateLoadingState();
      this.updateBulkActions();
      
      showToast('Jobs synced successfully', 'success');
    }, 2000);
  }

  setupPhotoUpload(uploadElement) {
    const dropZone = uploadElement.querySelector('.photo-upload__drop-zone');
    const fileInput = uploadElement.querySelector('.photo-upload__input');
    const previewContainer = uploadElement.querySelector('.photo-upload__preview');

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('photo-upload__drop-zone--dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('photo-upload__drop-zone--dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('photo-upload__drop-zone--dragover');
      const files = Array.from(e.dataTransfer.files);
      this.handlePhotoFiles(files, previewContainer);
    });

    // File input
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      this.handlePhotoFiles(files, previewContainer);
    });

    // Click to upload
    dropZone.addEventListener('click', () => {
      fileInput.click();
    });
  }

  handlePhotoFiles(files, previewContainer) {
    files.forEach(file => {
      if (!validateFile(file, FILE_TYPES.IMAGE)) {
        showToast(`Invalid file: ${file.name}`, 'error');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        this.addPhotoPreview(file, e.target.result, previewContainer);
      };
      reader.readAsDataURL(file);
    });
  }

  addPhotoPreview(file, dataUrl, container) {
    const preview = document.createElement('div');
    preview.className = 'photo-preview';
    preview.innerHTML = `
      <img src="${dataUrl}" alt="${file.name}" class="photo-preview__image">
      <div class="photo-preview__info">
        <span class="photo-preview__name">${file.name}</span>
        <span class="photo-preview__size">${this.formatFileSize(file.size)}</span>
      </div>
      <button type="button" class="photo-preview__remove" aria-label="Remove photo">
        <svg class="icon" width="16" height="16">
          <use href="#icon-close"></use>
        </svg>
      </button>
    `;

    preview.querySelector('.photo-preview__remove').addEventListener('click', () => {
      preview.remove();
    });

    container.appendChild(preview);
  }

  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  handleSearch(query) {
    this.currentSearch = query.toLowerCase();
    this.renderJobs();
  }

  handleStatusFilter(status) {
    this.currentStatusFilter = status;
    this.renderJobs();
  }

  handleDateFilter(dateRange) {
    this.currentDateFilter = dateRange;
    this.renderJobs();
  }

  getFilteredJobs() {
    let filteredJobs = [...this.jobs];

    // Search filter
    if (this.currentSearch) {
      filteredJobs = filteredJobs.filter(job =>
        job.clientName.toLowerCase().includes(this.currentSearch) ||
        job.address.toLowerCase().includes(this.currentSearch) ||
        job.serviceType.toLowerCase().includes(this.currentSearch)
      );
    }

    // Status filter
    if (this.currentStatusFilter && this.currentStatusFilter !== 'all') {
      filteredJobs = filteredJobs.filter(job => job.status === this.currentStatusFilter);
    }

    // Date filter
    if (this.currentDateFilter && this.currentDateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();

      switch (this.currentDateFilter) {
        case 'today':
          filterDate.setHours(0, 0, 0, 0);
          break;
        case 'week':
          filterDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          filterDate.setMonth(now.getMonth() - 1);
          break;
      }

      filteredJobs = filteredJobs.filter(job =>
        new Date(job.createdAt) >= filterDate
      );
    }

    return filteredJobs;
  }

  renderJobs() {
    const container = document.querySelector('.jobs__list');
    if (!container) return;

    const filteredJobs = this.getFilteredJobs();

    if (filteredJobs.length === 0) {
      container.innerHTML = `
        <div class="jobs__empty">
          <svg class="jobs__empty-icon" width="48" height="48">
            <use href="#icon-briefcase"></use>
          </svg>
          <h3 class="jobs__empty-title">No jobs found</h3>
          <p class="jobs__empty-description">
            ${this.jobs.length === 0 ? 'Create your first job to get started' : 'Try adjusting your filters'}
          </p>
        </div>
      `;
      return;
    }

    container.innerHTML = filteredJobs.map(job => this.renderJobItem(job)).join('');
    this.bindJobEvents();
  }

  renderJobItem(job) {
    const statusClass = `job-item__status--${job.status}`;
    const syncClass = `job-item__sync--${job.syncStatus}`;
    const priorityClass = `job-item__priority--${job.priority}`;

    return `
      <div class="job-item" data-job-id="${job.id}">
        <div class="job-item__header">
          <label class="job-item__checkbox-wrapper">
            <input 
              type="checkbox" 
              class="job-item__checkbox" 
              data-job-id="${job.id}"
              ${this.selectedPhotos.has(job.id) ? 'checked' : ''}
            >
            <span class="checkmark"></span>
          </label>
          
          <div class="job-item__meta">
            <span class="job-item__status ${statusClass}">${job.status}</span>
            <span class="job-item__sync ${syncClass}" title="Sync status: ${job.syncStatus}">
              <svg class="icon" width="12" height="12">
                <use href="#icon-${job.syncStatus === 'synced' ? 'check-circle' : 'clock'}"></use>
              </svg>
            </span>
            <span class="job-item__priority ${priorityClass}" title="Priority: ${job.priority}">
              ${job.priority}
            </span>
          </div>
        </div>

        <div class="job-item__content">
          <div class="job-item__main">
            <h3 class="job-item__client">${job.clientName}</h3>
            <p class="job-item__address">${job.address}</p>
            <p class="job-item__service">${job.serviceType}</p>
            ${job.notes ? `<p class="job-item__notes">${job.notes}</p>` : ''}
          </div>

          <div class="job-item__details">
            <div class="job-item__contact">
              ${job.phone ? `
                <a href="tel:${job.phone}" class="job-item__phone">
                  <svg class="icon" width="14" height="14">
                    <use href="#icon-phone"></use>
                  </svg>
                  ${job.phone}
                </a>
              ` : ''}
              ${job.email ? `
                <a href="mailto:${job.email}" class="job-item__email">
                  <svg class="icon" width="14" height="14">
                    <use href="#icon-mail"></use>
                  </svg>
                  ${job.email}
                </a>
              ` : ''}
            </div>

            <div class="job-item__photos">
              ${job.photos.length > 0 ? `
                <button class="job-item__photos-btn" data-job-id="${job.id}">
                  <svg class="icon" width="14" height="14">
                    <use href="#icon-camera"></use>
                  </svg>
                  ${job.photos.length} photo${job.photos.length !== 1 ? 's' : ''}
                </button>
              ` : ''}
            </div>

            <time class="job-item__date" datetime="${job.createdAt}">
              ${new Date(job.createdAt).toLocaleDateString()}
            </time>
          </div>
        </div>

        <div class="job-item__actions">
          <button class="btn btn--small btn--secondary job-item__edit" data-job-id="${job.id}">
            Edit
          </button>
          <button class="btn btn--small btn--primary job-item__view" data-job-id="${job.id}">
            View
          </button>
        </div>
      </div>
    `;
  }

  bindJobEvents() {
    // Checkbox selection
    document.querySelectorAll('.job-item__checkbox').forEach(checkbox => {
      checkbox.addEventListener('change', (e) => {
        const jobId = e.target.dataset.jobId;
        if (e.target.checked) {
          this.selectedPhotos.add(jobId);
        } else {
          this.selectedPhotos.delete(jobId);
        }
        this.updateBulkActions();
      });
    });

    // Job actions
    document.querySelectorAll('.job-item__view').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const jobId = e.target.dataset.jobId;
        this.viewJob(jobId);
      });
    });

    document.querySelectorAll('.job-item__edit').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const jobId = e.target.dataset.jobId;
        this.editJob(jobId);
      });
    });

    // Photo viewer
    document.querySelectorAll('.job-item__photos-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const jobId = e.target.dataset.jobId;
        this.viewJobPhotos(jobId);
      });
    });
  }

  viewJob(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job) return;

    const modal = document.querySelector('#job-detail-modal');
    if (!modal) return;

    // Populate modal with job details
    modal.querySelector('.job-modal__title').textContent = job.clientName;
    modal.querySelector('.job-modal__address').textContent = job.address;
    modal.querySelector('.job-modal__service').textContent = job.serviceType;
    modal.querySelector('.job-modal__status').textContent = job.status;
    modal.querySelector('.job-modal__priority').textContent = job.priority;
    modal.querySelector('.job-modal__notes').textContent = job.notes || 'No notes';
    
    if (job.phone) {
      modal.querySelector('.job-modal__phone').textContent = job.phone;
      modal.querySelector('.job-modal__phone').href = `tel:${job.phone}`;
    }
    
    if (job.email) {
      modal.querySelector('.job-modal__email').textContent = job.email;
      modal.querySelector('.job-modal__email').href = `mailto:${job.email}`;
    }

    modal.classList.add('modal--active');
    document.body.classList.add('modal-open');
  }

  editJob(jobId) {
    // In a real application, this would open an edit form
    showToast('Edit functionality would open here', 'info');
  }

  viewJobPhotos(jobId) {
    const job = this.jobs.find(j => j.id === jobId);
    if (!job || job.photos.length === 0) return;

    // In a real application, this would display the photo gallery
    showToast(`Viewing ${job.photos.length} photos for ${job.clientName}`, 'info');
  }

  closeJobModal() {
    const modal = document.querySelector('#job-detail-modal');
    if (modal) {
      modal.classList.remove('modal--active');
      document.body.classList.remove('modal-open');
    }
  }

  closePhotoModal() {
    const modal = document.querySelector('#photo-viewer-modal');
    if (modal) {
      modal.classList.remove('modal--active');
      document.body.classList.remove('modal-open');
    }
  }

  updateBulkActions() {
    const deleteBtn = document.querySelector('.jobs__delete-selected');
    const syncBtn = document.querySelector('.jobs__sync-selected');
    const selectedCount = document.querySelector('.jobs__selected-count');

    const count = this.selectedPhotos.size;
    
    if (deleteBtn) deleteBtn.disabled = count === 0;
    if (syncBtn) syncBtn.disabled = count === 0;
    
    if (selectedCount) {
      selectedCount.textContent = count > 0 ? `${count} selected` : '';
    }
  }

  updateStats() {
    const totalJobs = this.jobs.length;
    const pendingJobs = this.jobs.filter(job => job.status === 'pending').length;
    const inProgressJobs = this.jobs.filter(job => job.status === 'in-progress').length;
    const completedJobs = this.jobs.filter(job => job.status === 'completed').length;
    const unsyncedJobs = this.jobs.filter(job => job.syncStatus === 'local').length;

    // Update stats in the UI
    const statsElements = {
      total: document.querySelector('[data-stat="total-jobs"]'),
      pending: document.querySelector('[data-stat="pending-jobs"]'),
      inProgress: document.querySelector('[data-stat="in-progress-jobs"]'),
      completed: document.querySelector('[data-stat="completed-jobs"]'),
      unsynced: document.querySelector('[data-stat="unsynced-jobs"]')
    };

    if (statsElements.total) statsElements.total.textContent = totalJobs;
    if (statsElements.pending) statsElements.pending.textContent = pendingJobs;
    if (statsElements.inProgress) statsElements.inProgress.textContent = inProgressJobs;
    if (statsElements.completed) statsElements.completed.textContent = completedJobs;
    if (statsElements.unsynced) statsElements.unsynced.textContent = unsyncedJobs;
  }

  updateLoadingState() {
    const loadingElements = document.querySelectorAll('.jobs__loading');
    loadingElements.forEach(element => {
      element.style.display = this.isLoading ? 'block' : 'none';
    });
  }

  setupMobileSync() {
    // Simulate mobile sync status
    const syncButton = document.querySelector('.jobs__sync-all');
    if (syncButton) {
      syncButton.addEventListener('click', () => this.syncAllJobs());
    }

    // Auto-sync check every 30 seconds
    setInterval(() => {
      if (!this.isLoading && this.jobs.some(job => job.syncStatus === 'local')) {
        this.checkAutoSync();
      }
    }, 30000);
  }

  syncAllJobs() {
    const unsyncedJobs = this.jobs.filter(job => job.syncStatus === 'local');
    if (unsyncedJobs.length === 0) {
      showToast('All jobs are already synced', 'info');
      return;
    }

    this.isLoading = true;
    this.updateLoadingState();

    setTimeout(() => {
      unsyncedJobs.forEach(job => {
        this.updateJob(job.id, {
          syncStatus: 'synced',
          syncedAt: new Date().toISOString()
        });
      });

      this.isLoading = false;
      this.updateLoadingState();
      
      showToast(`Synced ${unsyncedJobs.length} jobs`, 'success');
    }, 3000);
  }

  checkAutoSync() {
    // In a real application, this would check connectivity and sync preferences
    if (Math.random() > 0.7) { // Simulate auto-sync trigger
      this.syncAllJobs();
    }
  }

  handleKeyboardShortcuts(e) {
    // Only handle shortcuts when not in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }

    switch (e.key) {
      case 'n':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          const newJobBtn = document.querySelector('.jobs__add-job');
          if (newJobBtn) newJobBtn.click();
        }
        break;
      case 'a':
        if (e.ctrlKey || e.metaKey) {
          e.preventDefault();
          this.selectAllJobs();
        }
        break;
      case 'Delete':
        if (this.selectedPhotos.size > 0) {
          e.preventDefault();
          this.deleteSelectedJobs();
        }
        break;
      case 'Escape':
        this.closeJobModal();
        this.closePhotoModal();
        break;
    }
  }

  loadJobs() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.JOBS);
      return saved ? JSON.parse(saved) : this.getDefaultJobs();
    } catch (error) {
      console.error('Error loading jobs:', error);
      return this.getDefaultJobs();
    }
  }

  saveJobs() {
    try {
      localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(this.jobs));
    } catch (error) {
      console.error('Error saving jobs:', error);
      showToast('Failed to save jobs', 'error');
    }
  }

  getDefaultJobs() {
    return [
      {
        id: '1',
        clientName: 'John Smith',
        address: '123 Main St, Anytown, ST 12345',
        phone: '(555) 123-4567',
        email: 'john@email.com',
        serviceType: 'Property Inspection',
        priority: 'high',
        status: 'pending',
        notes: 'Follow up on foundation issues',
        createdAt: new Date(Date.now() - 86400000).toISOString(), // Yesterday
        photos: [],
        syncStatus: 'local'
      },
      {
        id: '2',
        clientName: 'Sarah Johnson',
        address: '456 Oak Ave, Another City, ST 67890',
        phone: '(555) 987-6543',
        email: 'sarah@email.com',
        serviceType: 'Damage Assessment',
        priority: 'medium',
        status: 'in-progress',
        notes: 'Water damage in basement',
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
        photos: ['photo1.jpg', 'photo2.jpg'],
        syncStatus: 'synced',
        syncedAt: new Date(Date.now() - 86400000).toISOString()
      }
    ];
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're on the jobs page
  if (document.querySelector('.jobs-page')) {
    new JobsManager();
  }
});

// Export for potential external use
export default JobsManager;