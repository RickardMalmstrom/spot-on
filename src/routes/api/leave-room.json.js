import firebase from "firebase/app";
import "firebase/firestore";

export async function post({ body }) {
  const db = firebase.firestore();
  const data = JSON.parse(body)
  const roomsRef = db.collection('rooms').doc(data.room);
  const roomDoc = await roomsRef.get();
  const room = roomDoc.data()
  
  roomsRef.set({
    participants: room.participants.filter((participant) => participant !== data.user)
  }, { merge: true });
  return {
    body: {
      signed_out: true
    }
  };
}