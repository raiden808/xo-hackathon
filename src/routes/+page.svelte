<script>
	import { onMount } from 'svelte';
	let teams = [];
	let selectedTeams = [];
	let clickedTeams = new Set(); // Track the clicked teams
  
	// Fetch the data from the API
	onMount(async () => {
	  try {
		const res = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams');
		const data = await res.json();
		teams = data.sports[0].leagues[0].teams.map(team => team.team);
	  } catch (err) {
		console.error('Error fetching data:', err);
	  }
	});
  
	// Handle team selection
	const handleClick = (team) => {
	  if (selectedTeams.length < 2 && !selectedTeams.includes(team)) {
		selectedTeams = [...selectedTeams, team];
		clickedTeams.add(team.id); // Track clicked team by ID for styling
	  }
	};
  
	// Reset selection
	const resetSelection = () => {
	  selectedTeams = [];
	  clickedTeams.clear(); // Reset the clicked teams
	};
  
	// Show analysis handler (replace with real logic)
	const showAnalysis = () => {
	  alert(`Analysis for ${selectedTeams[0].displayName} VS ${selectedTeams[1].displayName}`);
	};
  </script>
  
  <style>
	button {
	  margin: 5px;
	  padding: 10px;
	  background-color: #0070f3;
	  color: white;
	  border: none;
	  cursor: pointer;
	}
  
	button:hover {
	  background-color: #005bb5;
	}
  
	.clicked {
	  background-color: red; /* Change the color to red when clicked */
	}
  
	.center {
	  text-align: center;
	  margin-top: 20px;
	}
  
	.analysis-button {
	  margin-top: 20px;
	}
  
	.selected-teams {
	  font-size: 1.5em;
	  font-weight: bold;
	  margin-top: 20px;
	}
  </style>
  
  <h1>NBA Teams</h1>
  
  {#if teams.length > 0}
	{#each teams as team}
	  <button 
		on:click={() => handleClick(team)}
		class:clicked={clickedTeams.has(team.id)} 
		disabled={selectedTeams.includes(team)}
	  >
		{team.displayName}
	  </button>
	{/each}
  {:else}
	<p>Loading teams...</p>
  {/if}
  
  <div class="center">
	{#if selectedTeams.length === 2}
	  <div class="selected-teams">
		{selectedTeams[0].displayName} VS {selectedTeams[1].displayName}
	  </div>
	  <button class="analysis-button" on:click={showAnalysis}>Show Analysis</button>
	{/if}
  
	{#if selectedTeams.length > 0}
	  <button on:click={resetSelection}>Reset Selection</button>
	{/if}
  </div>
  