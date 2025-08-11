// Secure Mileage Calculator with Google Maps Integration
const ORIGIN = "715 SANDHILL DR, DUDLEY, NC 28333";

let map, directionsService, directionsRenderer, geocoder, homeMarker;
let isGoogleMapsLoaded = false;

// Initialize Google Maps services when API loads
function initGoogleMaps() {
    console.log("🗺️ Initializing Google Maps services...");
    
    if (typeof google === 'undefined' || !google.maps) {
        console.error("Google Maps API failed to load");
        showToast("Maps service unavailable - distance calculation disabled", "error");
        return;
    }
    
    // Initialize services
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: false,
        polylineOptions: {
            strokeColor: "#4F46E5",
            strokeWeight: 4,
            strokeOpacity: 0.8
        }
    });
    geocoder = new google.maps.Geocoder();

    // Initialize map with dark theme
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: { lat: 35.1495, lng: -78.1394 }, // NC center
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{"color": "#1f2937"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.stroke",
                "stylers": [{"color": "#1f2937"}]
            },
            {
                "featureType": "all",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#e5e7eb"}]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{"color": "#374151"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#0f172a"}]
            }
        ]
    });

    directionsRenderer.setMap(map);

    // Initialize autocomplete for address fields
    try {
        const destinationAutocomplete = new google.maps.places.Autocomplete(
            document.getElementById("destination"), 
            { types: ["address"] }
        );
        
        const originAutocomplete = new google.maps.places.Autocomplete(
            document.getElementById("origin"), 
            { types: ["address"] }
        );
        
        isGoogleMapsLoaded = true;
        showToast("Google Maps loaded successfully", "success");
    } catch (error) {
        console.error("Error initializing autocomplete:", error);
        showToast("Address autocomplete unavailable", "warning");
    }
}

// Calculate distance using Google Maps Distance Matrix API
function calculateDistance() {
    console.log("🔍 Calculate Distance clicked!");
    
    if (!isGoogleMapsLoaded) {
        showToast("Google Maps is still loading, please wait...", "warning");
        return;
    }
    
    const origin = document.getElementById("origin").value || ORIGIN;
    const destination = document.getElementById("destination").value;
    
    if (!destination.trim()) {
        showToast("Please enter a destination address", "error");
        return;
    }

    const resultDiv = document.getElementById("billingResult");
    resultDiv.innerHTML = "🔄 Calculating distance...";

    const service = new google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
        {
            origins: [origin],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.IMPERIAL,
        },
        (response, status) => {
            if (status === "OK") {
                const element = response.rows[0].elements[0];
                
                if (element.status === "OK") {
                    const distance = element.distance.text;
                    const duration = element.duration.text;
                    const distanceValue = parseFloat(distance.replace(/[^0-9.]/g, ""));
                    
                    // Check trip type
                    const tripType = document.getElementById("trip-type").value;
                    const totalMiles = tripType === "round-trip" ? distanceValue * 2 : distanceValue;
                    
                    document.getElementById("totalMiles").value = totalMiles.toFixed(2);
                    
                    // Show route on map
                    showRouteOnMap(origin, destination);
                    
                    // Update result display
                    resultDiv.innerHTML = `✅ Distance calculated: ${totalMiles.toFixed(1)} miles (${duration} each way)`;
                    
                    showToast(`Distance calculated: ${totalMiles.toFixed(1)} miles`, "success");
                    
                    // Auto-calculate billing if firm is selected
                    const firm = document.getElementById("firm").value;
                    if (firm) {
                        setTimeout(() => calculateBilling(), 500);
                    }
                } else {
                    resultDiv.innerHTML = "❌ Could not calculate distance to this address";
                    showToast("Could not find route to destination", "error");
                }
            } else {
                console.error("Distance Matrix error:", status);
                resultDiv.innerHTML = "❌ Error calculating distance";
                showToast("Distance calculation failed: " + status, "error");
            }
        }
    );
}

// Show route on Google Maps
function showRouteOnMap(origin, destination) {
    if (!directionsService || !directionsRenderer) return;
    
    const request = {
        origin: origin,
        destination: destination,
        travelMode: google.maps.TravelMode.DRIVING,
    };

    directionsService.route(request, (result, status) => {
        if (status === "OK") {
            directionsRenderer.setDirections(result);
        } else {
            console.error("Directions error:", status);
        }
    });
}

// Calculate billing based on firm rates and free mileage
function calculateBilling() {
    console.log("💰 Calculate Billing clicked!");
    
    const firm = document.getElementById("firm").value;
    const miles = parseFloat(document.getElementById("totalMiles").value);
    
    if (!firm) {
        showToast("Please select a firm first", "warning");
        return;
    }
    
    if (isNaN(miles) || miles <= 0) {
        showToast("Please calculate distance first", "warning");
        return;
    }

    let freeMiles = 50;
    let rate = 0.6;
    
    // Firm rates and free mileage
    switch (firm) {
        case "FirmA": // AMA
            freeMiles = 50; 
            rate = 0.67; 
            break;
        case "FirmB": // A-TEAM
            freeMiles = 60; 
            rate = 0.55; 
            break;
        case "FirmC": // CLAIM SOLUTION
            freeMiles = 50; 
            rate = 0.63; 
            break;
        case "FirmD": // CCS
            freeMiles = 50; 
            rate = 0.65; 
            break;
        case "FirmE": // HEA
            freeMiles = 50; 
            rate = 0.60; 
            break;
        case "FirmF": // IAS
            freeMiles = 50; 
            rate = 0.65; 
            break;
        case "FirmG": // Sedgwick
            freeMiles = 60; 
            rate = 0.67; 
            break;
        default:
            freeMiles = 50; 
            rate = 0.60;
    }

    const billable = Math.max(0, miles - freeMiles);
    const cost = billable * rate;
    
    const resultText = `(${miles.toFixed(1)} RT - ${freeMiles} Free) = ${billable.toFixed(1)} mi × $${rate.toFixed(2)} = $${cost.toFixed(2)}`;
    
    document.getElementById("billingResult").innerHTML = `💰 ${resultText}`;
    
    showToast(`Billing calculated: $${cost.toFixed(2)}`, "success");
}

// Copy result to clipboard
function copyResult() {
    const result = document.getElementById("billingResult").textContent;
    
    if (!result || result.includes("Enter destination")) {
        showToast("Nothing to copy - calculate billing first", "warning");
        return;
    }

    navigator.clipboard.writeText(result.replace(/💰|🔄|✅|❌/g, '').trim())
        .then(() => {
            showToast("Result copied to clipboard!", "success");
        })
        .catch((err) => {
            console.error('Copy failed:', err);
            showToast("Copy failed - please select and copy manually", "error");
        });
}

// Save calculation to tax log
function saveToLog() {
    const firm = document.getElementById("firm").value;
    const miles = parseFloat(document.getElementById("totalMiles").value);
    const claimNumber = document.getElementById("claim-number").value;
    const origin = document.getElementById("origin").value;
    const destination = document.getElementById("destination").value;
    const billingResult = document.getElementById("billingResult").textContent;
    
    if (!firm || isNaN(miles) || !billingResult.includes('$')) {
        showToast("Please complete the calculation first", "warning");
        return;
    }
    
    // Extract cost from billing result
    const costMatch = billingResult.match(/\$(\d+\.\d+)/);
    const cost = costMatch ? parseFloat(costMatch[1]) : 0;
    
    // Create log entry
    const logEntry = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        claimNumber: claimNumber || 'N/A',
        route: `${origin.split(',')[0]} → ${destination.split(',')[0]}`,
        miles: miles.toFixed(1),
        amount: cost.toFixed(2),
        firm: firm,
        fullCalculation: billingResult.replace(/💰|🔄|✅|❌/g, '').trim()
    };
    
    // Get existing log entries
    const existingLog = getStorage('mileageLog', []);
    existingLog.unshift(logEntry); // Add to beginning
    
    // Keep only last 50 entries
    const trimmedLog = existingLog.slice(0, 50);
    setStorage('mileageLog', trimmedLog);
    
    // Update display
    updateTaxLogDisplay();
    updateTaxLogSummary();
    
    // Clear form
    document.getElementById('mileage-form').reset();
    document.getElementById('origin').value = ORIGIN;
    document.getElementById('billingResult').innerHTML = 'Enter destination and calculate distance first';
    
    // Clear map
    if (directionsRenderer) {
        directionsRenderer.setDirections({routes: []});
    }
    
    showToast("Entry saved to tax log!", "success");
}

// Update tax log display
function updateTaxLogDisplay() {
    const logEntries = getStorage('mileageLog', []);
    const tbody = document.getElementById('tax-log-tbody');
    
    if (logEntries.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" class="text-center text-muted">No entries yet</td></tr>';
        return;
    }
    
    tbody.innerHTML = logEntries.slice(0, 10).map((entry, index) => `
        <tr>
            <td>${entry.date}</td>
            <td>${entry.claimNumber}</td>
            <td>${entry.route}</td>
            <td>${entry.miles}</td>
            <td class="text-success">$${entry.amount}</td>
            <td>
                <button class="btn btn--ghost btn--sm" onclick="editLogEntry(${index})">Edit</button>
                <button class="btn btn--ghost btn--sm" onclick="deleteLogEntry(${index})">Delete</button>
            </td>
        </tr>
    `).join('');
}

// Update tax log summary
function updateTaxLogSummary() {
    const logEntries = getStorage('mileageLog', []);
    
    if (logEntries.length === 0) return;
    
    const totalMiles = logEntries.reduce((sum, entry) => sum + parseFloat(entry.miles), 0);
    const totalAmount = logEntries.reduce((sum, entry) => sum + parseFloat(entry.amount), 0);
    const avgTrip = totalMiles / logEntries.length;
    
    document.getElementById('total-miles-summary').textContent = totalMiles.toFixed(1);
    document.getElementById('total-amount-summary').textContent = '$' + totalAmount.toFixed(2);
    document.getElementById('avg-trip-summary').textContent = avgTrip.toFixed(1) + ' mi';
}

// Delete log entry
function deleteLogEntry(index) {
    if (confirm('Delete this mileage entry?')) {
        const logEntries = getStorage('mileageLog', []);
        logEntries.splice(index, 1);
        setStorage('mileageLog', logEntries);
        updateTaxLogDisplay();
        updateTaxLogSummary();
        showToast("Entry deleted", "success");
    }
}

// Edit log entry (placeholder for future enhancement)
function editLogEntry(index) {
    showToast("Edit functionality coming soon", "info");
}

// Initialize when Google Maps loads
window.initGoogleMaps = initGoogleMaps; // Global callback for Google Maps API

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    updateTaxLogDisplay();
    updateTaxLogSummary();
    
    // Check if Google Maps is already loaded
    if (typeof google !== 'undefined' && google.maps) {
        initGoogleMaps();
    }
});

// Export functions for HTML onclick handlers
window.calculateDistance = calculateDistance;
window.calculateBilling = calculateBilling;
window.copyResult = copyResult;
window.saveToLog = saveToLog;
window.deleteLogEntry = deleteLogEntry;
window.editLogEntry = editLogEntry;
