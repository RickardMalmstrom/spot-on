<script>
	import firebase from "firebase/app";
  import "firebase/firestore";
  import "firebase/auth";
  import "firebase/functions";
	import { goto } from '$app/navigation';
	import { session } from '$app/stores';
	import Button from '$lib/Button.svelte';

  const db = firebase.firestore();

	let isLoading = true;
	let isLoggedIn = false;
	let roomID;
	let userData;

	const getLoginURL = (scopes) => 
		'https://accounts.spotify.com/authorize?client_id=' + import.meta.env.VITE_SPOTIFY_CLIENT_ID +
		'&redirect_uri=' + encodeURIComponent(import.meta.env.VITE_SPOTIFY_REDIRECT_URI) +
		'&scope=' + encodeURIComponent(scopes.join(' ')) +
		'&response_type=code';
		
	function login() {
		loginWithSpotify()
			.then((accessToken) => getUserData(accessToken))
			.then((response) => response.json())
			.then((data) => {
				userData = data
				const signUp = firebase.functions().httpsCallable('signUp');
				return signUp({ user_id: `spotify:${data.id}` })
			})
			.then(({ data }) => {
				// Sign in with the token from the function
				const token = data.token;
				return firebase.auth().signInWithCustomToken(token)
			}).catch(error => {
				console.error(error);
			});
    }

		firebase.auth().onAuthStateChanged(async (user) => {
			if (user) {
				console.log('user')
				isLoggedIn = true
			} else {
				isLoggedIn = false
			}

			isLoading = false
		});

	function loginWithSpotify() {
		const url = getLoginURL([
			'user-read-email',
			'streaming',
			'user-read-private'
		]);

		return new Promise((resolve, reject) => {
		  window.addEventListener('message', (event) => {
		    if (event.data) {
		      resolve(event.data);
		    }
		  }, false);

			// Show spotify auth popup
			window.open(url);
		});
	}

	async function getUserData(accessToken) {
		return fetch('http://localhost:3000/api/refresh.json', {
			method: 'POST',
			body: JSON.stringify({
				code: accessToken,
				grant_type: 'authorization_code'
			})
		})
		.then((response) => response.json())
		.then(({ access_token }) => fetch(
	    'https://api.spotify.com/v1/me',
	    { 'headers': {'Authorization': 'Bearer ' + access_token } }
	  ))
	}

	session.subscribe((value) => {
		userData = value
	})
	
	function join() {
		db.collection("rooms").doc(roomID).onSnapshot((doc) => {
			goto(`/rooms/${roomID}`)
	  });
	}
</script>

<main>
	<section>
		{#if isLoading}
		Loading..
		{:else}
			{#if isLoggedIn}
				<h2>Join quiz</h2>
				<div>
					<label for="roomID">Room id</label>
					<input bind:value={roomID} id="roomID">
				</div>
				<Button onClick={join} disabled={!roomID}>
					Join room
				</Button>
				
				<hr />

				<a href="/rooms/create">
					Create new quiz
				</a>
			{:else}
				<Button onClick={login}>
					Signin with Spotify
				</Button>
			{/if}
		{/if}
	</section>
</main>

<style lang="scss">
	main {
		text-align: center;
		padding: 1em;
		margin: 0 auto;
	}

	h1 {
		font-size: 48px;	
	}

	p {
		max-width: 14rem;
		margin: 2rem auto;
		line-height: 1.35;
	}

	a {
		color: #fff;
	}

	@media (min-width: 480px) {
		p {
			max-width: none;
		}
	}
</style>
