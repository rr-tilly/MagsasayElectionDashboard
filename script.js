
function loadLocalThenFetch() {
  // First try to load the local file
  fetch('fallback.json')
    .then(response => response.json())
    .then(data => {
      displayResults(data); // Display local data first
      // Then fetch and overwrite with live data
      return fetchLiveData();
    })
    .catch(error => {
      console.warn('Failed to load local JSON, falling back to live fetch only:', error);
      fetchLiveData(); // If local fails, just fetch live
    });
}

function fetchLiveData() {
  return fetch("https://script.google.com/macros/s/AKfycbyThAKXxEn1fCcjf6qc5Wd15Vp7JMTu7GiATkTYxZHtUVpOo3_IRuwHxD1qdir7LLsk/exec")
    .then(response => response.json())
    .then(data => displayResults(data))
    .catch(error => console.error('Error loading live data:', error));
}

const precinctProgressURL = "https://script.google.com/macros/s/AKfycbyThAKXxEn1fCcjf6qc5Wd15Vp7JMTu7GiATkTYxZHtUVpOo3_IRuwHxD1qdir7LLsk/exec?type=precincts";

function updatePrecinctProgress(reported, total) {
  const fill = document.getElementById('precinct-fill');
  const label = document.getElementById('percent');

  const percentage = (reported / total) * 100;

  fill.style.width = `${percentage}%`;
  label.textContent = `${Math.round(percentage)}%`;
}

function loadPrecinctProgress() {
  fetch(precinctProgressURL)
    .then(res => res.json())
    .then(data => {
      console.log("API response:", data);
      if (data.reported != null && data.total != null) {
        updatePrecinctProgress(data.reported, data.total);
      }
    })
    .catch(err => console.error("Error fetching progress data:", err));
}


document.addEventListener('DOMContentLoaded', () => {
  loadLocalThenFetch(); // Load local JSON first
  loadPrecinctProgress();
  setInterval(fetchLiveData, 100000); // Refresh from live every ~16 min
});


function displayResults(data) {
  if (data.congressman) displayPosition('congressman-list', data.congressman);
  if (data.councilors) displayPosition('councilor-list', data.councilors);
  if (data.governor) displayPosition('governor-list', data.governor);
  if (data.vice_governor) displayPosition('vice-governor-list', data.vice_governor);
  if (data.mayor) displayPosition('mayor-list', data.mayor);
  if (data.vice_mayor) displayPosition('vice-mayor-list', data.vice_mayor);

  // Update last updated timestamp
  const timestamp = new Date();
  const formatted = timestamp.toLocaleString('en-PH', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
  document.getElementById('last-updated').textContent = `Partial and unofficial results from poll watchers as of ${formatted}`;

}


function getPartyColor(party) {
  const colors = {
    "NUP": "#2ecc71",
    "NP": "#B20192",
    "PDPLBN": "#e74c3c",
    "IND": "#f1c40f",
    "LAKAS": "#3498db",
    "PDYN": "#9b59b6",
    "default": "#888"
  };
  return colors[party] || '#888888'; // default gray
}

function displayPosition(listId, candidates) {
  const list = document.getElementById(listId);
  if (!list) return;

  list.innerHTML = ''; // Clear old data

  const maxVotes = 24662; // Or dynamically calculate based on candidates, if needed

  candidates
    .sort((a, b) => b.votes - a.votes)
    .forEach((candidate, index) => {
      const item = document.createElement('li');
      const candidateBox = document.createElement('div');

      const voteDisplay = candidate.votes > 0 ? `${candidate.votes.toLocaleString()}` : '';
      const votePercentage = (candidate.votes / maxVotes) * 100;

      // Create the bar container
      const barContainer = document.createElement('div');
      barContainer.className = 'vote-bar-container';

      // Create the bar itself
      const bar = document.createElement('div');
      bar.className = 'vote-bar';

      // Set width based on percentage
      bar.style.width = `${votePercentage}%`;

      // Set color based on party (example)
      bar.style.backgroundColor = getPartyColor(candidate.party);

      // Assemble DOM
      barContainer.appendChild(bar);

      const boxText = document.createElement('div');
      boxText.className = "details"

      boxText.innerHTML = `<p class="name">${index + 1}. ${candidate.name} <span class="party">${candidate.party}</span></p>
       <span class="votes">${voteDisplay}</span>`;

      candidateBox.appendChild(boxText);
      candidateBox.appendChild(barContainer);

      // if (candidate.party === 'NUP') {
      //   boxText.classList.add('highlight-nup');
      // }

      list.appendChild(candidateBox);
    });
}