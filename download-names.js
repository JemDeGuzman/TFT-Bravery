const fs = require('fs');
const path = require('path');

// CONFIGURATION: Change these depending on which set you are downloading
const JSON_FILE = './set-files/set-17/set-17-names.json';
const OUTPUT_DIR = './set-files/set-17/images';

if (!fs.existsSync(OUTPUT_DIR)) {
    fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

async function downloadImages() {
    try {
        const rawData = fs.readFileSync(JSON_FILE, 'utf8');
        let data;

        try {
            data = JSON.parse(rawData);
        } catch (jsonError) {
            console.error("❌ Syntax error in file:", jsonError.message);
            return;
        }

        // UPDATED: Looks for "champions" instead of "members"
        const list = data.champions || data.members;

        if (!list || !Array.isArray(list)) {
            console.error("❌ Error: Could not find an array under 'champions' or 'members'.");
            return;
        }

        console.log(`Found ${list.length} champions to download. Starting...`);

        for (let i = 0; i < list.length; i++) {
            const champion = list[i];
            
            // UPDATED: Safely falls back to "icon" if "image_url" doesn't exist
            const remoteUrl = champion.icon || champion.image_url;

            if (!remoteUrl) {
                console.warn(`⚠️ Skipping ${champion.name || i}: No icon link found.`);
                continue;
            }

            // Clean up name for file savings (handles spaces/special characters like "The Mighty Mech" or "Bel'Veth")
            const cleanName = champion.name.toLowerCase().replace(/[^a-z0-9]/g, '');
            const extension = remoteUrl.toLowerCase().endsWith('.svg') ? '.svg' : '.png';
            const filename = `${cleanName}${extension}`;
            const localPath = path.join(OUTPUT_DIR, filename);

            console.log(`[${i + 1}/${list.length}] Downloading ${champion.name}...`);

            try {
                // Send a generic browser User-Agent so Mobalytics doesn't block the script request
                const response = await fetch(remoteUrl, {
                    headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)' }
                });
                
                if (!response.ok) throw new Error(`HTTP ${response.status}`);
                
                const arrayBuffer = await response.arrayBuffer();
                const buffer = Buffer.from(arrayBuffer);
                fs.writeFileSync(localPath, buffer);

                // UPDATED: Modifies whichever structural key your JSON used
                if (champion.icon) {
                    champion.icon = `./images/set17/${filename}`;
                } else {
                    champion.image_url = `./images/set17/${filename}`;
                }
            } catch (err) {
                console.error(`  ❌ Failed to download icon for ${champion.name}:`, err.message);
            }
        }

        // Save changes back to your file cleanly
        fs.writeFileSync(JSON_FILE, JSON.stringify(data, null, 2), 'utf8');
        console.log(`\n✅ Done! Images downloaded to '${OUTPUT_DIR}' and '${JSON_FILE}' has been updated.`);

    } catch (error) {
        console.error("Critical System Error:", error);
    }
}

downloadImages();