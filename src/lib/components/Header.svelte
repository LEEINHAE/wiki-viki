<script>
	let query = $state('');
	let dark = $state(false);
	function search(event) { event.preventDefault(); if (query.trim()) location.href = `/?q=${encodeURIComponent(query.trim())}`; }
	function toggleTheme() { dark = !dark; document.documentElement.dataset.theme = dark ? 'dark' : 'light'; localStorage.setItem('wiki-theme', dark ? 'dark' : 'light'); }
</script>

<svelte:window on:load={() => { dark = localStorage.getItem('wiki-theme') === 'dark'; document.documentElement.dataset.theme = dark ? 'dark' : 'light'; }} />
<header class="topbar"><div class="nav-wrap">
	<a class="brand" href="/"><span class="brand-mark">W</span><span>Wiki Viki</span></a>
	<nav aria-label="Primary navigation"><a href="/wiki/wiki-viki:recent-changes">Recent Changes</a><a href="/wikify">AI Wiki-Fire</a><a href="/drafts">Drafts</a></nav>
	<form class="nav-search" onsubmit={search}><input bind:value={query} aria-label="Search Wiki Viki" placeholder="Search" /><button aria-label="Search">⌕</button></form>
	<button class="theme-button" onclick={toggleTheme} aria-label="Toggle dark mode">{dark ? '☀' : '☾'}</button>
</div></header>
