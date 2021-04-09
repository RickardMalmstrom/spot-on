<script context="module">
  import firebase from "firebase/app";
  import "firebase/firestore";
  import Button from "$lib/Button.svelte";

  export async function load({ page, session }) {
    const db = firebase.firestore();
    
    const user = session
    const roomsRef = db.collection('rooms').doc(page.params.room);
    const roomDoc = await roomsRef.get();
    const room = roomDoc.data()
    const participants = room.participants || []
    if(participants.filter((participant) => participant === user.id).length === 0) {
      roomsRef.set({
        participants: [...participants, user.id]
      }, { merge: true });
    }

    if(room) {
      return {
				props: {
          id: page.params.room,
					room,
          isHost: room.host === user.id,
          user
				}
			};
    } else {
      return {
        status: 500,
        error: new Error(`Could not load page`)
      };
    }
	}
</script>

<script>
  import { browser } from '$app/env';
  export let room, id, user, isHost, quiz
  const db = firebase.firestore();
  let spotifyPlayer, deviceId
  if(browser) {
    window.onSpotifyWebPlaybackSDKReady = async () => {
      console.log('initSpotifyPlayer')
      const token = await fetch('/api/refresh.json')
      const { access_token } = await token.json()
      
      const player = new Spotify.Player({
        name: 'Spot-On Quiz',
        getOAuthToken: cb => { cb(access_token); }
      });

      player.addListener('initialization_error', ({ message }) => { console.error(message); });
      player.addListener('authentication_error', ({ message }) => { console.error(message); });
      player.addListener('account_error', ({ message }) => { console.error(message); });
      player.addListener('playback_error', ({ message }) => { console.error(message); });

      // Playback status updates
      player.addListener('player_state_changed', state => { console.log(state); });

      // Ready
      player.addListener('ready', ({ device_id }) => {
        deviceId = device_id

        if(room?.currentlyPlaying) {
          play({
            device_id,
            playerInstance: spotifyPlayer,
            spotify_uri: `spotify:track:${room.currentlyPlaying}`,
          });
        }
      });

      // Not Ready
      player.addListener('not_ready', ({ device_id }) => {
        console.log('Device ID has gone offline', device_id);
      });

      // Connect to the player!
      player.connect();
      spotifyPlayer = player
    }

    (function(d, script) {
      script = d.createElement('script');
      script.type = 'text/javascript';
      script.async = true;
      script.src = 'https://sdk.scdn.co/spotify-player.js';
      d.getElementsByTagName('head')[0].appendChild(script);
    }(document));

    window.addEventListener("beforeunload", function(e) {
      e.preventDefault()
      e.returnValue = '';

      if(room.participants.filter((participant) => participant === user.id).length > 0) {
        navigator.sendBeacon('/api/leave-room.json', JSON.stringify({ user: user.id, room: id }));
      }
    });
  }

  db.collection("rooms").doc(id).onSnapshot((doc) => {
    room = doc.data();
    if(room.quiz) {
      if(room.currentlyPlaying && deviceId) {
        play({
          playerInstance: spotifyPlayer,
          spotify_uri: `spotify:track:${room.currentlyPlaying}`,
        });
      } else if(spotifyPlayer) {
        spotifyPlayer.pause()
      }

      db.collection("quizes").doc(room.quiz).onSnapshot((doc) => {
        console.log(doc.data())
        quiz = doc.data();
      });
    }
  });

  const play = ({
    spotify_uri,
    device_id = deviceId,
    playerInstance: {
      _options: {
        getOAuthToken,
        id
      }
    }
  }) => {
    getOAuthToken(async (access_token) => {
      await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${device_id}`, {
        method: 'PUT',
        body: JSON.stringify({ uris: [spotify_uri] }),
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${access_token}`
        },
      });
    });
  };

  const playTrack = (track) => {
    db.collection("rooms").doc(id).set({
      currentlyPlaying: track
    }, { merge: true });
  }
</script>

<main>
  <h1>{room?.name}</h1>
  <h2>{quiz?.name}</h2>

  {#if room}
    <div class="participants">
      {#each room.participants as participant}
        <div class="participant">
          <div class="score">3</div>
          {participant}

          {#if isHost && participant !== user.id}
            <button>Remove</button>
          {/if}
        </div>
      {/each}
    </div>

    <div class="buttons">
      <Button className="exit-game">
        {isHost ? 'Cancel quiz' : 'Exit quiz'}
      </Button>
      {#if isHost}
        <Button className="start-game">
          Start quiz
        </Button>
      {/if}
    </div>
    
    {#if isHost && quiz}
      {#each quiz?.tracks as track}
        <div on:click={() => playTrack(track)}>{track}</div>
      {/each}
    {/if}
  {/if}
</main>
  
<style lang="scss">
  .participants {
    display: flex;
    flex-wrap: nowrap;
  }

  h1, h2 {
    text-align: center;
  }

  .participant {
    display: flex;
    width: 200px;
    height: 80px;
    margin: 5px;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    border: 2px solid #ffdd59;
  }

  .score {
    font-size: 24px;
  }

  button {
    background: none;
    border: 0;
    color: #fff;
    margin-top: 5px; 
    font-size: 12px;
  }

  .buttons {
    width: 50%;
    margin: 30px auto;
    grid-gap: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 'left right';
    justify-content: center;  
  }

  :global(.buttons button.exit-game) {
    border-color: red;
  }
</style>