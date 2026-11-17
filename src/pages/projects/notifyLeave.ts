// src/pages/projects/notifyLeave.ts

export interface LeaveNotice {
  projectId: string;
  projectTitle: string;
  /** 나간 팀원의 이름 */
  memberName: string;
}

/**
 * 팀원이 프로젝트에서 나갔을 때 팀장에게 알려요. (팀장이 나갈 때는 부르지 않아요)
 *
 * TODO: 알림 API가 아직 없어서 지금은 아무 일도 하지 않아요. 자리만 만들어 둔 상태예요.
 *  - 서버가 하차 API(DELETE /projects/{id}/members/me)에서 팀장 알림을 직접 만들어 주면, 이 함수와 호출부를 지우면 돼요.
 *  - 프론트에서 보내야 한다면 알림 API가 정해진 뒤 여기서 호출해요.
 */
export async function notifyLeaderOfLeave(notice: LeaveNotice): Promise<void> {
  void notice;
}
