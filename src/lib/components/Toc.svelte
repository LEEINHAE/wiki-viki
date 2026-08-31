<script>let { items = [] } = $props();</script>
{#if items.length}<nav class="toc" aria-label="Table of contents"><div class="toc-title">Contents <span>[hide]</span></div><ol>
	{#each items as item}<li style={`--toc-level:${item.level}`}><a href={`#${item.id}`}><span>{item.number}.</span> {item.title}</a></li>{/each}
</ol></nav>{/if}
