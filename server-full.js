const express = require('express');
const https = require('https');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Раздача Angular файлов
app.use(express.static(path.join(__dirname, 'dist/teacher-site-angular/browser')));

// Прокси для VK API
app.get('/api/vk-posts', (req, res) => {
    const url = 'https://api.vk.com/method/wall.get?' +
        'owner_id=-239620084' +
        '&count=20' +
        '&filter=all' +
        '&access_token=96f77e7296f77e7296f77e727495b6c4ba996f796f77e72fcc62ebbb990061b01f6dba5' +
        '&v=5.199';

    https.get(url, (vkRes) => {
        let data = '';
        vkRes.on('data', (chunk) => { data += chunk; });
        vkRes.on('end', () => {
            res.setHeader('Access-Control-Allow-Origin', '*');
            res.json(JSON.parse(data));
        });
    }).on('error', (err) => {
        res.json({ error: err.message });
    });
});

// Все остальные запросы - на Angular
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'dist/teacher-site-angular/browser/index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});