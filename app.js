// DOM Elements
const scoreForm = document.getElementById('score-form');
const playerNameInput = document.getElementById('player-name');
const entryNumberInput = document.getElementById('entry-number');
const instaHandleInput = document.getElementById('insta-handle');
const playerScoreInput = document.getElementById('player-score');
const leaderboardList = document.getElementById('leaderboard-list');
const clearBtn = document.getElementById('clear-btn');

// Local Storage Key
const STORAGE_KEY = 'mathsoc_blackjack_leaderboard';

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    updateLeaderboard();
});

// Event Listeners
scoreForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = playerNameInput.value.trim();
    const entry = entryNumberInput.value.trim();
    const insta = instaHandleInput.value.trim();
    const score = parseFloat(playerScoreInput.value);
    
    if (!name || !entry || isNaN(score)) {
        alert('Please fill out all required fields with valid data.');
        return;
    }
    
    saveScore(name, entry, insta, score);
    
    // Reset form after submission
    scoreForm.reset();
    playerNameInput.focus();
    
    // Refresh Leaderboard
    updateLeaderboard();
});

clearBtn.addEventListener('click', () => {
    if (confirm("Are you sure you want to clear all Black Jack leaderboard data? This cannot be undone.")) {
        localStorage.removeItem(STORAGE_KEY);
        updateLeaderboard();
    }
});

// Logic
function saveScore(name, entry, insta, score) {
    let leaderboard = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    
    leaderboard.push({
        id: Date.now().toString(), // unique id
        name: name,
        entry: entry,
        insta: insta,
        score: score,
        date: new Date().toISOString()
    });
    
    // Sort descending by score
    leaderboard.sort((a, b) => b.score - a.score);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(leaderboard));
}

function updateLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    leaderboardList.innerHTML = '';
    
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = `
            <li style="justify-content: center; opacity: 0.5;">
                <span>No scores recorded yet. Add one!</span>
            </li>
        `;
        return;
    }
    
    leaderboard.forEach((entry, index) => {
        const li = document.createElement('li');
        
        // Rank
        const rankSpan = document.createElement('div');
        rankSpan.className = 'lb-rank';
        rankSpan.innerText = `#${index + 1}`;
        
        // Details (Name + Extra info)
        const detailsDiv = document.createElement('div');
        detailsDiv.className = 'lb-details';
        
        const nameDiv = document.createElement('div');
        nameDiv.className = 'lb-name';
        nameDiv.innerText = entry.name;
        
        const extraDiv = document.createElement('div');
        extraDiv.className = 'lb-extra';
        let extraText = entry.entry || "";
        if (entry.insta) {
            extraText += extraText ? ` | ${entry.insta}` : entry.insta;
        }
        extraDiv.innerText = extraText;
        
        detailsDiv.appendChild(nameDiv);
        if (extraText) detailsDiv.appendChild(extraDiv);
        
        // Score Box
        const scoreContainer = document.createElement('div');
        scoreContainer.className = 'lb-score-container';
        
        const scoreLabel = document.createElement('div');
        scoreLabel.className = 'lb-score-label';
        scoreLabel.innerText = 'PTS';
        
        const scoreVal = document.createElement('div');
        scoreVal.className = 'lb-score';
        scoreVal.innerText = entry.score;
        
        scoreContainer.appendChild(scoreVal);
        scoreContainer.appendChild(scoreLabel);
        
        // Assemble
        li.appendChild(rankSpan);
        li.appendChild(detailsDiv);
        li.appendChild(scoreContainer);
        
        leaderboardList.appendChild(li);
    });
}
