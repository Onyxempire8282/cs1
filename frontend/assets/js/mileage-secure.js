// Secure Mileage Calculator - No API Key Exposed
const ORIGIN = "715 SANDHILL DR, DUDLEY, NC 28333";

// Secure distance calculation using server proxy
async function calculateDistanceSecure() {
    console.log("🔍 Calculate Distance (Secure) clicked!");
    
    const origin = document.getElementById("origin").value || ORIGIN;
    const destination = document.getElementById("destination").value;
    
    if (!destination.trim()) {
        showToast("Please enter a destination address", "error");
        return;
    }

    const resultDiv = document.getElementById("billingResult");
    resultDiv.innerHTML = "🔄 Calculating distance...";

    try {
        // Call your server proxy instead of Google directly
        const response = await fetch(`/api/distance?origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}`);
        
        if (!response.ok) {
            throw new Error(`Server error: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.status === "OK" && data.rows[0].elements[0].status === "OK") {
            const element = data.rows[0].elements[0];
            const distance = element.distance.text;
            const duration = element.duration.text;
            const distanceValue = parseFloat(distance.replace(/[^0-9.]/g, ""));
            
            // Check trip type
            const tripType = document.getElementById("trip-type").value;
            const totalMiles = tripType === "round-trip" ? distanceValue * 2 : distanceValue;
            
            document.getElementById("totalMiles").value = totalMiles.toFixed(2);
            
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
        
    } catch (error) {
        console.error("Distance calculation error:", error);
        resultDiv.innerHTML = "❌ Error calculating distance";
        showToast("Distance calculation failed: " + error.message, "error");
    }
}

// Alternative: Client-side with restricted API key
async function calculateDistanceWithRestrictedKey() {
    console.log("🔍 Calculate Distance (Restricted Key) clicked!");
    
    // This approach uses a restricted API key that only works on your domains
    // Set up API key restrictions in Google Cloud Console:
    // 1. HTTP referrers restriction to your domains only
    // 2. API restrictions to only Distance Matrix API
    // 3. Quota limits to prevent abuse
    
    const origin = document.getElementById("origin").value || ORIGIN;
    const destination = document.getElementById("destination").value;
    
    if (!destination.trim()) {
        showToast("Please enter a destination address", "error");
        return;
    }

    const resultDiv = document.getElementById("billingResult");
    resultDiv.innerHTML = "🔄 Calculating distance...";

    // Load API key from environment variable (build-time replacement)
    const API_KEY = process.env.VITE_GOOGLE_MAPS_API_KEY || 'fallback-key-for-development';

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
                    
                    const tripType = document.getElementById("trip-type").value;
                    const totalMiles = tripType === "round-trip" ? distanceValue * 2 : distanceValue;
                    
                    document.getElementById("totalMiles").value = totalMiles.toFixed(2);
                    resultDiv.innerHTML = `✅ Distance calculated: ${totalMiles.toFixed(1)} miles (${duration} each way)`;
                    showToast(`Distance calculated: ${totalMiles.toFixed(1)} miles`, "success");
                    
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

// Calculate billing (unchanged - no API key needed)
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
    
    switch (firm) {
        case "FirmA": freeMiles = 50; rate = 0.67; break;
        case "FirmB": freeMiles = 60; rate = 0.55; break;
        case "FirmC": freeMiles = 50; rate = 0.63; break;
        case "FirmD": freeMiles = 50; rate = 0.65; break;
        case "FirmE": freeMiles = 50; rate = 0.60; break;
        case "FirmF": freeMiles = 50; rate = 0.65; break;
        case "FirmG": freeMiles = 60; rate = 0.67; break;
        default: freeMiles = 50; rate = 0.60;
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
        .then(() => showToast("Result copied to clipboard!", "success"))
        .catch((err) => {
            console.error('Copy failed:', err);
            showToast("Copy failed - please select and copy manually", "error");
        });
}

// Save to log (unchanged)
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
    
    const costMatch = billingResult.match(/\$(\d+\.\d+)/);
    const cost = costMatch ? parseFloat(costMatch[1]) : 0;
    
    const logEntry = {
        date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
        claimNumber: claimNumber || 'N/A',
        route: `${origin.split(',')[0]} → ${destination.split(',')[0]}`,
        miles: miles.toFixed(1),
        amount: cost.toFixed(2),
        firm: firm,
        fullCalculation: billingResult.replace(/💰|🔄|✅|❌/g, '').trim()
    };
    
    const existingLog = getStorage('mileageLog', []);
    existingLog.unshift(logEntry);
    const trimmedLog = existingLog.slice(0, 50);
    setStorage('mileageLog', trimmedLog);
    
    updateTaxLogDisplay();
    updateTaxLogSummary();
    
    document.getElementById('mileage-form').reset();
    document.getElementById('origin').value = ORIGIN;
    document.getElementById('billingResult').innerHTML = 'Enter destination and calculate distance first';
    
    showToast("Entry saved to tax log!", "success");
}

// Update displays (unchanged)
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

function editLogEntry(index) {
    showToast("Edit functionality coming soon", "info");
}

// Initialize on page load
window.onload = function() {
    updateTaxLogDisplay();
    updateTaxLogSummary();
    showToast("Mileage calculator loaded - using secure API access", "info");
};

// Export functions - choose your security approach:
// Option 1: Server proxy (most secure)
window.calculateDistance = calculateDistanceSecure;

// Option 2: Restricted client-side key (moderate security)
// window.calculateDistance = calculateDistanceWithRestrictedKey;

window.calculateBilling = calculateBilling;
window.copyResult = copyResult;
window.saveToLog = saveToLog;
window.deleteLogEntry = deleteLogEntry;
window.editLogEntry = editLogEntry;
