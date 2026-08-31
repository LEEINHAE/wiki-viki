<script>
	import RecentSidebar from '$lib/components/RecentSidebar.svelte';
	let { data } = $props();
</script>
<svelte:head><title>Wiki Viki — Main Page</title><meta name="description" content="Wiki Viki internal knowledge base" /></svelte:head>
<div class="site-grid"><main class="wiki-paper main-page">
	<header class="document-header home-header"><div class="home-wordmark"><span>W</span><div><h1>Wiki Viki</h1><p>The internal wiki anyone can improve.</p></div></div>
		<form class="hero-search" method="GET"><input name="q" value={data.q} aria-label="Search documents" placeholder="Search Wiki Viki" /><button>Search</button></form></header>
	{#if !data.databaseReady}<div class="notice warning"><strong>Setup required:</strong> Connect PostgreSQL and run <code>bun run migrate</code>. The interface is ready, but live content is unavailable.</div>{/if}
	{#if data.q}<section class="main-section"><h2>Search results for “{data.q}”</h2><ul class="document-list">{#each data.results as doc}<li><a href={`/wiki/${doc.slug}`}>{doc.title}</a><time>{new Date(doc.updated_at).toLocaleString()}</time></li>{:else}<li>No matching document. <a class="missing" href={`/edit/${encodeURIComponent(data.q)}`}>Create this page</a></li>{/each}</ul></section>{/if}
	<section class="welcome-panel"><h2>Welcome to Wiki Viki</h2><p>Wiki Viki is the shared knowledge base for policies, systems, terminology, and working practices. Search first; if something is missing, create it.</p><div class="portal-links">
		<a href="/wiki/wiki-viki:basic-policy"><b>About</b><span>Purpose and principles</span></a><a href="/wiki/wiki-viki:editing-guidelines"><b>Policies</b><span>Editing standards</span></a><a href="/wikify"><b>AI Wiki-Fire</b><span>Convert a DOCX or PDF</span></a><a href="/drafts"><b>Review Drafts</b><span>Review before publishing</span></a><a href="/wiki/wiki-viki:help"><b>Help</b><span>Syntax and contribution guide</span></a>
	</div></section>
	<div class="main-columns"><section class="main-section"><h2>Major Announcements</h2><ul class="bullet-list">{#each data.announcements as item}<li><span class="tag">Notice</span><b>{item.title}</b><time>{new Date(item.created_at).toLocaleDateString()}</time></li>{:else}<li>There are no announcements.</li>{/each}</ul></section>
	<section class="main-section"><h2>Recent Discussions</h2><ul class="bullet-list">{#each data.discussions as item}<li><a href={`/discussion/${item.slug}`}>{item.thread_title}</a><small>on {item.document_title}</small></li>{:else}<li>No discussion threads yet.</li>{/each}</ul></section></div>
</main><RecentSidebar changes={data.changes} /></div>
