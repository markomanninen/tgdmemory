const express = require('express');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.DASHBOARD_PORT || 3030;

// Serve static dashboard files
app.use(express.static(__dirname));

// API endpoint for metrics (if we want to add server-side metrics)
app.get('/api/dashboard-metrics', (req, res) => {
    // This could include additional metrics that aren't available from the main app
    const metrics = {
        timestamp: new Date().toISOString(),
        dashboard_uptime: process.uptime(),
        node_version: process.version,
        platform: process.platform,
        memory_usage: process.memoryUsage()
    };
    
    res.json(metrics);
});

// Health check for the dashboard itself
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        service: 'monitoring-dashboard',
        timestamp: new Date().toISOString()
    });
});

app.listen(PORT, () => {
    console.log(`TGD Memory Monitoring Dashboard running on http://localhost:${PORT}`);
    console.log('Dashboard features:');
    console.log('- Real-time application monitoring');
    console.log('- Health status tracking');
    console.log('- Performance metrics visualization');
    console.log('- Activity logs');
});
