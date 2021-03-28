<script context="module">
  import firebase from "firebase/app";
  import "firebase/firestore";

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

  export let room, id, user, isHost
  const db = firebase.firestore();

  if(browser) {
    window.addEventListener("beforeunload", function(e) {
      if(room.participants.filter((participant) => participant === user.id).length > 0) {
        navigator.sendBeacon('/api/leave-room.json', JSON.stringify({ user: user.id, room: id }));
      }
    });
  }

  db.collection("rooms").doc(id).onSnapshot((doc) => {
    room = doc.data();
  });
</script>

<main>
  <h1>Room</h1>

  {#if room}
    {#each room.participants as participant}
      <div>
        {participant}
      </div>
    {/each}

    {room.quiz}
    {isHost}
    {user.display_name}
  {/if}
</main>
  