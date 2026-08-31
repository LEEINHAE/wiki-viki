<script>let { changes = [] } = $props();</script>
<aside class="recent-sidebar"><h2>Recent Changes</h2><ul>
	{#each changes as item}<li><a href={`/wiki/${item.slug}`}>{item.title}</a><time>{new Date(item.updated_at).toLocaleDateString('en-CA', { month: '2-digit', day: '2-digit' })}</time></li>
	{:else}<li class="muted">No recent changes.</li>{/each}
</ul><a class="aside-more" href="/wiki/wiki-viki:recent-changes">View all changes →</a></aside>
