// Routes Map Integration
let routeMap, routeDirectionsService, routeDirectionsRenderer;
let routeMarkers = [];
let routePolylines = [];

// Initialize Google Maps for routes page
function initRouteMap() {
    console.log("🗺️ Initializing Route Map...");
    
    if (typeof google === 'undefined' || !google.maps) {
        console.error("Google Maps API failed to load");
        return;
    }
    
    // Initialize services
    routeDirectionsService = new google.maps.DirectionsService();
    routeDirectionsRenderer = new google.maps.DirectionsRenderer({
        suppressMarkers: true, // We'll add custom markers
        polylineOptions: {
            strokeColor: "#4F46E5",
            strokeWeight: 4,
            strokeOpacity: 0.8
        }
    });
    
    // Initialize map with professional styling
    routeMap = new google.maps.Map(document.getElementById("map"), {
        zoom: 10,
        center: { lat: 35.1495, lng: -78.1394 }, // North Carolina center
        styles: [
            {
                "featureType": "all",
                "elementType": "geometry",
                "stylers": [{"color": "#f5f5f5"}]
            },
            {
                "featureType": "road",
                "elementType": "geometry",
                "stylers": [{"color": "#ffffff"}]
            },
            {
                "featureType": "road",
                "elementType": "labels.text.fill",
                "stylers": [{"color": "#666666"}]
            },
            {
                "featureType": "water",
                "elementType": "geometry",
                "stylers": [{"color": "#ddeeff"}]
            },
            {
                "featureType": "poi",
                "elementType": "geometry",
                "stylers": [{"color": "#eeeeee"}]
            }
        ]
    });
    
    routeDirectionsRenderer.setMap(routeMap);
    
    // Add map controls event listeners
    const resetMapBtn = document.getElementById('reset-map-btn');
    const fullscreenMapBtn = document.getElementById('fullscreen-map-btn');
    
    if (resetMapBtn) {
        resetMapBtn.addEventListener('click', resetMapView);
    }
    
    if (fullscreenMapBtn) {
        fullscreenMapBtn.addEventListener('click', toggleFullscreenMap);
    }
    
    console.log("✅ Route Map initialized successfully");
}

// Display optimized route on map
function displayRouteOnMap(optimizedRoute) {
    if (!routeMap || !optimizedRoute) return;
    
    // Clear existing markers and polylines
    clearMapElements();
    
    // Add home marker (starting point)
    const homeMarker = new google.maps.Marker({
        position: { lat: 35.1495, lng: -78.1394 }, // Default home position
        map: routeMap,
        title: 'Home Base',
        icon: {
            url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="16" cy="16" r="14" fill="#22c55e" stroke="white" stroke-width="2"/>
                    <text x="16" y="20" font-family="Arial, sans-serif" font-size="14" font-weight="bold" text-anchor="middle" fill="white">H</text>
                </svg>
            `),
            scaledSize: new google.maps.Size(32, 32)
        }
    });
    
    routeMarkers.push(homeMarker);
    
    // Process each day's route
    optimizedRoute.days.forEach((day, dayIndex) => {
        const color = getRouteColor(dayIndex);
        
        day.forEach((stop, stopIndex) => {
            // Add stop marker
            const stopMarker = new google.maps.Marker({
                position: stop.coordinates || { lat: 35.1495 + (Math.random() - 0.5) * 0.1, lng: -78.1394 + (Math.random() - 0.5) * 0.1 },
                map: routeMap,
                title: `Day ${dayIndex + 1}, Stop ${stopIndex + 1}: ${stop.address}`,
                icon: {
                    url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                        <svg width="32" height="32" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="16" cy="16" r="14" fill="${color}" stroke="white" stroke-width="2"/>
                            <text x="16" y="20" font-family="Arial, sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="white">${stopIndex + 1}</text>
                        </svg>
                    `),
                    scaledSize: new google.maps.Size(32, 32)
                }
            });
            
            routeMarkers.push(stopMarker);
            
            // Add info window
            const infoWindow = new google.maps.InfoWindow({
                content: `
                    <div style="padding: 10px;">
                        <h4 style="margin: 0 0 5px 0; color: #333;">Day ${dayIndex + 1}, Stop ${stopIndex + 1}</h4>
                        <p style="margin: 0 0 3px 0; font-weight: bold;">${stop.address}</p>
                        ${stop.claimNumber ? `<p style="margin: 0 0 3px 0; color: #666;">Claim: ${stop.claimNumber}</p>` : ''}
                        <p style="margin: 0; color: ${color};">Distance: ${stop.distanceFromHome ? stop.distanceFromHome.toFixed(1) : 'N/A'} mi from home</p>
                    </div>
                `
            });
            
            stopMarker.addListener('click', () => {
                infoWindow.open(routeMap, stopMarker);
            });
        });
    });
    
    // Fit map bounds to show all markers
    if (routeMarkers.length > 0) {
        const bounds = new google.maps.LatLngBounds();
        routeMarkers.forEach(marker => {
            bounds.extend(marker.getPosition());
        });
        routeMap.fitBounds(bounds);
        
        // Ensure minimum zoom level
        google.maps.event.addListenerOnce(routeMap, 'bounds_changed', () => {
            if (routeMap.getZoom() > 15) {
                routeMap.setZoom(15);
            }
        });
    }
}

// Clear all map elements
function clearMapElements() {
    routeMarkers.forEach(marker => marker.setMap(null));
    routeMarkers = [];
    
    routePolylines.forEach(polyline => polyline.setMap(null));
    routePolylines = [];
}

// Get color for route day
function getRouteColor(dayIndex) {
    const colors = [
        '#4F46E5', // Blue
        '#EF4444', // Red
        '#10B981', // Green
        '#F59E0B', // Yellow
        '#8B5CF6', // Purple
        '#06B6D4', // Cyan
        '#F97316'  // Orange
    ];
    return colors[dayIndex % colors.length];
}

// Reset map view
function resetMapView() {
    if (!routeMap) return;
    
    routeMap.setCenter({ lat: 35.1495, lng: -78.1394 });
    routeMap.setZoom(10);
}

// Toggle fullscreen map
function toggleFullscreenMap() {
    const mapContainer = document.getElementById('map').parentElement.parentElement;
    
    if (mapContainer.classList.contains('fullscreen-map')) {
        mapContainer.classList.remove('fullscreen-map');
        document.body.style.overflow = '';
    } else {
        mapContainer.classList.add('fullscreen-map');
        document.body.style.overflow = 'hidden';
    }
    
    // Trigger map resize
    setTimeout(() => {
        google.maps.event.trigger(routeMap, 'resize');
    }, 100);
}

// Export functions for use in routes.js
window.initRouteMap = initRouteMap;
window.displayRouteOnMap = displayRouteOnMap;
window.clearMapElements = clearMapElements;
