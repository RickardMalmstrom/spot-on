<script>
  export let onClick
</script>

<article class="new-quiz" on:click={onClick}>
  <h1>Create new quiz</h1>
</article>

<style lang="scss">
  .new-quiz {
    width: 300px;
    height: 300px;
    background-color: #ffdd59;
    display: flex;
    align-items: center;
    margin: 5px;
    justify-content: center;
    flex-shrink: 0;
  }

  h1 {
    text-transform: uppercase;
    color: #000;
  }
</style>