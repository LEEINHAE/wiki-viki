<script>
	import RecentSidebar from '$lib/components/RecentSidebar.svelte';
	import Toc from '$lib/components/Toc.svelte';
	let { data } = $props();
</script>

<svelte:head><title>{data.missing ? 'Page not found' : data.document.title} — Wiki Viki</title></svelte:head>
<div class="site-grid"><main class="wiki-paper">
	{#if data.missing}
		<header class="document-header"><h1>{decodeURIComponent(data.slug).replaceAll('-', ' ')}</h1><div class="document-meta">This document does not exist.</div></header>
		<div class="notice warning">The page you requested has not been created. Check the title or start this document.</div>
		<div class="button-row"><a class="primary-button" href={`/edit/${data.slug}`}>Create document</a></div>
	{:else}
		<header class="document-header"><h1>{data.document.title}</h1><div class="document-meta"><span>Last modified {new Date(data.document.updated_at).toLocaleString()}</span><span>by {data.document.editor_handle}</span></div></header>
		<nav class="document-actions"><a href={`/edit/${data.document.slug}`}>Edit</a><a href={`/history/${data.document.slug}`}>History</a><a href={`/discussion/${data.document.slug}`}>Discussion</a></nav>
		{#if data.redirectedFrom}<div class="redirect-notice">Redirected from <b>{data.redirectedFrom}</b>.</div>{/if}
		<Toc items={data.toc} />
		<article class="wiki-content">{@html data.html}</article>
		<section class="backlinks"><h2>Backlinks</h2>{#if data.backlinks.length}<ul>{#each data.backlinks as item}<li><a href={`/wiki/${item.slug}`}>{item.title}</a></li>{/each}</ul>{:else}<p class="muted">No pages link here.</p>{/if}</section>
	{/if}
</main><RecentSidebar changes={data.changes} /></div>

