# 🧪 Mileage Calculator Testing Instructions

## Quick Test (No Server Required)

**Step 1:** Open the diagnostic file directly in your browser
- Navigate to: `c:\Users\vlong\Projects\cs1\frontend\diagnostic-test.html`
- Double-click to open in your default browser
- OR drag and drop the file into a browser window

**Step 2:** Check the diagnostic results
- Look at the "System Diagnostic" section
- All items should show green "Good" or "Ready" status
- If you see red errors, that tells us what's broken

**Step 3:** Test the calculator
- Select "Sedgwick" as the firm
- Enter a destination like "Raleigh, NC" or "123 Main St, Cary, NC"  
- Click "🗺️ Test Distance Calculation"
- Should show distance and billing automatically

## Advanced Test (With Local Server)

If the direct file approach doesn't work due to browser security, use the local server:

**Step 1:** Open PowerShell in the frontend directory
```powershell
cd c:\Users\vlong\Projects\cs1\frontend
```

**Step 2:** Install Node.js (if not installed)
- Download from: https://nodejs.org
- Choose the LTS version

**Step 3:** Start the test server
```powershell
node test-server.js
```

**Step 4:** Open browser to
```
http://localhost:3000
```

## What To Look For ✅

### ✅ **Success Indicators:**
- System Diagnostic shows all green checkmarks
- Map displays with your location centered
- Distance calculation returns actual mileage
- Billing calculation shows correct dollar amount
- Console log shows "Google Maps API loaded successfully"

### ❌ **Error Indicators:**
- Red error messages in diagnostic section  
- "Invalid API key" or "403 Forbidden" errors
- Map shows gray area with error message
- Console shows errors about missing services

## Common Issues & Fixes 🔧

### **Issue: "Invalid API key"**
**Solution:** Check Google Cloud Console API key restrictions
- Make sure "HTTP referrers" allows `localhost:*`
- Ensure APIs are enabled: Maps JavaScript API, Distance Matrix API, Places API

### **Issue: "Quota exceeded"** 
**Solution:** Check your Google Cloud Console quotas
- You may have hit daily/monthly limits
- Reset quotas or increase limits

### **Issue: "Network error"**
**Solution:** Check internet connection and firewall
- Make sure browser can reach Google servers
- Try disabling ad blockers temporarily

### **Issue: Map doesn't load**
**Solution:** Browser security settings
- Make sure JavaScript is enabled
- Try a different browser (Chrome recommended)
- Check for HTTPS requirements

## Expected Results 📊

**For a trip from Dudley, NC to Raleigh, NC:**
- Distance: ~85-90 miles round trip
- Sedgwick billing: ~$15-20 (after 60 free miles)
- Travel time: ~1.5 hours each way

**Console Output Should Show:**
```
[SUCCESS] Google Maps API loaded successfully  
[SUCCESS] Distance calculated: 87.2 miles
[SUCCESS] Billing calculated: $18.36 for 87.2 miles
[SUCCESS] Route displayed on map
```

---

## 📞 Troubleshooting Help

If you get different results than expected, check the "Console Log" section in the diagnostic page - it will show exactly what's failing and why.

Common fixes:
1. **Clear browser cache** and try again
2. **Try incognito/private mode** to avoid extensions
3. **Check Google Cloud Console** for API restrictions
4. **Verify API key** hasn't been regenerated/changed
