// Server-side proxy endpoint (Node.js/Express example)
// This would run on your server, not client-side

const express = require('express');
const https = require('https');
const app = express();

// Store API key securely on server
const GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY;

// Proxy endpoint for distance calculation
app.get('/api/distance', (req, res) => {
    const { origin, destination } = req.query;
    
    // Validate inputs
    if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination required' });
    }
    
    // Rate limiting (implement as needed)
    // Authentication check (implement as needed)
    
    const url = `https://maps.googleapis.com/maps/api/distancematrix/json?` +
                `origins=${encodeURIComponent(origin)}` +
                `&destinations=${encodeURIComponent(destination)}` +
                `&units=imperial` +
                `&key=${GOOGLE_MAPS_API_KEY}`;
    
    https.get(url, (apiRes) => {
        let data = '';
        apiRes.on('data', chunk => data += chunk);
        apiRes.on('end', () => {
            try {
                const response = JSON.parse(data);
                res.json(response);
            } catch (error) {
                res.status(500).json({ error: 'Failed to parse API response' });
            }
        });
    }).on('error', (error) => {
        res.status(500).json({ error: 'API request failed' });
    });
});

app.listen(3000, () => {
    console.log('Proxy server running on port 3000');
});
