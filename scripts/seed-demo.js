import postgres from 'postgres';

if (!process.env.DATABASE_URL) throw new Error('DATABASE_URL is required.');

const sql = postgres(process.env.DATABASE_URL, { max: 1 });
const editor = 'Operator-A';
const slugify = (value) =>
	value
		.trim()
		.replace(/[\s_]+/g, '-')
		.replace(/[^\p{L}\p{N}:.~-]/gu, '')
		.replace(/-+/g, '-')
		.toLowerCase();

const documents = [
	{
		title: 'Sample:Equipment Handover Procedure',
		aliases: ['Sample:Equipment Transfer'],
		content: `# Equipment Handover Procedure

이 문서는 공용 장비를 교대조 사이에서 인계하는 예시 절차다. 실제 업무에 적용하기 전 담당 조직의 검토가 필요하다.

## Before handover

1. 장비 외관에 손상이 없는지 확인한다.
2. 부속품 목록과 실제 수량을 비교한다.
3. 장비의 현재 상태를 인계 기록에 남긴다.

> 이상이 발견된 장비는 사용하지 않고 점검 대기 상태로 구분한다.

## During handover

인수자는 장비 표식과 인계 기록을 비교하고 상태를 확인한다. 관련 작업은 [[Sample:Shift Handover Checklist]]를 함께 참고한다.

## After handover

장비는 사용하지 않을 때 지정된 보관 위치에 둔다. 고장이 의심되면 [[Sample:Maintenance Request Process]]에 따라 점검을 요청한다.[^1]

[^1]: 이 문서는 기능 확인을 위한 샘플이며 실제 운영 규정이 아니다.`
	},
	{
		title: 'Sample:Shift Handover Checklist',
		aliases: ['Sample:Shift Checklist'],
		content: `# Shift Handover Checklist

## Checklist

| Item | Check | Note |
| --- | --- | --- |
| Work status | 진행 중인 작업 확인 | 다음 조치 기록 |
| Equipment | 공용 장비 상태 확인 | [[Sample:Equipment Handover Procedure]] 참고 |
| Workspace | 정리 상태 확인 | 장애물 제거 |
| Open issues | 미해결 항목 확인 | 담당 역할 지정 |

## Handover note format

아래와 같은 간결한 형식을 사용한다.

\`\`\`text
Status: In progress
Next action: Inspect equipment
Owner: Operator-A
\`\`\`

~~구두로만 전달~~하지 않고 추적 가능한 기록을 남긴다.`
	},
	{
		title: 'Sample:Maintenance Request Process',
		aliases: ['Sample:Repair Request', 'Sample:Maintenance Ticket'],
		content: `# Maintenance Request Process

장비 이상을 발견했을 때 점검 요청을 등록하고 결과를 추적하는 예시 프로세스다.

## 1. Identify the issue

증상, 발생 시점, 장비 상태를 확인한다. 개인정보나 제한된 정보는 기록하지 않는다.

## 2. Make the equipment safe

안전하게 분리할 수 있는 경우 장비를 사용 대기 영역에서 분리하고 **Inspection Pending**으로 표시한다.

## 3. Submit the request

요청에는 다음 정보만 포함한다.

* 장비 유형
* 관찰된 증상
* 요청 시각
* 익명 작업자 Handle

## 4. Close the request

점검 완료 후 결과를 기록하고 [[Sample:Equipment Handover Procedure]]에 따라 장비를 다시 인계한다.`
	},
	{
		title: 'Sample:Steam System Overview',
		aliases: ['Sample:Steam Overview'],
		content: `# Steam System Overview

이 문서는 Wiki 문법과 문서 연결을 보여주기 위한 일반적인 예시다. 특정 설비의 운전 기준을 제공하지 않는다.

## Components

| Component | General role |
| --- | --- |
| Boiler | 물에 열을 전달해 증기를 생성한다. |
| Header | 여러 사용 지점으로 증기를 분배한다. |
| Steam trap | 응축수 배출을 돕는다. |
| Condensate return | 회수된 응축수를 이동시킨다. |

## Documentation

설비별 절차에는 검증된 운전 범위와 점검 주기를 별도로 기록해야 한다. 용어는 [[Sample:Operations Glossary]]를 참고한다.

> 실제 설비를 조작할 때는 승인된 현장 절차를 우선한다.`
	},
	{
		title: 'Sample:Operations Glossary',
		aliases: ['Sample:Operating Terms'],
		content: `# Operations Glossary

## Handover

작업 상태, 장비, 미해결 항목을 다음 작업자에게 전달하는 과정. [[Sample:Shift Handover Checklist]] 참고.

## Inspection Pending

점검이 끝날 때까지 사용해서는 안 되는 상태를 나타내는 예시 표식.

## Revision

Wiki 문서가 저장될 때 생성되는 변경 기록. 각 Revision에는 시간, 익명 Editor Handle, 변경 요약이 포함된다.

## Redirect

다른 표현이나 별칭으로 접근했을 때 대표 문서로 연결하는 기능.`
	}
];

try {
	for (const item of documents) {
		await sql.begin(async (tx) => {
			const slug = slugify(item.title);
			const [existing] = await tx`SELECT id,content FROM documents WHERE slug=${slug}`;
			const [document] = await tx`
				INSERT INTO documents (slug,title,content,editor_handle)
				VALUES (${slug},${item.title},${item.content},${editor})
				ON CONFLICT (slug) DO UPDATE SET title=EXCLUDED.title,content=EXCLUDED.content,editor_handle=EXCLUDED.editor_handle,updated_at=CASE WHEN documents.content IS DISTINCT FROM EXCLUDED.content THEN NOW() ELSE documents.updated_at END
				RETURNING id`;
			if (!existing || existing.content !== item.content) {
				await tx`INSERT INTO revisions (document_id,content,editor_handle,summary) VALUES (${document.id},${item.content},${editor},'Demo document seed')`;
			}
			for (const alias of item.aliases) {
				await tx`INSERT INTO redirects (alias_slug,alias_title,document_id) VALUES (${slugify(alias)},${alias},${document.id}) ON CONFLICT (alias_slug) DO UPDATE SET alias_title=EXCLUDED.alias_title,document_id=EXCLUDED.document_id`;
			}
		});
		console.log(`Seeded ${item.title}`);
	}
	console.log(`Seeded ${documents.length} demo documents.`);
} finally {
	await sql.end();
}
