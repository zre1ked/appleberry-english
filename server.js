const express = require('express');
const https = require('https');

const app = express();
const PORT = 3000;

// Разрешаем CORS
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', '*');
    next();
});

// Прокси для VK API
app.get('/api/vk-posts', (req, res) => {
    const url = 'https://api.vk.com/method/wall.get?' +
        'owner_id=-239620084' +
        '&count=10' +
        '&filter=all' +
        '&access_token=96f77e7296f77e7296f77e727495b6c4ba996f796f77e72fcc62ebbb990061b01f6dba5' +
        '&v=5.199';

    https.get(url, (vkRes) => {
        let data = '';
        
        vkRes.on('data', (chunk) => {
            data += chunk;
        });
        
        vkRes.on('end', () => {
            res.json(JSON.parse(data));
        });
    }).on('error', (err) => {
        res.json({ error: err.message });
    });
});

app.listen(PORT, () => {
    console.log(`VK Proxy server running on http://localhost:${PORT}`);
});