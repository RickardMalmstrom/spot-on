<script>
  import { browser } from '$app/env';
  import firebase from "firebase/app";
  import "firebase/firestore";

  export let onSave, onBack, user
  console.log(user)
  let quizName, 
  playlist, 
  availablePlaylists, 
  accessToken, 
  isPublic = false,
  tracks = [], 
  savedTracks = []

  const db = firebase.firestore();

  if(browser) {
    const fetchPlaylists = async () => {
      const token = await fetch('/api/refresh.json')
      const { access_token } = await token.json()
      accessToken = access_token
      if(access_token) {
        const playlist = await fetch('https://api.spotify.com/v1/me/playlists', {
          headers: {
            Authorization: `Bearer ${access_token}`
          }
        })
        const playlistJSON = await playlist.json()
        console.log(playlistJSON)
        availablePlaylists = playlistJSON.items
      }
    }

    fetchPlaylists()
  }

  if(playlist){
    console.log('playlist')
    console.log(playlist)
  }

  $: {
    selectPlaylist(playlist);
  }

  const selectPlaylist = async (data) => {
    console.log(data)
    if(!data) return
    const tracksResponse = await fetch(`https://api.spotify.com/v1/playlists/${data.id}/tracks`, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })
    const { items } = await tracksResponse.json()
    tracks = items
  }

  const saveTrack = (track) => {
    if(savedTracks.indexOf(track) > -1) {
      savedTracks = savedTracks.filter((id) => id !== track)
    } else {
      savedTracks = [...savedTracks, track]
    }
  }

  const saveQuiz = async () => {
    const quiz = {
      name: quizName,
      tracks: savedTracks,
      isPublic,
      user,
    }
    console.log(quiz)

    const docRef = await db.collection("quizes").add(quiz)
    console.log(docRef)
    onSave({
      id: docRef.id,
      ...quiz,
    }, true)
  }
</script>

<div>
  <h1>Create quiz</h1>

  <div>
    <label for="quizName">Quiz name</label>
    <input bind:value={quizName} id="quizName">
  </div>
  
  <div>
    <label for="isPublic">Public quiz?</label>
    <input type="checkbox" bind:value={isPublic} id="isPublic">
  </div>
 
  {#if availablePlaylists}
    <div>
      <label for="playlist">Select playlist</label>
      
      <select bind:value={playlist}>
        <option default value="">Select playlist</option>

        {#each availablePlaylists as playlistItem}
          <option value={playlistItem}>{playlistItem.name}</option>
        {/each}
      </select>
    </div>
  {/if}

  <div>
    Selected playlist: {playlist?.name}
  </div>
  {#if tracks}
    <div>
      {#each tracks as track}
        <div class={savedTracks.indexOf(track.track.id) > -1 ? 'active' : ''}>
          <button on:click={() => saveTrack(track.track.id)}>
            {savedTracks.indexOf(track.track.id) > -1 ? 'Remove song' : 'Add song'}
          </button>
          <div>{track.track.name}</div>
          <input placeholder="Start" />
          <input placeholder="Stop" />
        </div>
      {/each}
    </div>
  {/if}

  <div class="buttons">
    <button on:click={onBack}>Back</button>
    <button on:click={saveQuiz}>Continue</button>
  </div>
</div>

<style lang="scss">
  .active {
    background-color: green;
  }
</style>