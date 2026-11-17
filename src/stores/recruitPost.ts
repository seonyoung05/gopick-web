// src/stores/recruitPost.ts
// 모집글 본문(서버 post) → 모집글 보기 모달용 구조로 나누기
// 서버 AI 모집글 형식: 제목 → 한 줄 소개 → "■ 소제목" 단락들 → "■ 이런 분과 함께하고 싶어요" 목록
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
