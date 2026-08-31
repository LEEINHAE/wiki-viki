import { error, fail } from '@sveltejs/kit';
import { db } from '$lib/server/db.js';
import { getDocument } from '$lib/server/wiki.js';
import { validHandle, regexGovernance } from '$lib/server/governance.js';

export async function load({ params }) {
	const result = await getDocument(params.slug); if (!result) error(404, 'Document not found');
	const threads = await db()`SELECT * FROM discussions WHERE document_id=${result.document.id} ORDER BY created_at DESC`;
	return { document: result.document, threads };
}
export const actions = { default: async ({ request, params }) => {
	const form = await request.formData(); const title = form.get('title')?.toString().trim(); const body = form.get('body')?.toString().trim(); const editor = form.get('editor')?.toString().trim();
	if (!title || !body || !validHandle(editor)) return fail(400, { message: 'Complete every field and use an anonymous editor handle.', title, body, editor });
	const governance = regexGovernance(`${title}\n${body}`); if (!governance.passed) return fail(400, { message: `Blocked by governance: ${governance.reasons.join(', ')}`, title, body, editor });
	const result = await getDocument(params.slug); if (!result) return fail(404);
	await db()`INSERT INTO discussions (document_id,thread_title,body,editor_handle) VALUES (${result.document.id},${title},${body},${editor})`;
	return { success: true };
} };

