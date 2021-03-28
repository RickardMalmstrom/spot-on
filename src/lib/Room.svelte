<script>
  import firebase from "firebase/app";
  import "firebase/firestore";

  const db = firebase.firestore();
	export let roomID, user;

  let isHost, room
  let quizes = []
  db.collection("rooms").doc(roomID).onSnapshot((doc) => {
    room = doc.data();
    isHost = room.host === user
  });

  console.log(quizes)
  console.log(isHost)
</script>

<h1>Room</h1>

{#if room}
  {room.quiz}
  {isHost}
{/if}
