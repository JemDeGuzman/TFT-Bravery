let membersData = [];
let originsData = [];
let classesData = [];
let uniquesData = [];
let chosen = null;
let currentSetName = 'set-17';

// 1. Function to load data dynamically (Using Promise.all to prevent race conditions)
function loadSetData(setName) {
    currentSetName = setName;
    
    const fetchChampions = fetch(`./set-files/${currentSetName}/${currentSetName}-names.json`)
        .then(res => {
            if (!res.ok) throw new Error("Champions file not found");
            return res.json();
        });

    const fetchSynergies = fetch(`./set-files/${currentSetName}/${currentSetName}-synergy.json`)
        .then(res => {
            if (!res.ok) throw new Error("Synergies file not found");
            return res.json();
        });

    // Wait until BOTH files are successfully loaded
    Promise.all([fetchChampions, fetchSynergies])
        .then(([champData, synData]) => {
            // Validate Champion Data
            if (!champData.champions || champData.champions.length === 0) {
                throw new Error("Champions array is empty");
            }
            // Validate Synergy Data
            if (!synData.origins || !synData.classes || !synData.uniques) {
                throw new Error("Synergy structures are incomplete");
            }

            // Assign to global variables
            membersData = champData.champions;
            originsData = synData.origins;
            classesData = synData.classes;
            uniquesData = synData.uniques;

            // Show UI and roll the first random champion
            showCardContent(); 
            chosen = pickRandomMember(); 
        })
        .catch(error => {
            console.warn(`Failed to load ${setName}:`, error.message);
            membersData = [];
            originsData = [];
            classesData = [];
            uniquesData = [];
            showUnavailableMessage(); // Show error layout
        });
}

// 2. Function to select and display a random item
function pickRandomMember() {
    if (membersData.length === 0) return null;

    const randomIndex = Math.floor(Math.random() * membersData.length);
    const selectedChampion = membersData[randomIndex];

    // Update Text and Character Image (using local path updated by download script)
    document.getElementById('display-name').textContent = selectedChampion.name;
    document.getElementById('display-image').src = selectedChampion.icon;
    document.getElementById('display-image').alt = selectedChampion.name;

    // Clear previous synergies UI to prepare for rendering local trait images
    const rolesContainer = document.getElementById('display-roles');
    rolesContainer.innerHTML = ''; 

    // Match text synergy strings with their local image data
    selectedChampion.synergies.forEach(synergyName => {
        // Look through all three downloaded lists for a name match
        const foundTrait = originsData.find(t => t.name === synergyName) ||
                           classesData.find(t => t.name === synergyName) ||
                           uniquesData.find(t => t.name === synergyName);

        if (foundTrait) {
            // Create a wrapper container for a clean UI item layout
            const traitBadge = document.createElement('span');
            traitBadge.className = 'trait-badge';
            traitBadge.style.display = 'inline-flex';
            traitBadge.style.alignItems = 'center';
            traitBadge.style.marginRight = '10px';

            // Create the local image icon element
            const iconImg = document.createElement('img');
            iconImg.src = foundTrait.icon; // Uses local path like: ./images/traits/bastion.svg
            iconImg.alt = foundTrait.name;
            iconImg.style.width = '24px';
            iconImg.style.height = '24px';
            iconImg.style.marginRight = '5px';

            // Create text element next to the image
            const textSpan = document.createElement('span');
            textSpan.textContent = foundTrait.name;

            traitBadge.appendChild(iconImg);
            traitBadge.appendChild(textSpan);
            rolesContainer.appendChild(traitBadge);
        } else {
            // Fallback to text if the trait icon somehow wasn't found in your JSON arrays
            const textSpan = document.createElement('span');
            textSpan.textContent = synergyName + ' ';
            rolesContainer.appendChild(textSpan);
        }
    });

    return selectedChampion;
}

// 3. UI Toggle: Show the normal content
function showCardContent() {
    document.getElementById('card-content').classList.remove('hidden');
    document.getElementById('unavailable-message').classList.add('hidden');
    document.getElementById('random-btn').disabled = false;
}

// 4. UI Toggle: Show the "unavailable" interface
function showUnavailableMessage() {
    document.getElementById('card-content').classList.add('hidden');
    document.getElementById('unavailable-message').classList.remove('hidden');
    document.getElementById('random-btn').disabled = true;
}

// 5. Triggered when clicking the top set selection buttons
function switchSet(setName) {
    const buttons = document.querySelectorAll('.set-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    if (event && event.target) {
        event.target.classList.add('active');
    }

    loadSetData(setName);
}

// 6. Event listeners and Initial Setup
document.getElementById('random-btn').addEventListener('click', () => {
    chosen = pickRandomMember();
});

// Load Set 17 by default on page load
loadSetData('set-17');