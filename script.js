let membersData = [];
let currentSetName = 'set-17';

// 1. Function to load data dynamically
function loadSetData(setName) {
    currentSetName = setName;
    
    // Attempt to fetch the names JSON file
    fetch(`./set-files/${currentSetName}/${currentSetName}-names.json`)
        .then(response => {
            if (!response.ok) {
                throw new Error("File not found");
            }
            return response.json();
        })
        .then(data => {
            // Check if the file is valid but the array inside is empty
            if (!data.champions || data.champions.length === 0) {
                throw new Error("Set is empty");
            }

            membersData = data.champions; // Store the loaded data
            showCardContent(); // Show the card UI
            chosen = pickRandomMember(); // Select an initial item
        })
        .catch(error => {
            console.warn(`Failed to load ${setName}:`, error.message);
            membersData = []; // Clear current data
            showUnavailableMessage(); // Show error layout
        });

    // Attempt to fetch the synergy JSON file
    fetch(`./set-files/${currentSetName}/${currentSetName}-synergy.json`)
        .then(response => {
            // If GitHub Pages returns a 404 (file not found), throw an error
            if (!response.ok) {
                throw new Error("File not found");
            }
            return response.json();
        })
        .then(data => {
            // Check if the file is valid but the array inside is empty
            if (!data.origins || data.origins.length === 0) {
                throw new Error("Set is empty");
            } else if (!data.classes || data.classes.length === 0) {
                throw new Error("Set is empty");
            } else if (!data.uniques || data.uniques.length === 0) {
                throw new Error("Set is empty");
            }

            originsData = data.origins; // Store the loaded data
            classesData = data.classes; // Store the loaded data
            uniquesData = data.uniques; // Store the loaded data
            chosenSynergies = chosen.synergies; // Store the chosen synergies for display
        })
        .catch(error => {
            console.warn(`Failed to load ${setName}:`, error.message);
            membersData = []; // Clear current data
            showUnavailableMessage(); // Show error layout
        });
}

// 2. Function to select and display a random item
function pickRandomMember() {
    if (membersData.length === 0) return;

    const randomIndex = Math.floor(Math.random() * membersData.length);
    const chosen = membersData[randomIndex];

    document.getElementById('display-name').textContent = chosen.name;
    document.getElementById('display-image').src = chosen.icon;
    document.getElementById('display-image').alt = chosen.name;
    document.getElementById('display-roles').textContent = chosen.synergies.join(', ');

    return chosen;
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
    // Update button visual styles
    const buttons = document.querySelectorAll('.set-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Find button that triggered it and add active class
    event.target.classList.add('active');

    // Load the new set
    loadSetData(setName);
}

// 6. Event listeners and Initial Setup
document.getElementById('random-btn').addEventListener('click', pickRandomMember);

// Load Set 17 by default on page load
loadSetData('set-17');