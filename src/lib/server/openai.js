import OpenAI from 'openai';
import { env } from '$env/dynamic/private';

export async function structureDocument(sourceText, sourceName = 'Uploaded document') {
	if (!env.OPENAI_API_KEY) return fallbackStructure(sourceText, sourceName);
	const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
	const response = await openai.responses.create({
		model: env.OPENAI_MODEL || 'gpt-5-mini',
		input: [
			{ role: 'system', content: 'Transform only the supplied text into a concise internal wiki article. Never add facts. Mark uncertain material [Needs Review]. Return JSON.' },
			{ role: 'user', content: `Source: ${sourceName}\n\n${sourceText}` }
		],
		text: {
			format: {
				type: 'json_schema',
				name: 'wiki_document',
				strict: true,
				schema: {
					type: 'object', additionalProperties: false,
					required: ['title', 'sections', 'suggestedLinks', 'aliases'],
					properties: {
						title: { type: 'string' },
						sections: { type: 'array', items: { type: 'object', additionalProperties: false, required: ['heading', 'content'], properties: { heading: { type: 'string' }, content: { type: 'string' } } } },
						suggestedLinks: { type: 'array', items: { type: 'string' } },
						aliases: { type: 'array', items: { type: 'string' } }
					}
				}
			}
		}
	});
	return JSON.parse(response.output_text);
}

export async function semanticGovernance(text) {
	if (!env.OPENAI_API_KEY) return { passed: true, reasons: [], skipped: true };
	const openai = new OpenAI({ apiKey: env.OPENAI_API_KEY });
	const response = await openai.responses.create({
		model: env.OPENAI_MODEL || 'gpt-5-mini',
		input: `Check this text for real names, personal identifiers, private contact details, HR/salary data, or confidential material. Return JSON only: {"passed":boolean,"reasons":string[]}\n\n${text}`
	});
	try { return JSON.parse(response.output_text); } catch { return { passed: false, reasons: ['Semantic governance returned an invalid result.'] }; }
}

function fallbackStructure(text, filename) {
	const clean = text.trim();
	const first = clean.split(/\n+/)[0]?.replace(/^#+\s*/, '').slice(0, 100);
	return { title: first || filename.replace(/\.(docx|pdf)$/i, ''), sections: [{ heading: 'Overview', content: clean }], suggestedLinks: [], aliases: [] };
}

