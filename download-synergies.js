const fs = require('fs');
const path = require('path');

// CONFIGURATION
const JSON_FILE = './set-files/set-18/set-18-synergy.json'; // Make sure this matches your filename
const OUTPUT_DIR = './set-files/set-18/icons';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function downloadTraitIcons() {
    try {
        const rawData = fs.readFileSync(JSON_FILE, 'utf8');
        let data;

        try {
            data = JSON.parse(rawData);
        } catch (jsonError) {
            console.error("❌ Syntax error in JSON file:", jsonError.message);
            return;
        }

        // Define the categories we want to look through
        const categories = ['origins', 'classes', 'uniques'];
        let totalDownloaded = 0;

        for (const category of categories) {
            const list = data[category];

            if (!list || !Array.isArray(list)) {
                console.log(`ℹ️ Category '${category}' not found or empty. Skipping...`);
                continue;
            }

            console.log(`\nProcessing ${list.length} traits in '${category}'...`);

            for (let i = 0; i < list.length; i++) {
                const trait = list[i];
                const remoteUrl = trait.icon;

                if (!remoteUrl) {
                    console.warn(`  ⚠️ Skipping ${trait.name || i}: No icon link found.`);
                    continue;
                }

                // Clean up name for file savings (handles periods like "N.O.V.A.")
                const cleanName = trait.name.toLowerCase().replace(/[^a-z0-9]/g, '');
                const extension = remoteUrl.toLowerCase().endsWith('.svg') ? '.svg' : '.png';
                const filename = `${cleanName}${extension}`;
                const localPath = path.join(OUTPUT_DIR, filename);

                console.log(`  [${i + 1}/${list.length}] Downloading icon for ${trait.name}...`);

                try {
                    // Send a generic browser User-Agent to prevent CDN blocking
                    const response = await fetch(remoteUrl, {
                        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                    });
                    
                    if (!response.ok) throw new Error(`HTTP ${response.status}`);
                    
                    const arrayBuffer = await response.arrayBuffer();
                    const buffer = Buffer.from(arrayBuffer);
                    fs.writeFileSync(localPath, buffer);

                    // Update the path in the JSON object
                    trait.icon = `./set-files/set-17/icons/${filename}`;
                    totalDownloaded++;
                } catch (err) {
                    console.error(`  ❌ Failed to download icon for ${trait.name}:`, err.message);
                }
            }
        }

        // Save changes back to your file cleanly
        fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log(`\n✅ Done! ${totalDownloaded} icons downloaded to '${OUTPUT_DIR}' and '${JSON_FILE}' has been updated.`);

    } catch (error) {
        console.error("Critical System Error:", error);
    }
}

downloadTraitIcons();