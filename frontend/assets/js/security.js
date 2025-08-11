// Additional security utilities
class APISecurityManager {
    constructor() {
        this.requestCount = 0;
        this.lastRequest = 0;
        this.maxRequestsPerMinute = 10;
    }
    
    // Rate limiting
    canMakeRequest() {
        const now = Date.now();
        const minuteAgo = now - 60000;
        
        if (this.lastRequest < minuteAgo) {
            this.requestCount = 0;
        }
        
        if (this.requestCount >= this.maxRequestsPerMinute) {
            showToast("Rate limit exceeded. Please wait a moment.", "warning");
            return false;
        }
        
        this.requestCount++;
        this.lastRequest = now;
        return true;
    }
    
    // Input validation
    validateAddress(address) {
        if (!address || address.trim().length < 5) {
            return { valid: false, error: "Address too short" };
        }
        
        // Basic validation patterns
        const dangerousPatterns = [
            /<script/i,
            /javascript:/i,
            /data:/i,
            /vbscript:/i
        ];
        
        for (const pattern of dangerousPatterns) {
            if (pattern.test(address)) {
                return { valid: false, error: "Invalid characters detected" };
            }
        }
        
        return { valid: true };
    }
    
    // Log security events
    logSecurityEvent(event, details = {}) {
        console.log(`🔐 Security Event: ${event}`, details);
        // In production, send to your logging service
    }
}

// Usage in your mileage calculator
const securityManager = new APISecurityManager();

// Wrap your distance calculation
function secureCalculateDistance() {
    if (!securityManager.canMakeRequest()) {
        return;
    }
    
    const destination = document.getElementById("destination").value;
    const validation = securityManager.validateAddress(destination);
    
    if (!validation.valid) {
        showToast("Invalid address: " + validation.error, "error");
        securityManager.logSecurityEvent("Invalid address attempt", { address: destination });
        return;
    }
    
    // Proceed with calculation...
    calculateDistanceSecure();
}
