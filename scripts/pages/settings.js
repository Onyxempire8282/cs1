/**
 * Settings Page Controller
 * Handles comprehensive settings management with tabs, validation, and persistence
 */

import { showToast } from '../components/toast.js';
import { validateEmail, validatePhone, debounce } from '../utils/helpers.js';
import { STORAGE_KEYS } from '../utils/constants.js';

class SettingsManager {
  constructor() {
    this.settings = this.loadSettings();
    this.activeTab = 'general';
    this.unsavedChanges = false;
    this.init();
  }

  init() {
    this.bindEvents();
    this.initializeTabs();
    this.populateSettings();
    this.setupFormValidation();
    this.setupAutoSave();
  }

  bindEvents() {
    // Tab navigation
    const tabButtons = document.querySelectorAll('.settings__tab-btn');
    tabButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleTabClick(e));
    });

    // Form submissions
    const forms = document.querySelectorAll('.settings__form');
    forms.forEach(form => {
      form.addEventListener('submit', (e) => this.handleFormSubmit(e));
    });

    // Input change tracking
    const inputs = document.querySelectorAll('.settings__input, .settings__select, .settings__checkbox');
    inputs.forEach(input => {
      input.addEventListener('change', () => this.markUnsavedChanges());
      input.addEventListener('input', debounce(() => this.validateField(input), 300));
    });

    // Reset buttons
    const resetButtons = document.querySelectorAll('.settings__reset-btn');
    resetButtons.forEach(btn => {
      btn.addEventListener('click', (e) => this.handleReset(e));
    });

    // Import/Export
    const importBtn = document.querySelector('.settings__import-btn');
    const exportBtn = document.querySelector('.settings__export-btn');
    const importInput = document.querySelector('.settings__import-input');

    if (importBtn) {
      importBtn.addEventListener('click', () => importInput?.click());
    }
    if (importInput) {
      importInput.addEventListener('change', (e) => this.handleImport(e));
    }
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExport());
    }

    // Advanced features
    this.bindAdvancedFeatures();

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

    // Before unload warning
    window.addEventListener('beforeunload', (e) => {
      if (this.unsavedChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      }
    });
  }

  bindAdvancedFeatures() {
    // Theme switcher
    const themeSelect = document.querySelector('#theme-select');
    if (themeSelect) {
      themeSelect.addEventListener('change', (e) => this.handleThemeChange(e.target.value));
    }

    // Notification test
    const testNotificationBtn = document.querySelector('.settings__test-notification');
    if (testNotificationBtn) {
      testNotificationBtn.addEventListener('click', () => this.testNotification());
    }

    // Clear data buttons
    const clearDataBtn = document.querySelector('.settings__clear-data');
    const clearCacheBtn = document.querySelector('.settings__clear-cache');

    if (clearDataBtn) {
      clearDataBtn.addEventListener('click', () => this.clearAllData());
    }
    if (clearCacheBtn) {
      clearCacheBtn.addEventListener('click', () => this.clearCache());
    }

    // Backup features
    const backupBtn = document.querySelector('.settings__create-backup');
    const restoreBtn = document.querySelector('.settings__restore-backup');

    if (backupBtn) {
      backupBtn.addEventListener('click', () => this.createBackup());
    }
    if (restoreBtn) {
      restoreBtn.addEventListener('click', () => this.restoreBackup());
    }

    // API connection test
    const testConnectionBtn = document.querySelector('.settings__test-connection');
    if (testConnectionBtn) {
      testConnectionBtn.addEventListener('click', () => this.testApiConnection());
    }
  }

  handleTabClick(e) {
    e.preventDefault();
    const tabId = e.target.dataset.tab;
    if (tabId) {
      this.switchTab(tabId);
    }
  }

  switchTab(tabId) {
    // Remove active class from all tabs and panels
    document.querySelectorAll('.settings__tab-btn').forEach(btn => {
      btn.classList.remove('settings__tab-btn--active');
    });
    document.querySelectorAll('.settings__tab-panel').forEach(panel => {
      panel.classList.remove('settings__tab-panel--active');
    });

    // Add active class to selected tab and panel
    const activeTabBtn = document.querySelector(`[data-tab="${tabId}"]`);
    const activePanel = document.querySelector(`#${tabId}-tab`);

    if (activeTabBtn) activeTabBtn.classList.add('settings__tab-btn--active');
    if (activePanel) activePanel.classList.add('settings__tab-panel--active');

    this.activeTab = tabId;

    // Update URL hash without triggering navigation
    history.replaceState(null, null, `#${tabId}`);
  }

  initializeTabs() {
    // Check for hash in URL to determine initial tab
    const hash = window.location.hash.replace('#', '');
    const validTabs = ['general', 'account', 'notifications', 'integrations', 'advanced'];
    
    if (hash && validTabs.includes(hash)) {
      this.switchTab(hash);
    } else {
      this.switchTab('general');
    }
  }

  handleFormSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const formData = new FormData(form);
    const formType = form.dataset.form;

    if (!this.validateForm(form)) {
      showToast('Please fix the errors before saving', 'error');
      return;
    }

    this.saveFormData(formType, formData);
  }

  validateForm(form) {
    const inputs = form.querySelectorAll('.settings__input, .settings__select');
    let isValid = true;

    inputs.forEach(input => {
      if (!this.validateField(input)) {
        isValid = false;
      }
    });

    return isValid;
  }

  validateField(input) {
    const value = input.value.trim();
    const type = input.type;
    const required = input.hasAttribute('required');
    let isValid = true;
    let errorMessage = '';

    // Clear previous errors
    this.clearFieldError(input);

    // Required field validation
    if (required && !value) {
      isValid = false;
      errorMessage = 'This field is required';
    }
    // Email validation
    else if (type === 'email' && value && !validateEmail(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid email address';
    }
    // Phone validation
    else if (type === 'tel' && value && !validatePhone(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid phone number';
    }
    // URL validation
    else if (type === 'url' && value && !this.isValidUrl(value)) {
      isValid = false;
      errorMessage = 'Please enter a valid URL';
    }
    // Password strength validation
    else if (input.id === 'new-password' && value) {
      const strength = this.checkPasswordStrength(value);
      if (strength.score < 3) {
        isValid = false;
        errorMessage = strength.message;
      }
    }
    // Confirm password validation
    else if (input.id === 'confirm-password' && value) {
      const newPassword = document.querySelector('#new-password')?.value;
      if (value !== newPassword) {
        isValid = false;
        errorMessage = 'Passwords do not match';
      }
    }
    // API key validation
    else if (input.classList.contains('api-key-input') && value) {
      if (value.length < 10) {
        isValid = false;
        errorMessage = 'API key must be at least 10 characters';
      }
    }

    if (!isValid) {
      this.showFieldError(input, errorMessage);
    }

    return isValid;
  }

  showFieldError(input, message) {
    input.classList.add('settings__input--error');
    
    let errorElement = input.parentNode.querySelector('.settings__error');
    if (!errorElement) {
      errorElement = document.createElement('span');
      errorElement.className = 'settings__error';
      input.parentNode.appendChild(errorElement);
    }
    
    errorElement.textContent = message;
  }

  clearFieldError(input) {
    input.classList.remove('settings__input--error');
    const errorElement = input.parentNode.querySelector('.settings__error');
    if (errorElement) {
      errorElement.remove();
    }
  }

  checkPasswordStrength(password) {
    let score = 0;
    let message = '';

    if (password.length >= 8) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    switch (score) {
      case 0:
      case 1:
        message = 'Password is too weak';
        break;
      case 2:
        message = 'Password is weak';
        break;
      case 3:
        message = 'Password is fair';
        break;
      case 4:
        message = 'Password is good';
        break;
      case 5:
        message = 'Password is strong';
        break;
    }

    return { score, message };
  }

  isValidUrl(string) {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
  }

  saveFormData(formType, formData) {
    const updates = {};

    // Convert FormData to object
    for (let [key, value] of formData.entries()) {
      // Handle checkboxes
      if (value === 'on') {
        updates[key] = true;
      } else {
        updates[key] = value;
      }
    }

    // Handle unchecked checkboxes
    const form = document.querySelector(`[data-form="${formType}"]`);
    if (form) {
      const checkboxes = form.querySelectorAll('input[type="checkbox"]');
      checkboxes.forEach(checkbox => {
        if (!formData.has(checkbox.name)) {
          updates[checkbox.name] = false;
        }
      });
    }

    // Update settings
    this.updateSettings(formType, updates);
    
    showToast('Settings saved successfully', 'success');
    this.unsavedChanges = false;
    this.updateSaveButton();
  }

  updateSettings(section, updates) {
    if (!this.settings[section]) {
      this.settings[section] = {};
    }

    Object.assign(this.settings[section], updates);
    this.saveSettings();
  }

  populateSettings() {
    // General settings
    this.populateFormSection('general', {
      'company-name': 'company_name',
      'full-name': 'full_name',
      'email': 'email',
      'phone': 'phone',
      'address': 'address',
      'timezone': 'timezone',
      'date-format': 'date_format',
      'currency': 'currency'
    });

    // Account settings
    this.populateFormSection('account', {
      'username': 'username',
      'current-email': 'email',
      'two-factor': 'two_factor_enabled',
      'session-timeout': 'session_timeout'
    });

    // Notification settings
    this.populateFormSection('notifications', {
      'email-notifications': 'email_notifications',
      'push-notifications': 'push_notifications',
      'sms-notifications': 'sms_notifications',
      'job-updates': 'job_updates',
      'payment-alerts': 'payment_alerts',
      'system-maintenance': 'system_maintenance',
      'marketing-emails': 'marketing_emails'
    });

    // Integration settings
    this.populateFormSection('integrations', {
      'quickbooks-enabled': 'quickbooks_enabled',
      'quickbooks-api-key': 'quickbooks_api_key',
      'google-maps-key': 'google_maps_key',
      'dropbox-sync': 'dropbox_sync',
      'auto-sync-interval': 'auto_sync_interval',
      'backup-frequency': 'backup_frequency'
    });

    // Advanced settings
    this.populateFormSection('advanced', {
      'debug-mode': 'debug_mode',
      'beta-features': 'beta_features',
      'data-retention': 'data_retention',
      'export-format': 'export_format',
      'theme': 'theme'
    });
  }

  populateFormSection(section, fieldMapping) {
    const sectionData = this.settings[section] || {};

    Object.entries(fieldMapping).forEach(([fieldId, settingKey]) => {
      const element = document.getElementById(fieldId);
      if (!element) return;

      const value = sectionData[settingKey];
      
      if (element.type === 'checkbox') {
        element.checked = Boolean(value);
      } else if (element.tagName === 'SELECT') {
        element.value = value || element.options[0]?.value || '';
      } else {
        element.value = value || '';
      }
    });
  }

  setupFormValidation() {
    // Real-time validation for specific fields
    const emailInputs = document.querySelectorAll('input[type="email"]');
    const phoneInputs = document.querySelectorAll('input[type="tel"]');
    const passwordInputs = document.querySelectorAll('input[type="password"]');

    emailInputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
    });

    phoneInputs.forEach(input => {
      input.addEventListener('blur', () => this.validateField(input));
    });

    passwordInputs.forEach(input => {
      input.addEventListener('input', debounce(() => {
        this.validateField(input);
        this.updatePasswordStrength(input);
      }, 300));
    });
  }

  updatePasswordStrength(input) {
    if (input.id !== 'new-password') return;

    const strengthIndicator = document.querySelector('.password-strength');
    if (!strengthIndicator) return;

    const password = input.value;
    const strength = this.checkPasswordStrength(password);
    
    strengthIndicator.className = `password-strength password-strength--${strength.score}`;
    strengthIndicator.textContent = strength.message;
  }

  setupAutoSave() {
    // Auto-save every 30 seconds if there are unsaved changes
    setInterval(() => {
      if (this.unsavedChanges) {
        this.autoSave();
      }
    }, 30000);
  }

  autoSave() {
    const activeForm = document.querySelector(`#${this.activeTab}-tab .settings__form`);
    if (activeForm && this.validateForm(activeForm)) {
      const formData = new FormData(activeForm);
      const formType = activeForm.dataset.form;
      this.saveFormData(formType, formData);
      
      showToast('Settings auto-saved', 'info');
    }
  }

  markUnsavedChanges() {
    this.unsavedChanges = true;
    this.updateSaveButton();
  }

  updateSaveButton() {
    const saveButtons = document.querySelectorAll('.settings__save-btn');
    saveButtons.forEach(btn => {
      btn.disabled = !this.unsavedChanges;
      btn.textContent = this.unsavedChanges ? 'Save Changes' : 'Saved';
    });
  }

  handleReset(e) {
    const form = e.target.closest('.settings__form');
    if (!form) return;

    if (!confirm('Are you sure you want to reset this section to default values?')) {
      return;
    }

    const formType = form.dataset.form;
    this.resetFormSection(formType);
    
    showToast('Settings reset to default values', 'info');
  }

  resetFormSection(section) {
    const defaults = this.getDefaultSettings()[section] || {};
    this.settings[section] = { ...defaults };
    this.saveSettings();
    this.populateSettings();
    this.unsavedChanges = false;
    this.updateSaveButton();
  }

  handleThemeChange(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    this.updateSettings('advanced', { theme });
    showToast(`Theme changed to ${theme}`, 'success');
  }

  testNotification() {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification('Test Notification', {
          body: 'This is a test notification from your settings.',
          icon: '/favicon.ico'
        });
        showToast('Test notification sent', 'success');
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            this.testNotification();
          } else {
            showToast('Notification permission denied', 'warning');
          }
        });
      } else {
        showToast('Notifications are blocked in your browser', 'warning');
      }
    } else {
      showToast('Notifications are not supported in your browser', 'error');
    }
  }

  clearAllData() {
    if (!confirm('This will delete ALL your data including jobs, mileage logs, and settings. This action cannot be undone. Are you sure?')) {
      return;
    }

    if (!confirm('Last chance! This will permanently delete everything. Continue?')) {
      return;
    }

    // Clear all localStorage data
    Object.values(STORAGE_KEYS).forEach(key => {
      localStorage.removeItem(key);
    });

    // Reset settings to defaults
    this.settings = this.getDefaultSettings();
    this.saveSettings();
    this.populateSettings();

    showToast('All data has been cleared', 'info');
    
    // Optionally reload the page
    setTimeout(() => {
      if (confirm('Reload the page to complete the reset?')) {
        window.location.reload();
      }
    }, 2000);
  }

  clearCache() {
    // Clear various caches
    if ('caches' in window) {
      caches.keys().then(names => {
        names.forEach(name => {
          caches.delete(name);
        });
      });
    }

    // Clear session storage
    sessionStorage.clear();

    showToast('Cache cleared successfully', 'success');
  }

  createBackup() {
    const backupData = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      settings: this.settings,
      jobs: JSON.parse(localStorage.getItem(STORAGE_KEYS.JOBS) || '[]'),
      mileage: JSON.parse(localStorage.getItem(STORAGE_KEYS.MILEAGE_LOGS) || '[]')
    };

    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `appraiser-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Backup file downloaded', 'success');
  }

  restoreBackup() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const backupData = JSON.parse(e.target.result);
          
          if (!backupData.settings || !backupData.timestamp) {
            throw new Error('Invalid backup file format');
          }

          if (!confirm('This will replace all current data with the backup. Continue?')) {
            return;
          }

          // Restore data
          if (backupData.settings) {
            this.settings = backupData.settings;
            this.saveSettings();
          }
          
          if (backupData.jobs) {
            localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(backupData.jobs));
          }
          
          if (backupData.mileage) {
            localStorage.setItem(STORAGE_KEYS.MILEAGE_LOGS, JSON.stringify(backupData.mileage));
          }

          this.populateSettings();
          showToast('Backup restored successfully', 'success');
          
          setTimeout(() => {
            if (confirm('Reload the page to complete the restore?')) {
              window.location.reload();
            }
          }, 2000);

        } catch (error) {
          console.error('Backup restore error:', error);
          showToast('Failed to restore backup: Invalid file format', 'error');
        }
      };
      
      reader.readAsText(file);
    });

    input.click();
  }

  testApiConnection() {
    const apiEndpoint = document.getElementById('api-endpoint')?.value;
    const apiKey = document.getElementById('api-key')?.value;

    if (!apiEndpoint) {
      showToast('Please enter an API endpoint', 'warning');
      return;
    }

    const testBtn = document.querySelector('.settings__test-connection');
    if (testBtn) {
      testBtn.disabled = true;
      testBtn.textContent = 'Testing...';
    }

    // Simulate API test
    setTimeout(() => {
      const success = Math.random() > 0.3; // 70% success rate for demo
      
      if (success) {
        showToast('API connection successful', 'success');
      } else {
        showToast('API connection failed - check your credentials', 'error');
      }

      if (testBtn) {
        testBtn.disabled = false;
        testBtn.textContent = 'Test Connection';
      }
    }, 2000);
  }

  handleImport(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedSettings = JSON.parse(e.target.result);
        
        if (confirm('Import these settings? This will overwrite current settings.')) {
          Object.assign(this.settings, importedSettings);
          this.saveSettings();
          this.populateSettings();
          showToast('Settings imported successfully', 'success');
        }
      } catch (error) {
        showToast('Invalid settings file', 'error');
      }
    };
    
    reader.readAsText(file);
  }

  handleExport() {
    const blob = new Blob([JSON.stringify(this.settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `settings-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    showToast('Settings exported', 'success');
  }

  handleKeyboardShortcuts(e) {
    // Only handle shortcuts when not in input fields
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
      return;
    }

    // Tab navigation shortcuts
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          this.switchTab('general');
          break;
        case '2':
          e.preventDefault();
          this.switchTab('account');
          break;
        case '3':
          e.preventDefault();
          this.switchTab('notifications');
          break;
        case '4':
          e.preventDefault();
          this.switchTab('integrations');
          break;
        case '5':
          e.preventDefault();
          this.switchTab('advanced');
          break;
        case 's':
          e.preventDefault();
          this.saveCurrentTab();
          break;
      }
    }

    // Escape to close modals or cancel editing
    if (e.key === 'Escape') {
      const activeModal = document.querySelector('.modal--active');
      if (activeModal) {
        activeModal.classList.remove('modal--active');
        document.body.classList.remove('modal-open');
      }
    }
  }

  saveCurrentTab() {
    const activeForm = document.querySelector(`#${this.activeTab}-tab .settings__form`);
    if (activeForm) {
      const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
      activeForm.dispatchEvent(submitEvent);
    }
  }

  loadSettings() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const defaultSettings = this.getDefaultSettings();
      
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        // Merge with defaults to ensure all required keys exist
        return this.mergeWithDefaults(parsedSettings, defaultSettings);
      }
      
      return defaultSettings;
    } catch (error) {
      console.error('Error loading settings:', error);
      return this.getDefaultSettings();
    }
  }

  mergeWithDefaults(saved, defaults) {
    const merged = { ...defaults };
    
    Object.keys(defaults).forEach(section => {
      if (saved[section]) {
        merged[section] = { ...defaults[section], ...saved[section] };
      }
    });
    
    return merged;
  }

  saveSettings() {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings));
    } catch (error) {
      console.error('Error saving settings:', error);
      showToast('Failed to save settings', 'error');
    }
  }

  getDefaultSettings() {
    return {
      general: {
        company_name: '',
        full_name: '',
        email: '',
        phone: '',
        address: '',
        timezone: 'America/New_York',
        date_format: 'MM/DD/YYYY',
        currency: 'USD'
      },
      account: {
        username: '',
        email: '',
        two_factor_enabled: false,
        session_timeout: 60
      },
      notifications: {
        email_notifications: true,
        push_notifications: true,
        sms_notifications: false,
        job_updates: true,
        payment_alerts: true,
        system_maintenance: true,
        marketing_emails: false
      },
      integrations: {
        quickbooks_enabled: false,
        quickbooks_api_key: '',
        google_maps_key: '',
        dropbox_sync: false,
        auto_sync_interval: 30,
        backup_frequency: 'weekly'
      },
      advanced: {
        debug_mode: false,
        beta_features: false,
        data_retention: 365,
        export_format: 'csv',
        theme: 'dark'
      }
    };
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're on the settings page
  if (document.querySelector('.settings-page')) {
    new SettingsManager();
  }
});

// Export for potential external use
export default SettingsManager;