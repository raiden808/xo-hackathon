<script>
	import { onMount } from 'svelte';
	import { marked } from 'marked';
	import hljs from 'highlight.js';
	import 'highlight.js/styles/github.css'; // You can choose a different style
	import { BaseUrl } from './utils/baseUrl';
	let teams = [];
	let selectedTeams = [];
	let clickedTeams = new Set();
	let analysisResult = '';
	
	// Configure marked to use highlight.js for code syntax highlighting
	marked.setOptions({
	  highlight: function (code, lang) {
		const language = hljs.getLanguage(lang) ? lang : 'plaintext';
		return hljs.highlight(code, { language }).value;
	  },
	});
	
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
		clickedTeams.add(team.id);
	  }
	};
	
	// Reset selection
	const resetSelection = () => {
	  selectedTeams = [];
	  clickedTeams.clear();
	  analysisResult = '';
	};
	
	// Show analysis handler
	const showAnalysis = async () => {
	  if (selectedTeams.length === 2) {
		const prompt = `${selectedTeams[0].displayName} VS ${selectedTeams[1].displayName} can you give me an analysis just base on current roaster?`;
		try {
		  const res = await fetch(`${BaseUrl}/generate-analysis`, {
			method: "POST",
			headers: {
			  "Content-Type": "application/json",
			},
			body: JSON.stringify({ prompt }),
		  });
		  const data = await res.json();
		  if (data.story) {
			analysisResult = marked(data.story);
		  } else {
			analysisResult = "No story generated";
		  }
		} catch (error) {
		  console.error("Error fetching analysis:", error);
		  analysisResult = "An error occurred while generating the analysis.";
		}
	  }
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
	  background-color: red;
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
	.analysis-result {
	  margin-top: 20px;
	  text-align: left;
	  max-width: 800px;
	  margin-left: auto;
	  margin-right: auto;
	}
	:global(.hljs) {
	  background: #f0f0f0;
	  padding: 1em;
	  border-radius: 5px;
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
	  
	  {#if analysisResult}
		<div class="analysis-result">
		  {@html analysisResult}
		</div>
	  {/if}
	</div>