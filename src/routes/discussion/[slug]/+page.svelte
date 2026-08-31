<script>let { data, form } = $props();</script>
<div class="form-page"><section class="wiki-form"><header class="document-header"><h1>Discussion: {data.document.title}</h1><div class="document-meta">Discuss changes before editing contested content.</div></header>
	<nav class="document-actions"><a href={`/wiki/${data.document.slug}`}>Read</a><a href={`/edit/${data.document.slug}`}>Edit</a><a href={`/history/${data.document.slug}`}>History</a></nav>
	{#if form?.message}<div class="notice warning">{form.message}</div>{/if}{#if form?.success}<div class="notice">Thread posted.</div>{/if}
	{#each data.threads as thread}<article class="thread"><div class="thread-head"><b>{thread.thread_title}</b><span>{thread.editor_handle} · {new Date(thread.created_at).toLocaleString()}</span></div><div class="thread-body">{thread.body}</div></article>{:else}<p class="muted">There are no threads. Start the first discussion below.</p>{/each}
	<h2>Start a thread</h2><form method="POST"><div class="field"><label for="title">Subject</label><input id="title" name="title" value={form?.title ?? ''} required /></div><div class="field"><label for="body">Comment</label><textarea id="body" name="body" style="min-height:130px" required>{form?.body ?? ''}</textarea></div><div class="field"><label for="editor">Anonymous handle</label><input id="editor" name="editor" value={form?.editor ?? 'Editor-01'} required /></div><div class="button-row"><button class="primary-button">Post thread</button></div></form>
</section></div>

