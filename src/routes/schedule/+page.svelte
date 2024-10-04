<script>
    import { onMount } from 'svelte';
  
    let games = [];
    let loading = true;
    let error = null;
  
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
  </script>
  
  <main>
    <h1>NBA Schedule</h1>
    
    {#if loading}
      <p>Loading schedule...</p>
    {:else if error}
      <p>Error: {error}</p>
    {:else}
      <ul>
        {#each games as game}
          <li>
            <h2>{game.name}</h2>
            <p>Date: {formatDate(game.date)}</p>
            <p>Status: {game.status.type.description}</p>
            {#if game.competitions[0].competitors}
              <div class="teams">
                {#each game.competitions[0].competitors as team}
                  <div class="team">
                    <img src={team.team.logo} alt={team.team.displayName} width="50" height="50">
                    <span>{team.team.abbreviation}</span>
                    {#if game.status.type.completed}
                      <span>{team.score}</span>
                    {/if}
                  </div>
                {/each}
              </div>
            {/if}
          </li>
        {/each}
      </ul>
    {/if}
  </main>
  
  <style>
    ul {
      list-style-type: none;
      padding: 0;
    }
    li {
      border: 1px solid #ccc;
      margin-bottom: 1rem;
      padding: 1rem;
    }
    .teams {
      display: flex;
      justify-content: space-around;
    }
    .team {
      display: flex;
      flex-direction: column;
      align-items: center;
    }
  </style>