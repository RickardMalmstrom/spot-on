<script>
  import { onMount } from 'svelte';

  onMount(async () => {
    const target = 'http://localhost:3000';
    const getQueryParam = (key) => new URLSearchParams(window.location.search).get(key)
    console.log(getQueryParam('code'))
    if (getQueryParam('code')) {
      window.opener.postMessage(getQueryParam('code'), target);
      // Close this window since it's just a popup
      window.close();
    }
  })
</script>

<main>
	<h1>Callback</h1>
</main>
