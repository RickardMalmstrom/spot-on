<script>
  export let onClick, className = '', disabled = false
</script>

<button 
  on:click={onClick} 
  class={`button ${className ? className : ''}`} 
  disabled={disabled}
>
  <slot></slot>
</button>

<style lang="scss">
  .button {
    border: 2px solid #05c46b;
    background-color: transparent;
    color: #fff;
    padding: 10px;
    text-transform: uppercase;
    font-family: 'Archivo', sans-serif;
  }
</style>