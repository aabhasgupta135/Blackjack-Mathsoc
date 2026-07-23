const supabaseUrl = 'https://gtuhrxfmazkwhrfrshsx.supabase.co';
const supabaseKey = 'sb_publishable_qR4C8UcBso6N2ZfwyAtRAw_Tgn8DgXP';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

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
scoreForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const name = playerNameInput.value.trim();
    const entry = entryNumberInput.value.trim();
    const insta = instaHandleInput.value.trim();
    const score = parseFloat(playerScoreInput.value);
    
    if (!name || !entry || isNaN(score)) {
        alert('Please fill out all required fields with valid data.');
        return;
    }
    
    // Disable button to prevent double submission
    const submitBtn = scoreForm.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.innerText = 'Submitting...';
    
    await saveScore(name, entry, insta, score);
    
    // Reset form after submission
    scoreForm.reset();
    playerNameInput.focus();
    submitBtn.disabled = false;
    submitBtn.innerText = 'Submit Score';
    
    // Refresh Leaderboard
    await updateLeaderboard();
});

clearBtn.addEventListener('click', async () => {
    if (confirm("Are you sure you want to clear all Black Jack leaderboard data? This will reset them to 0 on the server.")) {
        const { error } = await supabaseClient
            .from('players')
            .update({ blackjack_score: 0 })
            .not('entry_number', 'is', null);
            
        await updateLeaderboard();
    }
});

// Logic
async function saveScore(name, entry, insta, score) {
    const { error } = await supabaseClient
        .from('players')
        .upsert({ 
            entry_number: entry,
            player_name: name,
            insta_handle: insta,
            blackjack_score: score
        }, { onConflict: 'entry_number' });
        
    if (error) console.error('Error saving score:', error);
}

async function updateLeaderboard() {
    leaderboardList.innerHTML = '<li style="justify-content: center; opacity: 0.5;"><span>Loading...</span></li>';
    
    const { data: leaderboardData, error } = await supabaseClient
        .from('players')
        .select('player_name, entry_number, insta_handle, blackjack_score')
        .gt('blackjack_score', 0)
        .order('blackjack_score', { ascending: false })
        .limit(10);
        
    if (error) {
        console.error('Error fetching leaderboard:', error);
        leaderboardList.innerHTML = '<li style="justify-content: center; opacity: 0.5;"><span>Failed to load scores</span></li>';
        return;
    }
    
    leaderboardList.innerHTML = '';
    
    if (!leaderboardData || leaderboardData.length === 0) {
        leaderboardList.innerHTML = `
            <li style="justify-content: center; opacity: 0.5;">
                <span>No scores recorded yet. Add one!</span>
            </li>
        `;
        return;
    }
    
    leaderboardData.forEach((entryData, index) => {
        const entry = {
            name: entryData.player_name,
            entry: entryData.entry_number,
            insta: entryData.insta_handle,
            score: entryData.blackjack_score
        };
        
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
