<script>
  export let
  name, 
  onClick,
  isSelected, 
  user, 
  tracks = [], 
  usedBy = 0
  console.log('tracks')
  console.log(tracks)
</script>

<article class={isSelected ? 'quiz quiz-selected' : 'quiz'} on:click={onClick}>
  <h1>{name}</h1>
  <h4>{user}</h4>

  <div class="quiz-info">
    <div>
      <div>
        Tracks:
      </div>
      <div>
        {tracks.length}
      </div>
    </div>
    <div>
      <div>
        Used:
      </div>
      <div>
        {usedBy}
      </div>
    </div>
  </div>
</article>

<style lang="scss">
  .quiz {
    width: 300px;
    height: 300px;
    margin: 5px;
    flex-shrink: 0;
    background-color: #485460;
    display: flex;
    justify-content: center;
    flex-direction: column;
    padding: 15px;
    box-sizing: border-box;
  }

  .quiz-selected {
    padding: 10px;
    border: 5px solid #00d8d6;
    box-sizing: border-box;
  }

  .quiz-info {
    display: flex;
  }
</style>