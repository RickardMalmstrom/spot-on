<script context="module">
  export async function load({ session }) {
    const user = session
    console.log(session)
    return {
      props: {
        user
      }
    } 
  }
</script>

<script>
import Quiz from '$lib/Quiz.svelte';
import Button from '$lib/Button.svelte';
import CreateQuiz from '$lib/CreateQuiz.svelte';
import NewQuiz from '$lib/NewQuiz.svelte';
import firebase from "firebase/app";
import "firebase/firestore";
import { goto } from '$app/navigation';

  const db = firebase.firestore();
  export let user
  let roomName, 
  publicQuizes = [], 
  ownQuizes = [], 
  createNewQuiz,
  selectedQuiz
  
  db.collection("quizes")
    .where("user", "==", user.id)
    .onSnapshot((querySnapshot) => {
    const fbQuizes = []
    querySnapshot.forEach((doc) => {
      fbQuizes.push({
        id: doc.id,
        ...doc.data()
      });
    });

    console.log(fbQuizes)
    ownQuizes = fbQuizes
  });
  
  db.collection("quizes")
  .where("public", "==", true)
  .onSnapshot((querySnapshot) => {
    const fbQuizes = []
    querySnapshot.forEach((doc) => {
      if(doc.data().user !== user.id) {
        fbQuizes.push({
          id: doc.id,
          ...doc.data()
        });
      }
    });

    console.log(fbQuizes)
    publicQuizes = fbQuizes
  });

  const goToSection = (target, closeQuiz) => {
    console.log('goToSection')
    console.log(document.getElementById(target))
    if(closeQuiz) {
      setTimeout(() => {
        createNewQuiz = false
      }, 1000)
    }

    document.getElementById(target).scrollIntoView();
  }
  
  const createQuiz = async () => {
    createNewQuiz = true
    setTimeout(() => {
      goToSection('sectionCreateQuiz')
    }, 0)
  }

  const saveRoom = async () => {
    const room = {
      name: roomName,
      host: user.id,
      quiz: selectedQuiz.id,
      createdAt: new Date(),
    }
    
    const docRef = await db.collection("rooms").add(room)
    console.log(docRef.id)

    goto(`/rooms/${docRef.id}`)
  }

  const selectQuiz = (quiz, navigate) => {
    selectedQuiz = quiz

    if(navigate) {
      goToSection('sectionSummary', true)
    }
  }

</script>

<main class="sections">
  <div class="section" id="sectionRoomName">
    <div class="section-inner">
      <h1>Create new room</h1>
    
      <div>
        <label for="roomName">Room name</label>
        <input bind:value={roomName} id="roomName">
      </div>

      <div class="buttons">
        <Button onClick={() => goToSection('sectionSelectQuiz')} className="continue-button">Continue</Button>
      </div>
    </div>
  </div>
 
  <div class="section" id="sectionSelectQuiz">
    <div class="section-inner">
      <h1>Select Quiz</h1>
      
      <div class="quizes">
        <NewQuiz onClick={createQuiz} />
        {#if ownQuizes}
          {#each ownQuizes as quiz, i (quiz.id)}
            <div>
              <Quiz 
                name={quiz.name}
                isSelected={quiz.id === selectedQuiz?.id} 
                user={quiz.user}
                tracks={quiz.tracks}
                usedBy={quiz.usedBy}
                onClick={() => selectQuiz(quiz)} 
              />
              {#if quiz.id === selectedQuiz?.id} 
                <span class="selected">Selected</span>
              {/if}
            </div>
          {/each}
        {/if}
        {#if publicQuizes}
          {#each publicQuizes as quiz}
            <div>
              <Quiz
                name={quiz.name}
                isSelected={quiz.id === selectedQuiz?.id} 
                user={quiz.user}
                tracks={quiz.tracks}
                usedBy={quiz.usedBy}
                onClick={() => selectQuiz(quiz)} 
              />
              {#if quiz.id === selectedQuiz?.id} 
                <span class="selected">Selected</span>
              {/if}
            </div>
          {/each}
        {/if}
      </div>

      <div class="buttons">
        <Button onClick={() => goToSection('sectionRoomName')}>Back</Button>
        <Button onClick={() => goToSection('sectionSummary', false)}>Continue</Button>
      </div>
    </div>
  </div>
  
  {#if createNewQuiz}
    <div class="section" id="sectionCreateQuiz">
      <CreateQuiz 
        user={user.id} 
        onSave={selectQuiz} 
        onBack={() => goToSection('sectionSelectQuiz', true)} 
      />
    </div>
  {/if}
  
  <div class="section" id="sectionSummary">
    <div class="section-inner">
      <h1>Summary</h1>

      <div>
        Name: {roomName}
      </div>
      <div>
        Quiz: {selectedQuiz?.name}
      </div>

      <div>
        Tracks:
        {#if selectedQuiz?.tracks}
          {#each selectedQuiz?.tracks as track}
            <div>
              {track}
            </div>
          {/each}
        {/if}
      </div>
      
      <div class="buttons">
        <Button onClick={() => goToSection('sectionSelectQuiz')}>Back</Button>
        <Button onClick={saveRoom}>Create room</Button>
      </div>
    </div>
  </div>
</main>

<style lang="scss">
	:global(body) {
    overflow: hidden;
  }

  h1, h2, h3 {
    color: #ffffff;
  }

  .buttons {
    width: 50%;
    margin: 20px auto;
    grid-gap: 20px;
    display: grid;
    grid-template-columns: 1fr 1fr;
    grid-template-areas: 'left right';
    justify-content: center;  
  }

  :global(.continue-button) {
    grid-area: right;
  }

  .quizes {
    width: 100%;
    display: flex;
    overflow: scroll;
  }

  .sections {
    overflow-y: hidden;
    scroll-snap-type: y mandatory;
    -webkit-overflow-scrolling: touch;
    height: 100vh;
    width: 100%;
		display: flex;
    flex-direction: column;
  }

  .section {
    height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    scroll-snap-align: start;
    /* only supported in Chrome */
    scroll-snap-stop: always;
    flex-shrink: 0;
  }

  .section-inner {
    text-align: center;
    width: 100%;
  }

  .selected {
    font-style: italic;
  }
</style>