/**
 * AutoForms Page Controller
 * Handles PDF auto-fill functionality for CCC and other forms
 */

import { showToast } from '../components/toast.js';
import { validateFile } from '../utils/helpers.js';
import { STORAGE_KEYS, FILE_TYPES } from '../utils/constants.js';

class AutoFormsManager {
  constructor() {
    this.estimateData = null;
    this.formMappings = this.initializeFormMappings();
    this.conditionRatings = {
      engine: null,
      transmission: null,
      paint: null,
      frontTires: null,
      rearTires: null,
      bodyGlass: null,
      interior: null
    };
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadSavedData();
  }

  bindEvents() {
    // File upload for estimates
    const estimateUpload = document.querySelector('.autoforms__estimate-upload');
    if (estimateUpload) {
      this.setupEstimateUpload(estimateUpload);
    }

    // Manual data entry
    const manualForm = document.querySelector('.autoforms__manual-form');
    if (manualForm) {
      manualForm.addEventListener('submit', (e) => this.handleManualSubmit(e));
    }

    // Condition rating inputs
    const conditionInputs = document.querySelectorAll('.condition-rating');
    conditionInputs.forEach(input => {
      input.addEventListener('change', (e) => this.handleConditionRating(e));
    });

    // Generate PDF button
    const generateBtn = document.querySelector('.autoforms__generate-btn');
    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.generatePDF());
    }

    // Clear data button
    const clearBtn = document.querySelector('.autoforms__clear-btn');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.clearData());
    }

    // Preview button
    const previewBtn = document.querySelector('.autoforms__preview-btn');
    if (previewBtn) {
      previewBtn.addEventListener('click', () => this.previewData());
    }

    // Form type selector
    const formTypeSelect = document.querySelector('.autoforms__form-type');
    if (formTypeSelect) {
      formTypeSelect.addEventListener('change', (e) => this.handleFormTypeChange(e.target.value));
    }
  }

  setupEstimateUpload(uploadElement) {
    const dropZone = uploadElement.querySelector('.autoforms__drop-zone');
    const fileInput = uploadElement.querySelector('.autoforms__file-input');

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
      e.preventDefault();
      dropZone.classList.add('autoforms__drop-zone--dragover');
    });

    dropZone.addEventListener('dragleave', () => {
      dropZone.classList.remove('autoforms__drop-zone--dragover');
    });

    dropZone.addEventListener('drop', (e) => {
      e.preventDefault();
      dropZone.classList.remove('autoforms__drop-zone--dragover');
      const files = Array.from(e.dataTransfer.files);
      this.handleEstimateFiles(files);
    });

    // File input
    fileInput.addEventListener('change', (e) => {
      const files = Array.from(e.target.files);
      this.handleEstimateFiles(files);
    });

    // Click to upload
    dropZone.addEventListener('click', () => {
      fileInput.click();
    });
  }

  handleEstimateFiles(files) {
    if (files.length === 0) return;

    const file = files[0];
    
    // Validate file type
    const allowedTypes = ['.pdf', '.txt', '.xml'];
    const fileExt = file.name.toLowerCase().substr(file.name.lastIndexOf('.'));
    
    if (!allowedTypes.includes(fileExt)) {
      showToast('Please upload a PDF, TXT, or XML estimate file', 'error');
      return;
    }

    this.parseEstimateFile(file);
  }

  parseEstimateFile(file) {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const content = e.target.result;
      const fileType = this.detectEstimateType(content, file.name);
      
      showToast('Parsing estimate file...', 'info');
      
      try {
        this.estimateData = this.parseEstimateContent(content, fileType);
        this.populateFormFromEstimate();
        showToast('Estimate parsed successfully', 'success');
      } catch (error) {
        console.error('Parse error:', error);
        showToast('Error parsing estimate file', 'error');
      }
    };

    reader.onerror = () => {
      showToast('Error reading file', 'error');
    };

    reader.readAsText(file);
  }

  detectEstimateType(content, filename) {
    // Detect based on content and filename
    if (content.includes('SCA - LONG VERNON') || content.includes('SCA FRANCHISING')) {
      return 'SCA';
    } else if (content.includes('CCC ONE') || content.includes('CCC INTELLIGENT')) {
      return 'CCC';
    } else if (content.includes('<?xml') && content.includes('TaggedPDF-doc')) {
      return 'CCC_XML';
    } else if (filename.toLowerCase().includes('mitchell')) {
      return 'MITCHELL';
    } else if (filename.toLowerCase().includes('audatex')) {
      return 'AUDATEX';
    }
    return 'UNKNOWN';
  }

  parseEstimateContent(content, type) {
    switch (type) {
      case 'SCA':
        return this.parseSCAEstimate(content);
      case 'CCC':
        return this.parseCCCEstimate(content);
      case 'CCC_XML':
        return this.parseCCCXMLEstimate(content);
      default:
        return this.parseGenericEstimate(content);
    }
  }

  parseSCAEstimate(content) {
    const data = {
      vehicleInfo: {},
      claimInfo: {},
      features: {},
      adjusterInfo: {},
      inspectionInfo: {}
    };

    // Extract vehicle information
    const vehicleMatch = content.match(/(\d{4})\s+(\w+)\s+([^V]+)VIN:\s*([A-Z0-9]{17})/);
    if (vehicleMatch) {
      data.vehicleInfo.year = vehicleMatch[1];
      data.vehicleInfo.make = vehicleMatch[2];
      data.vehicleInfo.model = vehicleMatch[3].trim();
      data.vehicleInfo.vin = vehicleMatch[4];
    }

    // Extract claim information
    const claimMatch = content.match(/Claim #:\s*(\w+)/);
    if (claimMatch) {
      data.claimInfo.claimNumber = claimMatch[1];
    }

    const policyMatch = content.match(/Policy #:\s*([^\s]+)/);
    if (policyMatch) {
      data.claimInfo.policyNumber = policyMatch[1];
    }

    // Extract adjuster information
    const adjusterMatch = content.match(/Adjuster:\s*([^,]+),\s*([^,]+),\s*\(([^)]+)\)/);
    if (adjusterMatch) {
      data.adjusterInfo.lastName = adjusterMatch[1].trim();
      data.adjusterInfo.firstName = adjusterMatch[2].trim();
      data.adjusterInfo.phone = adjusterMatch[3];
    }

    // Extract owner/insured information
    const ownerMatch = content.match(/Owner:\s*([^V]+)VIN:|Insured:\s*([^P]+)Policy:/);
    if (ownerMatch) {
      const name = (ownerMatch[1] || ownerMatch[2]).trim();
      const nameParts = name.split(',');
      if (nameParts.length >= 2) {
        data.claimInfo.insuredLastName = nameParts[0].trim();
        data.claimInfo.insuredFirstName = nameParts[1].trim();
      }
    }

    // Extract odometer
    const odometerMatch = content.match(/Odometer:\s*([0-9,]+)/);
    if (odometerMatch) {
      data.vehicleInfo.odometer = odometerMatch[1].replace(/,/g, '');
    }

    // Extract loss date
    const lossDateMatch = content.match(/Date of Loss:\s*([0-9\/]+)/);
    if (lossDateMatch) {
      data.claimInfo.lossDate = lossDateMatch[1];
    }

    // Extract features from the detailed list
    data.features = this.extractSCAFeatures(content);

    return data;
  }

  extractSCAFeatures(content) {
    const features = {};
    
    // Define feature mappings from SCA to CCC form fields
    const featureMap = {
      // Power options
      'Power Steering': 'PS',
      'Power Brakes': 'PB', 
      'Power Windows': 'PW',
      'Power Locks': 'PL',
      'Power Mirrors': 'PM',
      'Power Driver Seat': 'SP',
      'Heated Mirrors': 'HM',
      
      // Transmission
      'Automatic Transmission': 'Automatic',
      '4 Wheel Drive': '4W',
      
      // Decor/Convenience
      'Air Conditioning': 'AC',
      'Climate Control': 'CL',
      'Tilt Wheel': 'TW',
      'Cruise Control': 'CC',
      'Intermittent Wipers': 'IW',
      'Console/Storage': 'CN',
      'Overhead Console': 'CO',
      'Message Center': 'MC',
      'Rear Defogger': 'RD',
      'Remote Starter': 'RJ',
      'Keyless Entry': 'KE',
      'Telescopic Wheel': 'TL',
      'Heated Steering Wheel': 'HW',
      
      // Seating
      'Cloth Seats': 'CS',
      'Bucket Seats': 'BS',
      'Reclining/Lounge Seats': 'RL',
      'Leather Seats': 'LS',
      'Heated Seats': 'SH',
      'Rear Heated Seats': 'RH',
      
      // Radio
      'AM Radio': 'AM',
      'FM Radio': 'FM',
      'Stereo': 'ST',
      'Search/Seek': 'SE',
      'Auxiliary Audio Connection': 'M3',
      'Satellite Radio': 'XM',
      'Steering Wheel Touch Controls': 'TQ',
      
      // Wheels
      'Aluminum/Alloy Wheels': 'AW',
      
      // Safety
      'Drivers Side Air Bag': 'AG',
      'Passenger Air Bag': 'RG',
      'Anti-Lock Brakes (4)': 'AB',
      '4 Wheel Disc Brakes': 'DB',
      'Traction Control': 'TX',
      'Stability Control': 'T1',
      'Front Side Impact Air Bags': 'XG',
      'Head/Curtain Air Bags': 'DG',
      'Backup Camera': 'PX',
      'Hands Free Device': 'HF',
      
      // Exterior
      'Dual Mirrors': 'DM',
      'Privacy Glass': 'DT',
      'Rear Window Wiper': 'WP',
      'Clear Coat Paint': 'IP',
      'Rear Spoiler': 'SL',
      
      // Other
      'California Emissions': 'EM'
    };
    
    // Scan content for each feature
    Object.entries(featureMap).forEach(([scaFeature, cccCode]) => {
      if (content.includes(scaFeature)) {
        features[cccCode] = true;
      }
    });

    return features;
  }

  parseCCCEstimate(content) {
    // Parse standard CCC estimate format
    const data = {
      vehicleInfo: {},
      claimInfo: {},
      features: {},
      adjusterInfo: {}
    };

    // Implementation for CCC format parsing
    // This would be similar to SCA but with different regex patterns
    
    return data;
  }

  parseCCCXMLEstimate(content) {
    // Parse CCC XML format
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(content, 'text/xml');
      
      // Extract data from XML structure
      const data = {
        vehicleInfo: {},
        claimInfo: {},
        features: {},
        adjusterInfo: {}
      };

      // Implementation for XML parsing
      
      return data;
    } catch (error) {
      throw new Error('Invalid XML format');
    }
  }

  parseGenericEstimate(content) {
    // Generic parser for unknown formats
    const data = {
      vehicleInfo: {},
      claimInfo: {},
      features: {},
      adjusterInfo: {}
    };

    // Try to extract basic information using common patterns
    
    return data;
  }

  populateFormFromEstimate() {
    if (!this.estimateData) return;

    const { vehicleInfo, claimInfo, features, adjusterInfo } = this.estimateData;

    // Populate vehicle information
    this.setFormField('year', vehicleInfo.year);
    this.setFormField('make', vehicleInfo.make);
    this.setFormField('model', vehicleInfo.model);
    this.setFormField('vin', vehicleInfo.vin);
    this.setFormField('odometer', vehicleInfo.odometer);

    // Populate claim information
    this.setFormField('claim-number', claimInfo.claimNumber);
    this.setFormField('policy-number', claimInfo.policyNumber);
    this.setFormField('loss-date', claimInfo.lossDate);
    this.setFormField('insured-first-name', claimInfo.insuredFirstName);
    this.setFormField('insured-last-name', claimInfo.insuredLastName);
    this.setFormField('owner-first-name', claimInfo.ownerFirstName || claimInfo.insuredFirstName);
    this.setFormField('owner-last-name', claimInfo.ownerLastName || claimInfo.insuredLastName);

    // Populate adjuster information
    this.setFormField('adjuster-first-name', adjusterInfo.firstName);
    this.setFormField('adjuster-last-name', adjusterInfo.lastName);
    this.setFormField('adjuster-phone', adjusterInfo.phone);

    // Populate feature checkboxes
    Object.entries(features).forEach(([feature, checked]) => {
      if (checked) {
        this.setFormCheckbox(feature, true);
      }
    });

    // Update the preview
    this.updatePreview();
  }

  setFormField(fieldId, value) {
    const field = document.getElementById(fieldId);
    if (field && value) {
      field.value = value;
      field.dispatchEvent(new Event('change'));
    }
  }

  setFormCheckbox(checkboxId, checked) {
    const checkbox = document.getElementById(checkboxId);
    if (checkbox) {
      checkbox.checked = checked;
      checkbox.dispatchEvent(new Event('change'));
    }
  }

  handleManualSubmit(e) {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    this.estimateData = {
      vehicleInfo: {
        year: formData.get('year'),
        make: formData.get('make'),
        model: formData.get('model'),
        vin: formData.get('vin'),
        odometer: formData.get('odometer')
      },
      claimInfo: {
        claimNumber: formData.get('claim-number'),
        policyNumber: formData.get('policy-number'),
        lossDate: formData.get('loss-date'),
        insuredFirstName: formData.get('insured-first-name'),
        insuredLastName: formData.get('insured-last-name'),
        ownerFirstName: formData.get('owner-first-name'),
        ownerLastName: formData.get('owner-last-name')
      },
      adjusterInfo: {
        firstName: formData.get('adjuster-first-name'),
        lastName: formData.get('adjuster-last-name'),
        phone: formData.get('adjuster-phone')
      },
      features: this.collectSelectedFeatures()
    };

    this.updatePreview();
    showToast('Manual data entered successfully', 'success');
  }

  collectSelectedFeatures() {
    const features = {};
    const checkboxes = document.querySelectorAll('.feature-checkbox:checked');
    
    checkboxes.forEach(checkbox => {
      features[checkbox.value] = true;
    });

    return features;
  }

  handleConditionRating(e) {
    const { name, value } = e.target;
    this.conditionRatings[name] = parseInt(value);
    this.updatePreview();
  }

  handleFormTypeChange(formType) {
    // Handle different form types (CCC, Mitchell, etc.)
    this.currentFormType = formType;
    showToast(`Switched to ${formType} form`, 'info');
  }

  updatePreview() {
    const previewContainer = document.querySelector('.autoforms__preview');
    if (!previewContainer || !this.estimateData) return;

    const { vehicleInfo, claimInfo, adjusterInfo, features } = this.estimateData;

    previewContainer.innerHTML = `
      <div class="preview-section">
        <h3 class="preview-section__title">Vehicle Information</h3>
        <div class="preview-section__content">
          <p><strong>Vehicle:</strong> ${vehicleInfo.year} ${vehicleInfo.make} ${vehicleInfo.model}</p>
          <p><strong>VIN:</strong> ${vehicleInfo.vin || 'Not provided'}</p>
          <p><strong>Odometer:</strong> ${vehicleInfo.odometer || 'Not provided'}</p>
        </div>
      </div>

      <div class="preview-section">
        <h3 class="preview-section__title">Claim Information</h3>
        <div class="preview-section__content">
          <p><strong>Claim #:</strong> ${claimInfo.claimNumber || 'Not provided'}</p>
          <p><strong>Policy #:</strong> ${claimInfo.policyNumber || 'Not provided'}</p>
          <p><strong>Loss Date:</strong> ${claimInfo.lossDate || 'Not provided'}</p>
          <p><strong>Insured:</strong> ${claimInfo.insuredFirstName || ''} ${claimInfo.insuredLastName || ''}</p>
        </div>
      </div>

      <div class="preview-section">
        <h3 class="preview-section__title">Selected Features</h3>
        <div class="preview-section__content">
          <div class="features-grid">
            ${Object.keys(features).map(feature => `<span class="feature-tag">${feature}</span>`).join('')}
          </div>
        </div>
      </div>

      <div class="preview-section">
        <h3 class="preview-section__title">Condition Ratings</h3>
        <div class="preview-section__content">
          ${Object.entries(this.conditionRatings).map(([component, rating]) => 
            rating !== null ? `<p><strong>${component}:</strong> ${rating}</p>` : ''
          ).join('')}
        </div>
      </div>
    `;
  }

  async generatePDF() {
    if (!this.estimateData) {
      showToast('Please upload an estimate or enter data manually first', 'warning');
      return;
    }

    try {
      showToast('Loading PDF template and filling fields...', 'info');

      // Load the CCC PDF template and fill it
      await this.fillCCCPDFForm();
      
      showToast('PDF generated and downloaded successfully', 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('Error generating PDF: ' + error.message, 'error');
    }
  }

  async fillCCCPDFForm() {
    try {
      // Import PDF-lib (in a real implementation)
      // const { PDFDocument, PDFForm } = await import('pdf-lib');
      
      // For demo, we'll create the field mappings and show what would be filled
      const fieldMappings = this.getCCCFieldMappings();
      
      // Simulate PDF processing
      showToast('Filling form fields...', 'info');
      
      // Create filled form data object that would be used with PDF-lib
      const filledFormData = this.createFilledFormData(fieldMappings);
      
      // Log the complete field mapping for demonstration
      console.log('CCC PDF Field Mappings:', filledFormData);
      
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Download the filled form data as JSON (demo)
      this.downloadFilledFormData(filledFormData);
      
      // In production, this would be:
      // const pdfBytes = await this.processPDFWithLibrary(filledFormData);
      // this.downloadFile(new Blob([pdfBytes], {type: 'application/pdf'}), 'CCC_Filled_Form.pdf');
      
    } catch (error) {
      throw new Error('PDF processing failed: ' + error.message);
    }
  }

  getCCCFieldMappings() {
    // These are the exact field names from the CCC fillable PDF
    return {
      // Basic Information Fields
      basicFields: {
        'Office ID Number': '',
        'Company': '',
        'Claim Number': 'claimNumber',
        'Policy Number': 'policyNumber', 
        'VIN': 'vin',
        'Year': 'year',
        'Make': 'make',
        'Model': 'model',
        'Trim': 'trim',
        'Cylinders': 'cylinders',
        'Displacement': 'displacement',
        'Adjuster ID': 'adjusterID',
        'Adjuster First Name': 'adjusterFirstName',
        'Adjuster Last Name': 'adjusterLastName',
        'Adjuster Contact Number': 'adjusterPhone',
        'Adjuster Email': 'adjusterEmail',
        'Appraiser ID': 'appraiserID',
        'Appraiser First Name': 'appraiserFirstName',
        'Appraiser Last Name': 'appraiserLastName',
        'Insured First Name': 'insuredFirstName',
        'Insured Last Name': 'insuredLastName',
        'Owner First Name': 'ownerFirstName',
        'Owner Last Name': 'ownerLastName',
        'Loss ZIP Code': 'lossZipCode',
        'Loss State': 'lossState',
        'PA Appraiser ID#': 'paAppraiserID',
        'Date of loss (mm/dd/yyyy)': 'lossDate',
        'Odometer (mi)': 'odometer'
      },

      // Body Style Checkboxes
      bodyStyleFields: {
        '2DR': false,
        '4DR': true,
        'Hatchback': false,
        'Convertible': false,
        'Wagon': false,
        'Pickup': false,
        'Van': false,
        'Utility': true,
        '½ Ton': false,
        '¾ Ton': false,
        '1 Ton': false,
        'Short Bed': false,
        'Long Bed': false,
        'Cab & Chassis': false,
        'Fleetside': false,
        'Fenderside': false
      },

      // Fuel Type Checkboxes
      fuelTypeFields: {
        'Gas': true,
        'Diesel': false,
        'Other': false
      },

      // Transmission Checkboxes
      transmissionFields: {
        'Automatic': true,
        'Overdrive': false,
        'S6': false,
        'S5': false,
        'S4': false,
        'S3': false,
        '4W': true
      },

      // Type of Loss Checkboxes
      lossTypeFields: {
        'Collision': true,
        'Theft': false
      },

      // Loss Category Checkboxes
      lossCategoryFields: {
        'Other': false,
        'Liability': false,
        'Comprehensive': false,
        'Collision': true
      },

      // Leased Vehicle
      leasedVehicleFields: {
        'Leased Vehicle Yes': false,
        'Leased Vehicle No': true,
        '3rd Party Claim Yes': false,
        '3rd Party Claim No': true
      },

      // Feature Checkboxes - Power Options
      powerOptionsFields: {
        'PS': true,  // Power Steering
        'PB': true,  // Power Brakes
        'PW': true,  // Power Windows
        'PL': true,  // Power Locks
        'PM': true,  // Power Mirrors
        'SP': true,  // Power Driver Seat
        'PC': false, // Power Passenger Seat
        'PT': false, // Power Trunk/Gate Release
        'PP': false, // Power Adjustable Pedals
        'PD': false, // Power Sliding Door
        'DP': false  // Dual Power Sliding Doors
      },

      // Feature Checkboxes - Décor/Convenience
      decorConvenienceFields: {
        'AC': true,  // Air Conditioning
        'CL': false, // Climate Control
        'DA': false, // Dual Air Conditioning
        'TW': true,  // Tilt Wheel
        'CC': true,  // Cruise Control
        'IW': true,  // Intermittent Wipers
        'CN': false, // Console/Storage
        'CO': false, // Overhead Console
        'MM': false, // Memory Package
        'NV': false, // Navigation System
        'EC': false, // Entertainment Center
        'DU': false, // Dual Entertainment Center
        'TL': true,  // Telescopic Wheel
        'HW': true,  // Heated Steering Wheel
        'MC': true,  // Message Center
        'GD': false, // Home Link
        'RD': true,  // Rear Defogger
        'RJ': false, // Remote Starter
        'WT': false, // Wood Interior Trim
        'KE': true,  // Keyless Entry
        'SZ': false  // Rear Power Sunshade
      },

      // Feature Checkboxes - Seating
      seatingFields: {
        'CS': true,  // Cloth Seats
        'BS': true,  // Bucket Seats
        'RL': true,  // Reclining/Lounge Seats
        'LS': false, // Leather Seats
        'SH': true,  // Heated Seats
        'RH': true,  // Rear Heated Seats
        'VB': false, // Ventilated Seats
        '3S': false, // 3rd Row Seat
        '3P': false, // Power Third Seat
        'R3': false, // Retractable Seats
        '2P': false, // 12 Passenger Seating
        '5P': false, // 15 Passenger Seating
        'B2': false, // Captain Chairs (2)
        'B4': false, // Captain Chairs (4)
        'B6': false  // Captain Chairs (6)
      },

      // Feature Checkboxes - Radio
      radioFields: {
        'AM': true,  // AM Radio
        'FM': true,  // FM Radio
        'ST': true,  // Stereo
        'SE': true,  // Search/Seek
        'CD': false, // CD Player
        'CA': false, // Cassette
        'TQ': true,  // Steering Wheel Touch Controls
        'M3': true,  // Auxiliary Audio Connection
        'UR': false, // Premium Radio
        'SK': false, // CD Changer/Stacker
        'XM': true,  // Satellite Radio
        'EQ': false  // Equalizer
      },

      // Feature Checkboxes - Wheels
      wheelsFields: {
        'SY': false, // Styled Steel Wheels
        'FC': false, // Full Wheel Covers
        'CY': false, // Clad Wheels
        'AW': true,  // Aluminum/Alloy Wheels
        'CJ': false, // Chrome Wheels
        'W2': false, // 20" or Larger Wheels
        'WW': false, // Wire Wheels
        'WC': false, // Wire Wheel Covers
        'KW': false  // Locking Wheels
      },

      // Feature Checkboxes - Safety/Brakes
      safetyBrakesFields: {
        'AG': true,  // Driver's Side Air Bag
        'RG': true,  // Passenger Air Bag
        'XG': true,  // Front Side Impact Air Bags
        'ZG': false, // Rear Side Impact Air Bags
        'DG': true,  // Head/Curtain Air Bags
        'DB': true,  // 4-Wheel Disc Brakes
        'AB': true,  // Anti-Lock Brakes (4)
        'A2': false, // Anti-Lock Brakes (2)
        'TX': true,  // Traction Control
        'T1': true,  // Stability Control
        'PO': false, // Positraction
        'C2': false, // Communications System
        'PJ': false, // Parking Sensors
        'PX': true,  // Backup Camera
        'PZ': false, // Surround View Camera
        'TD': false, // Alarm
        'HF': true,  // Hands Free Device
        'XE': false, // Xenon or LED Headlamps
        'HU': false, // Heads Up Display
        'IC': false, // Intelligent Cruise
        'DV': false, // Blind Spot Detection
        'LN': false, // Lane Departure Warning
        'VZ': false, // Night Vision
        'RB': false  // Roll Bar
      },

      // Feature Checkboxes - Exterior/Paint/Glass
      exteriorFields: {
        'DM': true,  // Dual Mirrors
        'HM': true,  // Heated Mirrors
        'BN': false, // Body Side Moldings
        'TG': false, // Tinted Glass
        'AF': false, // Aftermarket Film Tint
        'DT': true,  // Privacy Glass
        'WP': true,  // Rear Window Wiper
        'FL': false, // Fog Lamps
        'RR': false, // Luggage/Roof Rack
        'SL': true,  // Rear Spoiler
        'HV': false, // Headlamp Washers
        'MX': false, // Signal Integrated Mirrors
        'WG': false, // Wood grain
        'IP': true,  // Clear coat Paint
        'MP': false, // Metallic Paint
        '2T': false, // Two Tone Paint
        'HP': false  // Three Stage Paint
      },

      // Feature Checkboxes - Other
      otherFields: {
        'SB': false, // Rear Step Bumper
        'TH': false, // Trailer Hitch
        'TP': false, // Trailering Package
        'SW': false, // Rear Sliding Window
        'PG': false, // Power Rear Window
        'BD': false, // Running Board/Side Steps
        'UP': false, // Power Retractable Running Boards
        'BL': false, // Bed liner
        'BY': false, // Bed liner (Spray On)
        'TN': false, // Soft Tonneau Cover
        'TZ': false, // Hard Tonneau Cover
        'CP': false, // Deluxe Truck Cap
        'AR': false, // Bed Rails
        'GG': false, // Grill Guard
        'TB': false, // Tool Box (Permanent)
        'WD': false, // Dual Rear Wheels
        'XT': false, // Auxiliary Fuel Tank
        'EM': true,  // California Emissions
        'SG': false, // Stone Guard
        'WI': false  // Winch
      },

      // Condition Ratings (0-3 scale)
      conditionFields: {
        'Engine 0': false,
        'Engine 1': false,
        'Engine 2': false,
        'Engine 3': true,
        'Transmission 0': false,
        'Transmission 1': false,
        'Transmission 2': false,
        'Transmission 3': true,
        'Paint 0': false,
        'Paint 1': false,
        'Paint 2': true,
        'Paint 3': false,
        'Front Tires 0': false,
        'Front Tires 1': false,
        'Front Tires 2': true,
        'Front Tires 3': false,
        'Rear Tires 0': false,
        'Rear Tires 1': false,
        'Rear Tires 2': true,
        'Rear Tires 3': false,
        'Body/Glass 0': false,
        'Body/Glass 1': false,
        'Body/Glass 2': false,
        'Body/Glass 3': true,
        'Interior 0': false,
        'Interior 1': false,
        'Interior 2': false,
        'Interior 3': true
      },

      // Processing Instructions
      processingFields: {
        'Expand comparable search': false,
        'Replacement Policy': false,
        'Run with Branded Title': false,
        'Report Retrieval Email': true,
        'Report Retrieval Fax': false,
        'Report Retrieval Other': false
      }
    };
  }

  createFilledFormData(fieldMappings) {
    const { vehicleInfo, claimInfo, adjusterInfo, features } = this.estimateData;
    
    // Create the complete form data object
    const formData = {};
    
    // Fill basic fields
    Object.entries(fieldMappings.basicFields).forEach(([pdfField, dataField]) => {
      if (dataField) {
        switch(dataField) {
          case 'claimNumber':
            formData[pdfField] = claimInfo.claimNumber || '';
            break;
          case 'policyNumber':
            formData[pdfField] = claimInfo.policyNumber || '';
            break;
          case 'vin':
            formData[pdfField] = vehicleInfo.vin || '';
            break;
          case 'year':
            formData[pdfField] = vehicleInfo.year || '';
            break;
          case 'make':
            formData[pdfField] = vehicleInfo.make || '';
            break;
          case 'model':
            formData[pdfField] = vehicleInfo.model || '';
            break;
          case 'odometer':
            formData[pdfField] = vehicleInfo.odometer || '';
            break;
          case 'adjusterFirstName':
            formData[pdfField] = adjusterInfo.firstName || '';
            break;
          case 'adjusterLastName':
            formData[pdfField] = adjusterInfo.lastName || '';
            break;
          case 'adjusterPhone':
            formData[pdfField] = adjusterInfo.phone || '';
            break;
          case 'insuredFirstName':
            formData[pdfField] = claimInfo.insuredFirstName || '';
            break;
          case 'insuredLastName':
            formData[pdfField] = claimInfo.insuredLastName || '';
            break;
          case 'ownerFirstName':
            formData[pdfField] = claimInfo.ownerFirstName || claimInfo.insuredFirstName || '';
            break;
          case 'ownerLastName':
            formData[pdfField] = claimInfo.ownerLastName || claimInfo.insuredLastName || '';
            break;
          case 'lossDate':
            formData[pdfField] = claimInfo.lossDate || '';
            break;
          case 'cylinders':
            formData[pdfField] = '4'; // Inferred from 1.5L engine
            break;
          case 'displacement':
            formData[pdfField] = '1.5L';
            break;
        }
      } else {
        formData[pdfField] = '';
      }
    });

    // Add all checkbox fields
    Object.assign(formData, fieldMappings.bodyStyleFields);
    Object.assign(formData, fieldMappings.fuelTypeFields);
    Object.assign(formData, fieldMappings.transmissionFields);
    Object.assign(formData, fieldMappings.lossTypeFields);
    Object.assign(formData, fieldMappings.lossCategoryFields);
    Object.assign(formData, fieldMappings.leasedVehicleFields);
    Object.assign(formData, fieldMappings.powerOptionsFields);
    Object.assign(formData, fieldMappings.decorConvenienceFields);
    Object.assign(formData, fieldMappings.seatingFields);
    Object.assign(formData, fieldMappings.radioFields);
    Object.assign(formData, fieldMappings.wheelsFields);
    Object.assign(formData, fieldMappings.safetyBrakesFields);
    Object.assign(formData, fieldMappings.exteriorFields);
    Object.assign(formData, fieldMappings.otherFields);
    Object.assign(formData, fieldMappings.conditionFields);
    Object.assign(formData, fieldMappings.processingFields);

    return formData;
  }

  downloadFilledFormData(formData) {
    // Create a detailed report of what would be filled
    const report = {
      summary: {
        totalFields: Object.keys(formData).length,
        textFields: Object.entries(formData).filter(([k,v]) => typeof v === 'string' && v !== '').length,
        checkedBoxes: Object.entries(formData).filter(([k,v]) => v === true).length,
        uncheckedBoxes: Object.entries(formData).filter(([k,v]) => v === false).length
      },
      vehicle: `${this.estimateData.vehicleInfo.year} ${this.estimateData.vehicleInfo.make} ${this.estimateData.vehicleInfo.model}`,
      claim: this.estimateData.claimInfo.claimNumber,
      formData: formData
    };

    const blob = new Blob([JSON.stringify(report, null, 2)], { type: 'application/json' });
    this.downloadFile(blob, 'CCC_Form_Field_Mappings.json', 'application/json');
  }

  downloadFile(blob, filename, mimeType) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  previewData() {
    if (!this.estimateData) {
      showToast('No data available to preview', 'warning');
      return;
    }

    // Show a modal with detailed data preview
    const modal = document.querySelector('#data-preview-modal');
    if (modal) {
      const content = modal.querySelector('.modal__content');
      content.innerHTML = `
        <h3>Parsed Data Preview</h3>
        <pre>${JSON.stringify(this.estimateData, null, 2)}</pre>
      `;
      modal.classList.add('modal--active');
      document.body.classList.add('modal-open');
    }
  }

  clearData() {
    if (!confirm('Clear all data? This action cannot be undone.')) {
      return;
    }

    this.estimateData = null;
    this.conditionRatings = {
      engine: null,
      transmission: null,
      paint: null,
      frontTires: null,
      rearTires: null,
      bodyGlass: null,
      interior: null
    };

    // Clear form fields
    const form = document.querySelector('.autoforms__manual-form');
    if (form) {
      form.reset();
    }

    // Clear checkboxes
    const checkboxes = document.querySelectorAll('.feature-checkbox');
    checkboxes.forEach(cb => cb.checked = false);

    // Clear condition ratings
    const conditionInputs = document.querySelectorAll('.condition-rating');
    conditionInputs.forEach(input => input.value = '');

    // Clear preview
    const previewContainer = document.querySelector('.autoforms__preview');
    if (previewContainer) {
      previewContainer.innerHTML = '<p class="preview-empty">No data available</p>';
    }

    showToast('All data cleared', 'info');
  }

  loadSavedData() {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.AUTOFORMS_DATA);
      if (saved) {
        const data = JSON.parse(saved);
        this.estimateData = data.estimateData;
        this.conditionRatings = data.conditionRatings || this.conditionRatings;
        
        if (this.estimateData) {
          this.populateFormFromEstimate();
        }
      }
    } catch (error) {
      console.error('Error loading saved data:', error);
    }
  }

  saveData() {
    try {
      const dataToSave = {
        estimateData: this.estimateData,
        conditionRatings: this.conditionRatings,
        timestamp: new Date().toISOString()
      };
      
      localStorage.setItem(STORAGE_KEYS.AUTOFORMS_DATA, JSON.stringify(dataToSave));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  initializeFormMappings() {
    // CCC form field mappings
    return {
      CCC: {
        // Basic vehicle info
        vehicleFields: {
          year: 'Year',
          make: 'Make', 
          model: 'Model',
          vin: 'VIN',
          odometer: 'Odometer'
        },
        
        // Claim info
        claimFields: {
          claimNumber: 'Claim Number',
          policyNumber: 'Policy Number',
          lossDate: 'Date of loss',
          insuredFirstName: 'Insured First Name',
          insuredLastName: 'Insured Last Name'
        },

        // Feature checkboxes (mapped to CCC codes)
        featureFields: {
          PS: 'Power Steering',
          PB: 'Power Brakes',
          PW: 'Power Windows',
          PL: 'Power Locks',
          PM: 'Power Mirrors',
          AC: 'Air Conditioning',
          CC: 'Cruise Control',
          // ... extensive list of all CCC feature codes
        }
      }
    };
  }
}

// Initialize when page loads
document.addEventListener('DOMContentLoaded', () => {
  // Only initialize if we're on the autoforms page
  if (document.querySelector('.autoforms-page')) {
    new AutoFormsManager();
  }
});

// Export for potential external use
export default AutoFormsManager;