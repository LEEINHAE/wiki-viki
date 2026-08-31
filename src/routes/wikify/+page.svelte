<script>
	let uploading = $state(false);
	let result = $state(null);
	let problem = $state('');
	async function submit(event) {
		event.preventDefault();
		uploading = true;
		problem = '';
		result = null;
		const response = await fetch('/api/wikify', {
			method: 'POST',
			body: new FormData(event.currentTarget)
		});
		const payload = await response.json();
		uploading = false;
		if (!response.ok) problem = payload.message;
		else result = payload;
	}
</script>

<svelte:head><title>AI Wiki-Fire — Wiki Viki</title></svelte:head>
<div class="form-page">
	<section class="wiki-form">
		<header class="document-header">
			<h1>AI Wiki-Fire</h1>
			<div class="document-meta">Upload → Parse → AI Structure → Governance → Draft</div>
		</header>
		<div class="notice">
			<strong>Human review is mandatory.</strong> AI output is saved as a draft and is never published
			automatically.
		</div>
		<form onsubmit={submit}>
			<div class="upload-zone">
				<p><b>Choose a DOCX or text-based PDF</b></p>
				<input
					name="file"
					type="file"
					accept=".docx,.pdf,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
					required
				/>
				<p class="muted">OCR and scanned PDFs are not supported. Maximum 10 MB.</p>
			</div>
			<div class="field">
				<label for="editor">Anonymous owner handle</label><input
					id="editor"
					name="editor"
					value="Editor-01"
					required
				/>
			</div>
			<div class="button-row">
				<button class="primary-button" disabled={uploading}
					>{uploading ? 'Building draft…' : 'Create draft'}</button
				>
			</div>
		</form>
		{#if problem}<div class="notice warning">{problem}</div>{/if}{#if result}<div class="notice">
				<b>Draft created:</b>
				{result.title}. <a href={`/drafts?open=${result.id}`}>Review this draft →</a>
			</div>{/if}
	</section>
</div>
