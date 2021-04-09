<script context="module">
	import Button from '$lib/Button.svelte';

	export async function load({ session }) {
		console.log('load')
		console.log(session)
		return {
			props: {
				user: session
			}
		}
	}

</script>
<script>
	import firebase from "firebase/app";

  export let user
	console.log(user)
	if (firebase.apps.length === 0) {
		const firebaseConfig = {
			apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
			authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
			projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
			storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
			messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
			appId: import.meta.env.VITE_FIREBASE_APP_ID,
			measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
		};

		firebase.initializeApp(firebaseConfig);
	}

	function signOut() {
		firebase
			.auth()
			.signOut()
			.then(() => fetch('/api/signout.json'))
			.catch(() => console.error("Something bad happened"));
	}

</script>

{#if user}
	<Button onClick={signOut}>Logga ut</Button>
	<span>{user.email}</span>
{/if}

<h1><a href="/">Spot-On Quiz</a></h1> 

<slot></slot>


<style lang="scss">
	@import url('https://fonts.googleapis.com/css2?family=Archivo:wght@500&family=Open+Sans:wght@300&display=swap');

	:root {
		font-family: 'Open Sans', sans-serif;
	}

	:global {
		body {
			background-color: #1e272e;
    	color: #ffffff;
		}

		h1, h2, h3, h4 {
			font-family: 'Archivo', sans-serif;
		}
	}

	h1 {
		text-align: center;
	}

	h1 a {
		color: #fff;
		text-decoration: none;
	}

	@media (min-width: 480px) {
		h1 {
			max-width: none;
		}
	}
</style>
