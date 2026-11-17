// src/stores/recruitPost.ts
// 모집글(AI 초안) 임시 저장소.
// TODO: 서버에 모집글 본문 필드가 생기면 이 파일을 API 호출로 교체해요.
//       지금은 이 브라우저(localStorage)에만 저장돼서 다른 기기·다른 사람에게는 안 보여요.
const KEY = 'gopick:recruit-posts';

type PostMap = Record<string, string>;

function readAll(): PostMap {
  try {
    const raw = localStorage.getItem(KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? (parsed as PostMap) : {};
  } catch {
    return {};
  }
}

/** 프로젝트의 모집글. 없으면 null */
export function getRecruitPost(projectId: number | string): string | null {
  return readAll()[String(projectId)] ?? null;
}

/** 모집글 저장. 비어 있으면 지워요 */
export function saveRecruitPost(projectId: number | string, text: string | null) {
  const all = readAll();
  const value = text?.trim();
  if (value) all[String(projectId)] = value;
  else delete all[String(projectId)];
  try {
    localStorage.setItem(KEY, JSON.stringify(all));
  } catch {
    // 저장소를 못 쓰는 환경이면 조용히 건너뜀 (등록 자체는 그대로 진행)
  }
}

export interface ParsedPost {
  /** 첫 줄 (예: "[웹 · 포트폴리오] Vocarchive 팀원을 모집해요") */
  title: string;
  /** 제목 바로 아래 한 줄 소개 */
  summary: string;
  /** "■ 제목" 으로 시작하는 단락들 */
  sections: { heading: string; body: string }[];
}

/** 저장된 모집글 글을 화면용 구조로 나눠요. 형식이 달라도 제목만 있는 글로 처리해요 */
export function parseRecruitPost(text: string): ParsedPost {
  const paragraphs = text
    .split(/\n{2,}/)
    .map((p) => p.trim())
    .filter(Boolean);
  const [title = '', ...rest] = paragraphs;
  const post: ParsedPost = { title, summary: '', sections: [] };

  for (const p of rest) {
    if (p.startsWith('■')) {
      const [first, ...lines] = p.split('\n');
      post.sections.push({ heading: first.replace(/^■\s*/, '').trim(), body: lines.join('\n').trim() });
    } else if (post.sections.length === 0 && !post.summary) {
      post.summary = p;
    } else if (post.sections.length > 0) {
      const last = post.sections[post.sections.length - 1];
      last.body = `${last.body}\n\n${p}`.trim();
    } else {
      post.summary = `${post.summary}\n\n${p}`;
    }
  }
  return post;
}
