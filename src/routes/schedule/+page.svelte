<script>
  import { onMount } from 'svelte';
  import { marked } from 'marked';

  let games = [];
  let loading = true;
  let error = null;
  let selectedGame = null;
  let showModal = false;
  let analysisResult = '';
  let analysisLoading = false;

  onMount(async () => {
    try {
      const response = await fetch('https://site.api.espn.com/apis/site/v2/sports/basketball/nba/scoreboard');
      const data = await response.json();
      games = data.events;
      loading = false;
    } catch (e) {
      error = e.message;
      loading = false;
    }
  });

  function formatDate(dateString) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', timeZoneName: 'short' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  }

  async function showAnalysis(game) {
    selectedGame = game;
    showModal = true;
    analysisLoading = true;
    analysisResult = '';

    const selectedTeams = game.competitions[0].competitors;
    if (selectedTeams.length === 2) {
      const prompt = `${selectedTeams[0].team.displayName} VS ${selectedTeams[1].team.displayName} can you give me an analysis just base on current roster?`;
      try {
        const res = await fetch("http://localhost:3000/generate-analysis", {
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
          analysisResult = "No analysis generated";
        }
      } catch (error) {
        console.error("Error fetching analysis:", error);
        analysisResult = "An error occurred while generating the analysis.";
      }
    } else {
      analysisResult = "Unable to generate analysis. Team information is incomplete.";
    }
    analysisLoading = false;
  }

  function closeModal() {
    showModal = false;
    selectedGame = null;
    analysisResult = '';
  }
</script>

<main class="container">
  <h1 class="title" style="color: white;">Narz Basketball Association Schedule</h1>
  
  {#if loading}
    <p class="loading">Loading schedule...</p>
  {:else if error}
    <p class="error">Error: {error}</p>
  {:else}
    <ul class="game-list">
      {#each games as game}
        <li class="game-card">
          <h2 class="game-title">{game.name}</h2>
          <p class="game-date">{formatDate(game.date)}</p>
          <p class="game-status">{game.status.type.description}</p>
          {#if game.competitions[0].competitors}
            <div class="teams">
              {#each game.competitions[0].competitors as team}
                <div class="team">
                  <img src={team.team.logo} alt={team.team.displayName} class="team-logo">
                  <span class="team-abbr">{team.team.abbreviation}</span>
                  {#if game.status.type.completed}
                    <span class="team-score">{team.score}</span>
                  {/if}
                </div>
              {/each}
            </div>
            <button class="analysis-btn" on:click={() => showAnalysis(game)}>Show Analysis</button>
          {/if}
        </li>
      {/each}
    </ul>
  {/if}

  {#if showModal}
    <div class="modal-backdrop" on:click={closeModal}>
      <div class="modal-content" on:click|stopPropagation>
        <h2 class="modal-title">Game Analysis</h2>
        {#if analysisLoading}
          <p class="loading">Fetching analysis...</p>
        {:else}
          <div class="analysis-content">
            {@html analysisResult}
          </div>
        {/if}
        <button class="close-btn" on:click={closeModal}>Close</button>
      </div>
    </div>
  {/if}
</main>

<style>
  :global(body) {
    font-family: Arial, sans-serif;
    background-color: #f0f0f0;
    margin: 0;
    padding: 0;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 2rem;
  }

  .title {
    text-align: center;
    color: #333;
    margin-bottom: 2rem;
  }

  .loading, .error {
    text-align: center;
    font-size: 1.2rem;
    margin-top: 2rem;
  }

  .game-list {
    list-style-type: none;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .game-card {
    background-color: white;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
    display: flex;
    flex-direction: column;
  }

  .game-title {
    font-size: 1.2rem;
    margin: 0 0 0.5rem 0;
    color: #333;
  }

  .game-date, .game-status {
    font-size: 0.9rem;
    color: #666;
    margin: 0.25rem 0;
  }

  .teams {
    display: flex;
    justify-content: space-between;
    margin: 1rem 0;
  }

  .team {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
  }

  .team-logo {
    width: 60px;
    height: 60px;
    object-fit: contain;
    margin-bottom: 0.5rem;
  }

  .team-abbr {
    font-weight: bold;
    font-size: 1.1rem;
  }

  .team-score {
    font-size: 1.2rem;
    font-weight: bold;
    margin-top: 0.25rem;
  }

  .analysis-btn {
    background-color: #0077be;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
    align-self: center;
    margin-top: auto;
  }

  .analysis-btn:hover {
    background-color: #005fa3;
  }

  .modal-backdrop {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .modal-content {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    max-width: 80%;
    max-height: 80%;
    overflow-y: auto;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  .modal-title {
    margin-top: 0;
    color: #333;
  }

  .analysis-content {
    margin: 1rem 0;
    line-height: 1.6;
  }

  .close-btn {
    background-color: #f44336;
    color: white;
    border: none;
    padding: 0.5rem 1rem;
    border-radius: 4px;
    cursor: pointer;
    font-size: 1rem;
    transition: background-color 0.3s;
    margin-top: 1rem;
  }

  .close-btn:hover {
    background-color: #d32f2f;
  }
</style>