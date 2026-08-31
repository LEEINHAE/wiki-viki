import { json } from '@sveltejs/kit';
import { parseUpload } from '$lib/server/parser.js';
import { structureDocument, semanticGovernance } from '$lib/server/openai.js';
import { regexGovernance, validHandle } from '$lib/server/governance.js';
import { db } from '$lib/server/db.js';
import { autoLinkDocument, slugify } from '$lib/server/wiki.js';

export async function POST({ request }) {
	try {
		const form = await request.formData(); const file = form.get('file'); const editor = form.get('editor')?.toString();
		if (!(file instanceof File) || !file.size) return json({ message: 'Choose a DOCX or PDF.' }, { status: 400 });
		if (file.size > 10 * 1024 * 1024) return json({ message: 'Files must be 10 MB or smaller.' }, { status: 413 });
		if (!validHandle(editor)) return json({ message: 'Use an anonymous editor handle.' }, { status: 400 });
		const text = await parseUpload(file); if (!text) return json({ message: 'No text could be extracted. OCR is not supported.' }, { status: 422 });
		const regex = regexGovernance(text); const semantic = regex.passed ? await semanticGovernance(text) : { passed: false, reasons: ['Skipped because keyword screening failed.'] };
		const structured = await structureDocument(text, file.name);
		let content = structured.sections.map((section) => `## ${section.heading}\n\n${section.content}`).join('\n\n');
		content = await autoLinkDocument(content, structured.suggestedLinks);
		const governance = { passed: regex.passed && semantic.passed, regex, semantic };
		const [draft] = await db()`INSERT INTO drafts (title,slug,content,source_name,aliases,governance,status,editor_handle) VALUES (${structured.title},${slugify(structured.title)},${content},${file.name},${db().json(structured.aliases)},${db().json(governance)},${governance.passed ? 'review' : 'blocked'},${editor}) RETURNING id,title,status`;
		return json(draft, { status: 201 });
	} catch (error) { return json({ message: error.message || 'Could not create draft.' }, { status: 500 }); }
}
