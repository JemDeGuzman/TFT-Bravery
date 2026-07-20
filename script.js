let membersData = [];
let originsData = [];
let classesData = [];
let uniquesData = [];

// Separate pools
let mainChampionsPool = [];
let uniqueChampionsPool = [];

// Unique unit lookup map by set
const uniques = {
    'set-17': ["Rhaast", "Tahm Kench", "Morgana", "Graves", "Vex"],
    'set-18': ["Draven", "Ivern", "Kha'zix", "Lux", "Malphite", "Maokai", "Rengar", "Taric", "The Elder Dragon", "Zyra"]
};

let currentSetName = 'set-17';

function loadSetData(setName) {
    currentSetName = setName;
    
    // Dynamically retrieve the correct unique list for the active set
    const activeExcludedNames = uniques[currentSetName] || [];

    const fetchChampions = fetch(`./set-files/${currentSetName}/${currentSetName}-names.json`).then(res => res.json());
    const fetchSynergies = fetch(`./set-files/${currentSetName}/${currentSetName}-synergy.json`).then(res => res.json());

    Promise.all([fetchChampions, fetchSynergies])
        .then(([champData, synData]) => {
            originsData = synData.origins;
            classesData = synData.classes;
            uniquesData = synData.uniques;
            membersData = champData.champions;

            // Split the roster using the freshly resolved activeExcludedNames
            mainChampionsPool = membersData.filter(c => !activeExcludedNames.includes(c.name));
            uniqueChampionsPool = membersData.filter(c => activeExcludedNames.includes(c.name));

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

    // 2. Roll Minor Unique Champion Companion (or null)
    const minorContainer = document.getElementById('minor-unique-card');

    if (uniqueChampionsPool.length > 0) {
        const uniqueRollOptions = [...uniqueChampionsPool, null]; 
        const randomUniqueIdx = Math.floor(Math.random() * uniqueRollOptions.length);
        const uniqueChamp = uniqueRollOptions[randomUniqueIdx];

        if (uniqueChamp) {
            minorContainer.classList.remove('hidden');
            displayMinorUniqueChampion(uniqueChamp);
        } else {
            minorContainer.classList.add('hidden');
        }
    } else {
        // Hide if the current set has no unique champions defined
        minorContainer.classList.add('hidden');
    }
}

function displayMainChampion(selectedChampion) {
    document.getElementById('display-name').textContent = selectedChampion.name;
    
    const mainImg = document.getElementById('display-image');
    mainImg.src = selectedChampion.icon;
    mainImg.alt = selectedChampion.name;
    
    const cardElement = document.getElementById('card');
    cardElement.className = `cost-${selectedChampion.cost}`;

    const normalTraits = selectedChampion.synergies.filter(trait => !uniquesData.some(u => u.name === trait));
    const rolesContainer = document.getElementById('display-roles');
    const displayGroupsSection = document.getElementById('display-groups-section');
    
    rolesContainer.innerHTML = '';
    displayGroupsSection.innerHTML = '';

    selectedChampion.synergies.forEach(traitName => {
        rolesContainer.appendChild(createTraitBadge(traitName));
    });

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
        const textSpan = document.createElement('span');
        textSpan.textContent = traitName;
        traitBadge.appendChild(textSpan);
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