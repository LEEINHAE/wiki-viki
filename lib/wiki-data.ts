import type { WikiDocument, WikiRevision, WikiUser } from "../types/wiki";

export const wikiUsers: WikiUser[] = [
  { id: "u-kim", name: "김서윤", department: "설비기술팀", role: "회전기계 책임엔지니어" },
  { id: "u-park", name: "박도현", department: "공정기술팀", role: "열교환기 기술위원" },
  { id: "u-lee", name: "이재민", department: "안전환경팀", role: "PSM·작업허가 관리자" },
  { id: "u-choi", name: "최은아", department: "정비기획팀", role: "예방정비 Planner" },
];

const revision = (
  id: string,
  version: string,
  content: string,
  summary: string,
  author: WikiUser,
  createdAt: string,
): WikiRevision => ({ id, version, content, summary, author, createdAt });

const kim = wikiUsers[0]!;
const park = wikiUsers[1]!;
const lee = wikiUsers[2]!;
const choi = wikiUsers[3]!;

const heatExchanger = `# 개요
**E-101 원료 예열기**는 CDU 전단에서 원료유와 고온 제품의 열을 회수하는 1-2 shell & tube형 [[열교환기]]다. 설계 열부하는 8.4 MW이며 [[예방정비 표준]]의 중요도 A 설비로 관리한다.

## 제원
| 항목 | 값 |
| --- | --- |
| 형식 | TEMA AES, 1 shell / 2 pass |
| 설계압력 | Shell 18 barg / Tube 12 barg |
| 재질 | Shell CS / Tube SA-213 TP316L |
| 전열면적 | 1,240 m² |

## 운전 기준
정상 접근온도는 18~24 ℃다. 30 ℃를 초과하면 fouling 추세와 차압을 함께 확인한다.[^trend: 단일 값보다 7일 이동평균을 우선한다.] Tube-side 유량을 급격히 줄이면 국부 비등이 발생할 수 있다.

## 트러블
### 성능 저하
오염계수 상승, bypass valve passing, 온도계 drift 순으로 확인한다. 세정 전에는 반드시 [[작업허가 절차]]와 [[LOTO 안전규정]]을 적용한다.

### 누설
염소 이온이 높은 유체에서 tube pitting이 반복되었다. 질소 가압 후 비눗물 검사는 ~~빠르고 완벽한 검사~~ 1차 위치 특정 수단일 뿐이며 최종 판정은 helium leak test를 따른다.

## 실무 꿀팁
정지 직후 열화상 이미지를 같은 각도로 저장하면 channeling 비교가 쉽다. 문의는 [[박도현]]에게 연결한다.`;

const pump = `# 개요
**P-204A/B 공정수 이송펌프**는 2×100% 구성의 API 610 OH2 [[원심펌프]]다. A/B를 주 단위로 교번 운전한다.

## 제원
| 항목 | 값 |
| --- | --- |
| 유량 / 양정 | 185 m³/h / 62 m |
| 회전수 | 2,960 rpm |
| 모터 | 55 kW, 440 V |
| Mechanical seal | API Plan 11 |

## 운전 기준
흡입압력 1.8 barg 이상, bearing 진동 4.5 mm/s RMS 이하를 유지한다. 토출밸브 전폐 운전은 30초를 넘기지 않는다.

## 트러블
자갈 끓는 소음과 토출압 요동이 함께 보이면 [[캐비테이션]]을 의심한다. Seal 누유는 [[메카니컬 씰 누설 대응]]에 따라 분류한다.

## 실무 꿀팁
Standby pump의 casing 온도가 올라가면 discharge check valve passing을 먼저 확인한다. 정비 이력은 [[예방정비 표준]]에 따라 남기고, 기술 문의는 [[김서윤]]에게 한다.`;

const exchangerGeneric = `# 개요
열교환기는 온도가 다른 두 유체 사이에서 열을 전달하는 장치다. 사내에는 shell & tube, plate, air-fin 형식이 있다.

## 현장 적용
대표 설비는 [[E-101 원료 예열기]]다. 성능은 열수지, 접근온도, 압력강하를 동시에 검토하며 isolation 시 [[LOTO 안전규정]]을 적용한다.

## 실무 꿀팁
오염 추세는 동일 부하 구간끼리 비교해야 한다. 계기 오차를 fouling으로 오판하지 않도록 센서 검교정일을 확인한다.`;

const centrifugal = `# 개요
원심펌프는 impeller의 회전 에너지를 유체의 압력 에너지로 변환한다. 대표 설비는 [[P-204A/B 공정수 펌프]]다.

## 핵심 개념
운전점은 pump curve와 system curve의 교점이다. 최소연속안정유량 아래에서는 재순환, 진동, [[캐비테이션]] 위험이 커진다.

## 점검
흡입 strainer 차압, 윤활유 상태, coupling alignment, seal flush를 확인한다. 분해 전 [[작업허가 절차]]를 준수한다.`;

const cavitation = `# 개요
캐비테이션은 국부 압력이 증기압 아래로 내려가 기포가 생기고 붕괴하는 현상이다. [[원심펌프]] impeller에 침식과 진동을 유발한다.

## 징후
자갈 소리, 광대역 고주파 진동, 유량 및 토출압 요동이 대표적이다. NPSHa를 다시 계산하고 흡입 strainer와 tank level을 확인한다.

## 조치
가능하면 유량을 낮추고 흡입압력을 높인다. 단, 토출 throttling 후 최소유량 미만이 되지 않게 한다. 반복 발생 시 [[김서윤]]과 운전점 변경을 검토한다.`;

const loto = `# 목적
[[LOTO 안전규정]]은 정비 중 예상하지 못한 에너지 방출을 막기 위한 전사 필수 규정이다. 전기뿐 아니라 압력, 열, 중력, 화학 에너지를 모두 포함한다.

## 절차
1. 에너지원 식별 및 관계자 통보
2. 정상 정지와 격리
3. 개인 잠금장치·꼬리표 부착
4. 잔류 에너지 제거
5. **Zero Energy Verification**
6. 작업 종료 후 인원·공구 확인 및 해제

## 금지사항
타인의 자물쇠를 임의로 제거할 수 없다. 예외 해제는 안전환경팀 승인과 2인 교차 확인이 필요하다.[^exception: 긴급해제 양식 SHE-F-014를 첨부한다.]

## 관련 문서
[[작업허가 절차]], [[예방정비 표준]], [[E-101 원료 예열기]], [[P-204A/B 공정수 펌프]]`;

const permit = `# 개요
작업허가는 비정상 작업의 위험요인을 작업 전 합의하고 통제하는 절차다. 화기, 밀폐공간, 굴착, 고소, 일반 작업으로 구분한다.

## 승인 흐름
작업요청자 → 운전 책임자 → 안전 담당자 순으로 확인한다. 설비 인계 전 [[LOTO 안전규정]]의 Zero Energy Verification을 완료한다.

## 가스 측정
화기 작업은 산소 19.5~23.5%, 가연성가스 10% LEL 미만을 기준으로 한다. 측정 시각과 측정자 서명을 기록한다.

## 현장 팁
허가서는 면책 문서가 아니다. 작업 조건이 바뀌면 즉시 중지하고 재발행한다.`;

const pm = `# 목적
예방정비 표준은 설비 중요도와 고장모드를 기준으로 정비 주기 및 작업 범위를 결정한다.

## 중요도
- A: 생산·안전 영향이 크고 예비기가 없는 핵심 설비
- B: 예비기가 있거나 단기 우회가 가능한 설비
- C: 경미한 보조 설비

## 기록 원칙
측정값은 단위를 포함해 원시값으로 보존한다. “이상 없음”만 기록하지 말고 진동, 온도, 누유량 등 판단 근거를 남긴다.

## 적용 예시
[[E-101 원료 예열기]]는 24개월 주기의 성능 세정, [[P-204A/B 공정수 펌프]]는 월간 진동 route를 적용한다. 격리는 [[LOTO 안전규정]]을 따른다.`;

const seal = `# 개요
메카니컬 씰 누설은 비산, 방울, 연속 흐름으로 구분한다. [[P-204A/B 공정수 펌프]]는 API Plan 11을 사용한다.

## 즉시 조치 기준
인화성·독성 유체는 양과 무관하게 현장 접근을 통제하고 운전 책임자에게 보고한다. 공정수는 분당 30방울 이상이거나 증가 추세면 standby 전환을 준비한다.

## 원인 분석
Seal face 손상뿐 아니라 dry running, piping strain, flush orifice 막힘, [[캐비테이션]]에 의한 축 진동을 함께 확인한다.

## 정비
분해 전 [[작업허가 절차]]와 [[LOTO 안전규정]]을 적용하고 as-found 사진을 남긴다.`;

const profile = `# 프로필
김서윤은 설비기술팀 회전기계 책임엔지니어로, API 610 pump와 mechanical seal 신뢰성 개선을 담당한다.

## 전문 분야
- [[원심펌프]] 성능 진단 및 운전점 최적화
- 진동 spectrum 분석
- [[캐비테이션]]과 seal 조기 고장 RCA

## 담당 설비
[[P-204A/B 공정수 펌프]], P-310 charge pump, K-201 recycle compressor

## 협업 가이드
기술 검토 요청에는 최근 7일 trend, P&ID mark-up, 정비 이력을 첨부하면 빠른 답변이 가능하다.`;

const parkProfile = `# 프로필
박도현은 공정기술팀 열교환기 기술위원이다. 공정 열통합, fouling 분석, turnaround 세정 범위 최적화를 담당한다.

## 전문 분야
- [[열교환기]] 열수지와 성능시험
- Tube failure 원인 분석
- 세정 전후 경제성 평가

## 담당 설비
[[E-101 원료 예열기]], E-105 overhead condenser, A-301 air cooler`;

const makeDoc = (input: Omit<WikiDocument, "revisions"> & { prior?: string }): WikiDocument => {
  const revisions = [
    revision(`${input.id}-r2`, input.version, input.content, "현장 피드백 및 링크 최신화", input.author, input.updatedAt),
  ];
  if (input.prior) {
    revisions.push(revision(`${input.id}-r1`, "1.0", input.prior, "최초 문서 작성", input.author, "2026-06-12T04:30:00.000Z"));
  }
  return { ...input, revisions };
};

export const wikiDocuments: WikiDocument[] = [
  makeDoc({ id: "e101", slug: "E-101-원료-예열기", title: "E-101 원료 예열기", aliases: ["E-101", "원료 예열기"], summary: "CDU 원료유의 폐열을 회수하는 핵심 shell & tube 열교환기", content: heatExchanger, prior: heatExchanger.replace("18~24 ℃", "20~25 ℃").replace("8.4 MW", "8.1 MW"), categories: ["플랜트 설비", "정적기기", "CDU"], tags: ["TEMA", "fouling", "열회수"], author: park, updatedAt: "2026-08-22T06:42:00.000Z", version: "1.4", viewCount: 2841, infobox: { title: "E-101 원료 예열기", subtitle: "원료 예열기", accent: "#00a495", rows: [{ label: "설비번호", value: "E-101" }, { label: "형식", value: "TEMA AES" }, { label: "중요도", value: "A / 생산핵심" }, { label: "담당", value: "박도현", link: "박도현" }, { label: "최근 검사", value: "2026-04-18" }] } }),
  makeDoc({ id: "p204", slug: "P-204A-B-공정수-펌프", title: "P-204A/B 공정수 펌프", aliases: ["P-204", "P-204A", "P-204B"], summary: "API 610 OH2 공정수 이송펌프의 운전·정비 지식", content: pump, prior: pump.replace("4.5 mm/s RMS", "5.0 mm/s RMS"), categories: ["플랜트 설비", "회전기계", "Utility"], tags: ["API 610", "pump", "seal"], author: kim, updatedAt: "2026-08-23T01:15:00.000Z", version: "2.1", viewCount: 3920, infobox: { title: "P-204A/B", subtitle: "공정수 이송펌프", accent: "#00a495", rows: [{ label: "형식", value: "API 610 OH2" }, { label: "용량", value: "185 m³/h" }, { label: "양정", value: "62 m" }, { label: "중요도", value: "B" }, { label: "담당", value: "김서윤", link: "김서윤" }] } }),
  makeDoc({ id: "hx", slug: "열교환기", title: "열교환기", aliases: ["Heat Exchanger", "HX"], summary: "유체 사이의 열을 전달하는 정적기기", content: exchangerGeneric, categories: ["플랜트 설비", "정적기기"], tags: ["열전달", "정적기기"], author: park, updatedAt: "2026-08-11T03:20:00.000Z", version: "1.2", viewCount: 1780 }),
  makeDoc({ id: "centrifugal", slug: "원심펌프", title: "원심펌프", aliases: ["Centrifugal Pump"], summary: "원심력을 이용하는 대표적인 동적 펌프", content: centrifugal, categories: ["플랜트 설비", "회전기계"], tags: ["pump", "NPSH"], author: kim, updatedAt: "2026-08-10T09:00:00.000Z", version: "1.3", viewCount: 2154 }),
  makeDoc({ id: "cavitation", slug: "캐비테이션", title: "캐비테이션", aliases: ["Cavitation", "공동현상"], summary: "저압부의 기포 생성과 붕괴로 발생하는 손상 현상", content: cavitation, categories: ["고장모드", "회전기계"], tags: ["NPSH", "진동", "RCA"], author: kim, updatedAt: "2026-08-19T07:32:00.000Z", version: "1.5", viewCount: 4260 }),
  makeDoc({ id: "loto", slug: "LOTO-안전규정", title: "LOTO 안전규정", aliases: ["LOTO", "에너지 차단"], summary: "정비 작업 중 위험 에너지의 격리·잠금·검증 기준", content: loto, prior: loto.replace("2인 교차 확인", "관리자 확인"), categories: ["사내 규정", "안전", "PSM"], tags: ["필수", "에너지격리", "SHE"], author: lee, updatedAt: "2026-08-20T00:05:00.000Z", version: "3.2", viewCount: 8344, infobox: { title: "LOTO 안전규정", subtitle: "SHE-P-014", accent: "#d97706", rows: [{ label: "문서등급", value: "전사 필수" }, { label: "주관부서", value: "안전환경팀" }, { label: "시행일", value: "2026-07-01" }, { label: "검토주기", value: "12개월" }] } }),
  makeDoc({ id: "permit", slug: "작업허가-절차", title: "작업허가 절차", aliases: ["작업허가서", "Work Permit"], summary: "비정상 작업의 위험성 평가와 승인 절차", content: permit, categories: ["사내 규정", "안전", "PSM"], tags: ["작업허가", "가스측정"], author: lee, updatedAt: "2026-08-17T05:40:00.000Z", version: "2.6", viewCount: 6102 }),
  makeDoc({ id: "pm", slug: "예방정비-표준", title: "예방정비 표준", aliases: ["PM 표준", "예방정비"], summary: "설비 중요도 기반의 예방정비 계획·수행·기록 원칙", content: pm, categories: ["사내 규정", "정비"], tags: ["PM", "SAP", "신뢰성"], author: choi, updatedAt: "2026-08-16T02:10:00.000Z", version: "2.0", viewCount: 3019 }),
  makeDoc({ id: "seal", slug: "메카니컬-씰-누설-대응", title: "메카니컬 씰 누설 대응", aliases: ["Seal 누설", "Mechanical Seal Leak"], summary: "펌프 seal 누설의 등급 분류와 현장 대응 기준", content: seal, categories: ["정비 지침", "회전기계"], tags: ["seal", "누유", "RCA"], author: kim, updatedAt: "2026-08-21T08:24:00.000Z", version: "1.7", viewCount: 2875 }),
  makeDoc({ id: "kim", slug: "김서윤", title: "김서윤", aliases: ["김서윤 책임"], summary: "설비기술팀 회전기계 책임엔지니어", content: profile, categories: ["실무자", "설비기술팀"], tags: ["회전기계", "RCA"], author: kim, updatedAt: "2026-08-08T04:00:00.000Z", version: "1.1", viewCount: 982, infobox: { title: "김서윤", subtitle: "회전기계 책임엔지니어", rows: [{ label: "소속", value: "설비기술팀" }, { label: "전문", value: "Pump · Seal · 진동" }, { label: "내선", value: "3472" }, { label: "근무지", value: "울산 2공장" }] } }),
  makeDoc({ id: "park", slug: "박도현", title: "박도현", aliases: ["박도현 위원"], summary: "공정기술팀 열교환기 기술위원", content: parkProfile, categories: ["실무자", "공정기술팀"], tags: ["열교환기", "fouling"], author: park, updatedAt: "2026-08-07T06:30:00.000Z", version: "1.0", viewCount: 715 }),
];

export const wikiDictionary = wikiDocuments.flatMap((document) => [document.title, ...document.aliases]);

export const getSeedDocument = (titleOrSlug: string): WikiDocument | undefined => {
  const key = decodeURIComponent(titleOrSlug).trim().toLocaleLowerCase("ko-KR");
  return wikiDocuments.find((document) =>
    [document.slug, document.title, ...document.aliases].some(
      (candidate) => candidate.toLocaleLowerCase("ko-KR") === key,
    ),
  );
};
