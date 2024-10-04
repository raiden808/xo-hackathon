<script>
  import { onMount } from "svelte";
  import { marked } from "marked";
  import hljs from "highlight.js";
  import "highlight.js/styles/github.css";
  import { BaseUrl } from "../utils/baseUrl";

  let teams = [];
  let selectedTeams = [];
  let clickedTeams = new Set();
  let analysisResult = "";
  let showModal = false;
  let isLoading = false;
  let searchTerm = "";
  marked.setOptions({
    highlight: function (code, lang) {
      const language = hljs.getLanguage(lang) ? lang : "plaintext";
      return hljs.highlight(code, { language }).value;
    },
  });

  onMount(async () => {
    try {
      const res = await fetch(
        "https://site.api.espn.com/apis/site/v2/sports/basketball/nba/teams"
      );
      const data = await res.json();
      teams = data.sports[0].leagues[0].teams.map((team) => team.team);
    } catch (err) {
      console.error("Error fetching data:", err);
    }
  });

  const handleClick = (team) => {
    if (selectedTeams.length < 2 && !selectedTeams.includes(team)) {
      selectedTeams = [...selectedTeams, team];
      clickedTeams.add(team.id);
    }
  };

  const resetSelection = () => {
    selectedTeams = [];
    clickedTeams.clear();
    analysisResult = "";
  };

  const showAnalysis = async () => {
    if (selectedTeams.length === 2) {
      isLoading = true;
      showModal = true;
      const prompt = `${selectedTeams[0].displayName} VS ${selectedTeams[1].displayName} can you give me an analysis just base on current roster?`;
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
          analysisResult = "No analysis generated";
        }
      } catch (error) {
        console.error("Error fetching analysis:", error);
        analysisResult = "An error occurred while generating the analysis.";
      } finally {
        isLoading = false;
      }
    }
  };

  const closeModal = () => {
    showModal = false;
    analysisResult = "";
  };

  $: filteredTeams = teams.filter((t) =>
    t.displayName.toLowerCase().includes(searchTerm.toLowerCase())
  );
</script>

<main>
  <h1>NBA Team Match Up</h1>
  <div class="searchText">Search: <input bind:value={searchTerm} /></div>

  <div class="team-grid">
    {#if filteredTeams.length > 0}
      {#each filteredTeams as team}
        <button
          on:click={() => handleClick(team)}
          class:clicked={clickedTeams.has(team.id)}
          disabled={selectedTeams.length === 2 && !selectedTeams.includes(team)}
        >
          <img src={team.logos[0].href} alt={team.displayName} />
          <span>{team.name}</span>
        </button>
      {/each}
    {:else}
      <p>Loading teams...</p>
    {/if}
  </div>

  <div class="comparison-section">
    {#if selectedTeams.length === 2}
      <div class="selected-teams">
        <img
          src={selectedTeams[0].logos[0].href}
          alt={selectedTeams[0].displayName}
        />
        <span>{selectedTeams[0].displayName}</span>
        <span>VS</span>
        <span>{selectedTeams[1].displayName}</span>
        <img
          src={selectedTeams[1].logos[0].href}
          alt={selectedTeams[1].displayName}
        />
      </div>
    {/if}

    <div class="action-buttons">
      {#if selectedTeams.length === 2}
        <button class="analysis-button" on:click={showAnalysis}
          >Show Analysis</button
        >
      {/if}
      {#if selectedTeams.length > 0}
        <button class="reset-button" on:click={resetSelection}
          >Reset Selection</button
        >
      {/if}
    </div>
  </div>

  {#if showModal}
    <div class="modal-backdrop" on:click={closeModal}>
      <div class="modal-content" on:click|stopPropagation>
        <h2>Team Analysis</h2>
        {#if isLoading}
          <div class="loading-indicator">
            <div class="spinner"></div>
            <p>Generating analysis...</p>
          </div>
        {:else}
          <div class="analysis-result">
            {@html analysisResult}
          </div>
        {/if}
        <button class="close-button" on:click={closeModal}>Close</button>
      </div>
    </div>
  {/if}
</main>

<style>
  :global(body) {
    font-family: "Roboto", sans-serif;
    background-color: #17408b; /* NBA blue */
    color: white;
    margin: 0;
    padding: 20px;
  }

  .searchText {
    color: #fff;
    margin-bottom: 20px;
  }

  main {
    max-width: 1200px;
    margin: 0 auto;
  }

  h1 {
    text-align: center;
    margin-bottom: 30px;
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 15px;
    margin-bottom: 30px;
  }

  button {
    background: white;
    border: none;
    border-radius: 10px;
    padding: 10px;
    cursor: pointer;
    transition: transform 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  button:hover {
    transform: scale(1.05);
  }

  button.clicked {
    box-shadow: 0 0 0 3px #c9082a; /* NBA red */
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  button img {
    width: 60px;
    height: 60px;
    object-fit: contain;
    margin-bottom: 5px;
  }

  button span {
    font-size: 12px;
    color: #17408b;
    text-align: center;
  }

  .comparison-section {
    text-align: center;
    margin-bottom: 30px;
  }

  .selected-teams {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
    margin-bottom: 20px;
    font-size: 24px;
  }

  .selected-teams img {
    width: 80px;
    height: 80px;
    object-fit: contain;
  }

  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
  }

  .analysis-button,
  .reset-button {
    background-color: #c9082a; /* NBA red */
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
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
    background: white;
    color: #333;
    padding: 20px;
    border-radius: 10px;
    max-width: 800px;
    max-height: 80vh;
    overflow-y: auto;
  }

  .modal-content h2 {
    color: #17408b;
    margin-top: 0;
  }

  .close-button {
    background-color: #17408b;
    color: white;
    border: none;
    padding: 10px 20px;
    font-size: 16px;
    cursor: pointer;
    border-radius: 5px;
    margin-top: 20px;
  }

  .analysis-result {
    margin-top: 20px;
  }

  .loading-indicator {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 200px;
  }

  .spinner {
    border: 4px solid #f3f3f3;
    border-top: 4px solid #17408b;
    border-radius: 50%;
    width: 40px;
    height: 40px;
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }

  :global(.hljs) {
    background: #f0f0f0;
    padding: 1em;
    border-radius: 5px;
  }
</style>
