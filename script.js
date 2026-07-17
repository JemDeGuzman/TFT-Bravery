let membersData = [];
let originsData = [];
let classesData = [];
let uniquesData = [];

// Separate pools
let mainChampionsPool = [];
let uniqueChampionsPool = [];

const uniques = {
    'set-17': ["Rhaast", "Tahm Kench", "Morgana", "Graves", "Vex"],
    'set-18' : ["Draven", "Ivern", "Kha'zix", "Lux", "Malphite", "Maokai", "Rengar", "Taric", "The Elder Dragon", "Zyra"]
};

let currentSetName = 'set-17';
const EXCLUDED_UNIQUE_NAMES = uniques[currentSetName] || [];

function loadSetData(setName) {
    currentSetName = setName;
    
    const fetchChampions = fetch(`./set-files/${currentSetName}/${currentSetName}-names.json`).then(res => res.json());
    const fetchSynergies = fetch(`./set-files/${currentSetName}/${currentSetName}-synergy.json`).then(res => res.json());

    Promise.all([fetchChampions, fetchSynergies])
        .then(([champData, synData]) => {
            originsData = synData.origins;
            classesData = synData.classes;
            uniquesData = synData.uniques;
            membersData = champData.champions;

            // Split the roster into Main and Excluded Unique pools
            mainChampionsPool = membersData.filter(c => !EXCLUDED_UNIQUE_NAMES.includes(c.name));
            uniqueChampionsPool = membersData.filter(c => EXCLUDED_UNIQUE_NAMES.includes(c.name));

            showCardContent(); 
            rollAllPools(); 
        })
        .catch(error => {
            console.error("Error configuration loading failed:", error);
            showUnavailableMessage();
        });
}

function rollAllPools() {
    if (mainChampionsPool.length === 0) return;

    // 1. Roll Primary Champion
    const randomMainIdx = Math.floor(Math.random() * mainChampionsPool.length);
    const mainChamp = mainChampionsPool[randomMainIdx];
    displayMainChampion(mainChamp);

    // 2. Roll Minor Unique Champion Companion (with a chance to roll nothing)
    if (uniqueChampionsPool.length > 0) {
        // We create a pool that includes the real unique units + an empty choice
        // Adjust the number of nulls if you want a higher/lower chance of rolling "Nothing"
        const uniqueRollOptions = [...uniqueChampionsPool, null]; 
        
        const randomUniqueIdx = Math.floor(Math.random() * uniqueRollOptions.length);
        const uniqueChamp = uniqueRollOptions[randomUniqueIdx];

        const minorContainer = document.getElementById('minor-unique-card');
        
        if (uniqueChamp) {
            // A real unique champion was rolled -> Show the card and populate it
            minorContainer.classList.remove('hidden');
            displayMinorUniqueChampion(uniqueChamp);
        } else {
            // The empty slot was rolled -> Hide the minor card cleanly
            minorContainer.classList.add('hidden');
        }
    }
}

function displayMainChampion(selectedChampion) {
    document.getElementById('display-name').textContent = selectedChampion.name;
    
    const mainImg = document.getElementById('display-image');
    mainImg.src = selectedChampion.icon;
    mainImg.alt = selectedChampion.name;
    
    // Set cost rarity border on main card frame
    const cardElement = document.getElementById('card');
    cardElement.className = `cost-${selectedChampion.cost}`;

    const normalTraits = selectedChampion.synergies.filter(trait => !uniquesData.some(u => u.name === trait));
    const rolesContainer = document.getElementById('display-roles');
    const displayGroupsSection = document.getElementById('display-groups-section');
    
    rolesContainer.innerHTML = '';
    displayGroupsSection.innerHTML = '';

    // Render badges below main profile picture
    selectedChampion.synergies.forEach(traitName => {
        rolesContainer.appendChild(createTraitBadge(traitName));
    });

    // Randomize up to two standard traits to build rows out of
    let traitsToDisplay = [...normalTraits];
    if (traitsToDisplay.length > 2) {
        traitsToDisplay = traitsToDisplay.sort(() => 0.5 - Math.random()).slice(0, 2);
    }

    traitsToDisplay.forEach(traitName => {
        const groupBlock = document.createElement('div');
        groupBlock.className = 'synergy-group-block';

        const groupHeader = document.createElement('div');
        groupHeader.className = 'synergy-group-header';
        groupHeader.appendChild(createTraitBadge(traitName));
        
        const headerText = document.createElement('span');
        headerText.textContent = ` Trait Roster`;
        groupHeader.appendChild(headerText);
        groupBlock.appendChild(groupHeader);

        const teamGrid = document.createElement('div');
        teamGrid.className = 'mini-champ-grid';

        // Filter and SORT teammates from cost level 1 through 5
        const teammates = membersData
            .filter(champ => champ.synergies.includes(traitName))
            .sort((a, b) => a.cost - b.cost);

        teammates.forEach(champ => {
            teamGrid.appendChild(createMiniChampCard(champ));
        });

        groupBlock.appendChild(teamGrid);
        displayGroupsSection.appendChild(groupBlock);
    });
}

function displayMinorUniqueChampion(uniqueChampion) {
    const minorContainer = document.getElementById('minor-unique-card');
    minorContainer.className = `minor-card cost-${uniqueChampion.cost}`;
    
    document.getElementById('minor-image').src = uniqueChampion.icon;
    document.getElementById('minor-image').alt = uniqueChampion.name;
    document.getElementById('minor-name').textContent = uniqueChampion.name;

    const minorRoles = document.getElementById('minor-roles');
    minorRoles.innerHTML = '';
    uniqueChampion.style = "";
    
    uniqueChampion.synergies.forEach(traitName => {
        minorRoles.appendChild(createTraitBadge(traitName));
    });
}

function findTraitData(traitName) {
    return originsData.find(t => t.name === traitName) ||
           classesData.find(t => t.name === traitName) ||
           uniquesData.find(t => t.name === traitName);
}

function createTraitBadge(traitName) {
    const foundTrait = findTraitData(traitName);
    const traitBadge = document.createElement('span');
    traitBadge.className = 'trait-badge';

    if (foundTrait) {
        const iconImg = document.createElement('img');
        iconImg.src = foundTrait.icon;
        iconImg.alt = foundTrait.name;
        
        const textSpan = document.createElement('span');
        textSpan.textContent = foundTrait.name;

        traitBadge.appendChild(iconImg);
        traitBadge.appendChild(textSpan);
    } else {
        textSpan.textContent = traitName;
    }
    return traitBadge;
}

function createMiniChampCard(champion) {
    const miniCard = document.createElement('div');
    miniCard.className = `mini-champ-card cost-${champion.cost}`;

    const img = document.createElement('img');
    img.src = champion.icon;
    img.alt = champion.name;

    const name = document.createElement('div');
    name.className = 'mini-champ-name';
    name.textContent = champion.name;

    miniCard.appendChild(img);
    miniCard.appendChild(name);
    return miniCard;
}

function showCardContent() {
    document.getElementById('app-playground').classList.remove('hidden');
    document.getElementById('unavailable-message').classList.add('hidden');
    document.getElementById('random-btn').disabled = false;
}

function showUnavailableMessage() {
    document.getElementById('app-playground').classList.add('hidden');
    document.getElementById('unavailable-message').classList.remove('hidden');
    document.getElementById('random-btn').disabled = true;
}

function switchSet(setName, event) {
    const buttons = document.querySelectorAll('.set-btn');
    buttons.forEach(btn => btn.classList.remove('active'));
    if (event && event.target) event.target.classList.add('active');
    loadSetData(setName);
}

document.getElementById('random-btn').addEventListener('click', rollAllPools);
loadSetData('set-17');
loadSetData('set-18');