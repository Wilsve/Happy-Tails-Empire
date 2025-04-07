// Djurens egenskaper och beteenden
class Pet {
    constructor(name, animalType)
    {
        this.name = name;
        this.animalType = animalType;
        this.energy = 50;
        this.fullness = 50;
        this.happiness = 50;
        this.timer = null;

    }
    nap() {
        this.energy = Math.min(Math.max(this.energy + 40, 0), 100);
        this.fullness = Math.min(Math.max(this.fullness - 10, 0), 100);
        this.happiness = Math.min(Math.max(this.happiness - 10, 0), 100);
    }
    
    play() {
        this.happiness = Math.min(Math.max(this.happiness + 30, 0), 100);
        this.energy = Math.min(Math.max(this.energy - 10, 0), 100);
        this.fullness = Math.min(Math.max(this.fullness - 10, 0), 100);
    }
    
    eat() {
        this.fullness = Math.min(Math.max(this.fullness + 30, 0), 100);
        this.happiness = Math.min(Math.max(this.happiness + 5, 0), 100);
        this.energy = Math.min(Math.max(this.energy - 15, 0), 100);
    }
    kill(){
        this.energy = 0;
        this.fullness = 0;
        this.happiness = 0;
    }

    timerStats(){
        this.energy = Math.min(Math.max(this.energy - 15, 0), 100);
        this.fullness = Math.min(Math.max(this.fullness - 15, 0), 100);
        this.happiness = Math.min(Math.max(this.happiness - 15, 0), 100);

        return this.energy > 0 && this.fullness > 0 && this.happiness > 0;
    }

    // Timer för att minska stats
    startTimer(callback) {
        this.timer = setTimeout(() => {
            const isAlive = this.timerStats();
            
            if (callback) callback(this, !isAlive);
            
            if (isAlive) {
                this.startTimer(callback);
            }
        }, 10000);
    }

    stopTimer() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }
};

// Logik för att skapa och hantera spelet
class Game {
    constructor(){
        this.pets = [];
        this.maxPets = 4;
        this.history = [];
        
        this.addToHistory('Welcome to Happy Tails Empire :)')
        this.addToHistory();
    }
    
    
    addPet(pet){
        if(this.pets.length < this.maxPets){
            this.pets.push(pet);
            this.addToHistory(` You added ${pet.name}!`);
            return true;
        }
        else{
            this.addToHistory("You have too many pets!");
            return false;
        }
    }
    
    findPetByName(petName) {
        return this.pets.find(pet => pet.name === petName);
    }

    //Om man matar in samma namn
    nameExists(name) {
        return this.pets.some(pet => pet.name.toLowerCase() === name.toLowerCase());
    }
    
    doActivity(activity, petName) {
        const pet = this.findPetByName(petName);
        
        if (activity === 'nap') {
            pet.nap();
            this.addToHistory(`${petName} took a nap!`);
        } else if (activity === 'eat') {
            pet.eat();
            this.addToHistory(`You fed ${petName}`);
        } else if (activity === 'play') {
            pet.play();
            this.addToHistory(`You played with ${petName}`);
        }else if (activity === 'kill') {
            pet.kill();
            this.addToHistory(`${petName} is dead!`);
        }
    }
    
    addToHistory(message) {
        this.history.push(message);

        if (this.history.length > 13) {
            this.history.shift();
        }
    }
};

//Gränssnitt/UI
class ShowPets {
    constructor(){
        this.game = new Game();
    }
    
    showPets(){
       const createBtn = document.querySelector("#create-btn");
       createBtn.addEventListener("click", () =>{
        this.createPet();
       });
       this.displayHistory();
    } 

    createPet(){
        const name = document.querySelector('#name').value;
        const animalType = document.querySelector('#animalType').value;

        if (!name) {
            alert('Please enter a name for your pet!');
            return;
        }
        
        if (!animalType || animalType === 'Animal type') {
            alert('Please select an animal type!');
            return;
        }

        if (this.game.nameExists(name)) {
            alert('A pet with this name already exists!');
            return;
        }

        const pet = new Pet(name, animalType);
        const petAdded = this.game.addPet(pet);
        
        if (petAdded) {
            this.displayPet(pet);
        }

        this.displayHistory();

        document.querySelector('#name').value = '';
        document.querySelector('#animalType').selectedIndex = 0;
    }

    removePet(petName){
        const pet = this.game.findPetByName(petName);

        if (pet) {
            pet.stopTimer();
        }
        const petElement = document.querySelector(`[data-pet-name="${petName}"]`);
        if(petElement){
            petElement.remove();
        }
        // Ta bort djuret från spelet
        const petIndex = this.game.pets.findIndex(p => p.name === petName);
    if (petIndex !== -1) {
        this.game.pets.splice(petIndex, 1);
        this.displayHistory();
    }
    }

    displayHistory() {
        const historyContainer = document.querySelector('#history-container');
        historyContainer.innerHTML = '';
        
        for (let i = this.game.history.length - 1; i >= 0; i--) {
            const historyItem = document.createElement('p');
            historyItem.textContent = this.game.history[i];
            historyContainer.appendChild(historyItem);
        }
    }
    updatePetProgressBars(pet) {

        if (pet.energy <= 0 || pet.fullness <= 0 || pet.happiness <= 0) {
            this.game.addToHistory(`${pet.name} did not survive!`);
            this.removePet(pet.name);
            return;
        }
        
        const petElement = document.querySelector(`[data-pet-name="${pet.name}"]`);
        
        if (petElement) {
            const energyBar = petElement.querySelector('.progress-bar.energy');
            if (energyBar) energyBar.style.width = pet.energy + '%';
            
            const fullnessBar = petElement.querySelector('.progress-bar.fullness');
            if (fullnessBar) fullnessBar.style.width = pet.fullness + '%';
            
            const happinessBar = petElement.querySelector('.progress-bar.happiness');
            if (happinessBar) happinessBar.style.width = pet.happiness + '%';
        }
    }
    
    displayPet(pet){
        const gameContainer = document.querySelector('#game-container');
        const petDiv = document.createElement('div');
        petDiv.classList.add('pet');

        let imageSrc;
        switch(pet.animalType) {
            case 'jinglebottom':
                imageSrc = 'img/jinglebottom.png'; 
                break;
            case 'wobblenose':
                imageSrc = 'img/wobblenose.png';
                break;
            case 'bimbleflop':
                imageSrc = 'img/bimbleflop.png';
                break;
            case 'jollytail':
                imageSrc = 'img/jollytail.png';
                break;
        }

        petDiv.innerHTML = `
        <div class="pet-header">
            <h2>${pet.name}</h2>
            <p>${pet.animalType}</p>
        </div>
        <div class="pet-content">
            <img src="${imageSrc}" alt="${pet.animalType}" class="pet-img-initial">
            <div class="pet-stats">
                <div class="stat-row">
                    <p>Energy:</p>
                    <div class="progress-container">
                        <div class="progress-bar energy" id="${pet.name}-energyBar"></div>
                    </div>
                </div>
                <div class="stat-row">
                    <p>Fullness:</p>
                    <div class="progress-container">
                        <div class="progress-bar fullness" id="${pet.name}-fullnessBar"></div>
                    </div>
                </div>
                <div class="stat-row">
                    <p>Happiness:</p>
                    <div class="progress-container">
                        <div class="progress-bar happiness" id="${pet.name}-happinessBar"></div>
                    </div>
                </div>
                </div>
            </div>
        </div>
        <div class="pet-actions">
            <button class="action-btn">Nap</button>
            <button class="action-btn">Play</button>
            <button class="action-btn">Eat</button>
            <button class="action-btn">Kill</button>
        </div>
        `;
        
        petDiv.dataset.petName = pet.name;
        gameContainer.appendChild(petDiv);


        pet.startTimer((updatedPet, isDead) => {
            if (isDead) {
                this.game.addToHistory(`${updatedPet.name} did not survive!`);
                this.removePet(updatedPet.name);
            } else {
                this.updatePetProgressBars(updatedPet);
            }
        });

        
        // För aktivitetsknapparna
        const actionButtons = petDiv.querySelectorAll('.action-btn');
        actionButtons.forEach((button, index) => {
            button.addEventListener('click', () => {
                const actions = ['nap', 'play', 'eat', 'kill'];
                const action = actions[index];
                const petName = petDiv.dataset.petName;
                
                this.game.doActivity(action, petName);

                if (action === 'kill') {
                    this.removePet(petName);
                }else {

                    const updatedPet = this.game.findPetByName(petName);
                    this.updatePetProgressBars(updatedPet);
                }

                
                
                this.displayHistory();
            });
        });
        this.updatePetProgressBars(pet);

        const imgElement = petDiv.querySelector('.pet-img-initial');
    
        setTimeout(() => {
            imgElement.classList.remove('pet-img-initial');
            imgElement.classList.add('pet-img', 'bouncing');
        }, 1000);
    }
}

// Starta app
document.addEventListener('DOMContentLoaded', function() {
    console.log("DOM loaded");
    const app = new ShowPets();
    app.showPets();
});