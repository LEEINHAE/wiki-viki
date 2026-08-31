<script>
	import favicon from '$lib/assets/favicon.svg';
	import Header from '$lib/components/Header.svelte';
	import '../app.css';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Header />
{@render children()}
<footer class="site-footer"><div>Wiki Viki · Internal knowledge, written together.</div><div><a href="/wiki/wiki-viki:basic-policy">Terms</a> · <a href="/wiki/wiki-viki:help">Help</a></div></footer>
