const rules = [
	['Confidential material', /\bconfidential\b|대외비|기밀/iu],
	['HR or salary information', /\b(?:salary|payroll|compensation|human resources)\b|급여|연봉|인사정보/iu],
	['Employee identifier', /\b(?:employee|staff)\s*(?:id|no\.?|number)\s*[:#-]?\s*[a-z0-9-]{3,}\b|사번\s*[:#-]?\s*[a-z0-9-]+/iu],
	['Personal contact information', /(?:\+?82[- .]?)?0?1[016789][- .]?\d{3,4}[- .]?\d{4}|[\w.+-]+@[\w.-]+\.[a-z]{2,}/iu],
	['Resident registration number', /\b\d{6}-[1-4]\d{6}\b/u]
];

export function regexGovernance(text) {
	const reasons = rules.filter(([, rule]) => rule.test(text)).map(([reason]) => reason);
	return { passed: reasons.length === 0, reasons };
}

export function validHandle(value) {
	return /^(?:Editor-\d{2,}|Operator-[A-Z][A-Z0-9-]*)$/.test(value || '');
}

