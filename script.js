document.addEventListener('DOMContentLoaded', () => {
    const generateBtn = document.getElementById('generate-btn');
    const resultContainer = document.getElementById('result-container');
    const classNameEl = document.getElementById('class-name');
    const abilitiesListEl = document.getElementById('abilities-list');
    const weaponTypeEl = document.getElementById('weapon-type');
    const rerollAbilitiesBtn = document.getElementById('reroll-abilities-btn');
    const rerollWeaponBtn = document.getElementById('reroll-weapon-btn');

    let characterData = null;
    let selectedClass = null;
    let selectedAbilities = [];
    let compatibleWeapons = [];

    async function loadData() {
        try {
            const response = await fetch('randomizer.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            characterData = await response.json();
            generateBtn.disabled = false;
        } catch (error) {
            console.error("Failed to load character data:", error);
            resultContainer.innerHTML = '<p style="color: red;">Failed to load character data. Please refresh the page.</p>';
            resultContainer.style.display = 'block';
        }
    }

    function getRandomElement(arr) {
        return arr[Math.floor(Math.random() * arr.length)];
    }

    function generateAbilitiesAndWeapon() {
        const { abilities: masteryAbilities } = characterData;
        let potentialAbilities = masteryAbilities
            .filter(m => selectedClass.masteries.includes(m.masteryName))
            .flatMap(m => m.abilityList);

        const focusAbilityCount = Math.floor(Math.random() * 3) + 1;
        selectedAbilities = [];
        compatibleWeapons = [];

        for (let i = 0; i < focusAbilityCount; i++) {
            if (potentialAbilities.length === 0) break;

            const abilityIndex = Math.floor(Math.random() * potentialAbilities.length);
            const selectedAbility = potentialAbilities[abilityIndex];
            selectedAbilities.push(selectedAbility);

            potentialAbilities.splice(abilityIndex, 1);

            if (i === 0) {
                compatibleWeapons = [...selectedAbility.compatibleWeapons];
            } else {
                compatibleWeapons = compatibleWeapons.filter(weapon => selectedAbility.compatibleWeapons.includes(weapon));
            }

            potentialAbilities = potentialAbilities.filter(ability =>
                ability.compatibleWeapons.some(weapon => compatibleWeapons.includes(weapon))
            );
        }

        generateWeapon();
    }

    function generateWeapon() {
        const selectedWeapon = compatibleWeapons.length > 0
            ? getRandomElement(compatibleWeapons)
            : "Any";
        displayResult(selectedClass, selectedAbilities, selectedWeapon);
    }

    function generateCharacter() {
        const { classes } = characterData;
        selectedClass = getRandomElement(classes);
        generateAbilitiesAndWeapon();
    }

    function displayResult(sClass, sAbilities, sWeapon) {
        classNameEl.textContent = sClass.className;

        abilitiesListEl.innerHTML = '';
        if (sAbilities.length > 0) {
            sAbilities.forEach(ability => {
                const li = document.createElement('li');
                li.textContent = ability.name;
                abilitiesListEl.appendChild(li);
            });
        } else {
            const li = document.createElement('li');
            li.textContent = 'None';
            abilitiesListEl.appendChild(li);
        }

        weaponTypeEl.textContent = sWeapon;

        resultContainer.style.display = 'block';
    }

    generateBtn.addEventListener('click', generateCharacter);
    rerollAbilitiesBtn.addEventListener('click', generateAbilitiesAndWeapon);
    rerollWeaponBtn.addEventListener('click', generateWeapon);

    loadData();
});
