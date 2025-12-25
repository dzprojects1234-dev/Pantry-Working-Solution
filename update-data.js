// update-data.js - Run this on your computer or in GitHub Codespaces
const fs = require('fs');
const https = require('https');

// === CONFIGURE THESE ===
const SUPABASE_URL = 'https://cnpfxiaosmogpdhretyk.supabase.co';
const SUPABASE_KEY = 'YOUR_ANON_KEY_HERE'; // Get from Supabase Dashboard
const GITHUB_TOKEN = 'YOUR_GITHUB_TOKEN'; // Optional: For auto-deploy
// =======================

async function fetchFromSupabase() {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: SUPABASE_URL.replace('https://', ''),
            path: '/rest/v1/Items?select=*&order=date.desc',
            method: 'GET',
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        };

        const req = https.request(options, (res) => {
            let data = '';
            
            res.on('data', (chunk) => {
                data += chunk;
            });
            
            res.on('end', () => {
                if (res.statusCode === 200) {
                    resolve(JSON.parse(data));
                } else {
                    reject(new Error(`HTTP ${res.statusCode}: ${data}`));
                }
            });
        });

        req.on('error', reject);
        req.setTimeout(10000, () => {
            req.destroy();
            reject(new Error('Timeout'));
        });
        
        req.end();
    });
}

async function main() {
    try {
        console.log('🔄 Fetching data from Supabase...');
        
        const data = await fetchFromSupabase();
        
        const result = {
            lastUpdated: new Date().toISOString(),
            data: data
        };
        
        // Save to file
        fs.writeFileSync('stock-data.json', JSON.stringify(result, null, 2));
        console.log(`✅ Saved ${data.length} items to stock-data.json`);
        
        // If you have GitHub token, commit and push
        if (GITHUB_TOKEN && fs.existsSync('.git')) {
            console.log('🚀 Pushing to GitHub...');
            // You would add git commands here
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
        
        // Create sample data file
        const sampleData = {
            lastUpdated: new Date().toISOString(),
            data: [
                { id: 1, item_name: 'Milo', new_quantity: 4, previous_quantity: 2, date: '2025-12-24T22:33:00Z' },
                { id: 2, item_name: 'Tea Powder', new_quantity: 12, previous_quantity: 8, date: '2025-12-24T22:34:00Z' },
                { id: 3, item_name: 'Tea Bags', new_quantity: 10, previous_quantity: 12, date: '2025-12-20T23:57:00Z' },
                { id: 4, item_name: 'Susu Pekat', new_quantity: 314, previous_quantity: 214, date: '2025-12-24T22:49:00Z' },
                { id: 5, item_name: 'Susu Cair', new_quantity: 97, previous_quantity: 47, date: '2025-12-24T22:52:00Z' }
            ]
        };
        
        fs.writeFileSync('stock-data.json', JSON.stringify(sampleData, null, 2));
        console.log('📝 Created sample data file');
    }
}

main();
