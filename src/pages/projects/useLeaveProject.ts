// src/pages/projects/useLeaveProject.ts
// 프로젝트 나가기 처리 (프로젝트 목록과 프로젝트 수정 화면이 같이 써요)
import { ApiError, ERROR_CODE, projectsApi, type ProjectData } from '../../api';
import { myMembership } from '../../api/mappers/project';
import { useToast } from '../../components/common/Toast';
import { notifyLeaderOfLeave } from './notifyLeave';

function errorText(e: unknown, fallback: string) {
  if (!(e instanceof ApiError)) return fallback;
  if (e.code === ERROR_CODE.PROJECT_ACCESS_DENIED) return '이 작업은 팀 구성원만 할 수 있어요';
  if (e.code === ERROR_CODE.INVALID_PROJECT_STATE) return '지금 프로젝트 상태에서는 할 수 없는 작업이에요';
  if (e.code === ERROR_CODE.PROJECT_NOT_FOUND) return '더 이상 없는 프로젝트예요';
  return fallback;
}

interface Options {
  myProfileId: number | null | undefined;
  /** 나간 팀원 이름으로 팀장 알림에 쓰여요 */
  author: string;
  /** 나가기가 끝난 뒤 화면을 새로 고치는 동작 */
  onDone: () => void;
}

/** 두 함수 모두 성공하면 true를 돌려줘서, 모달이 닫혀도 되는지 알 수 있어요 */
export function useLeaveProject({ myProfileId, author, onDone }: Options) {
  const toast = useToast();

  /** 그냥 나가기. 모집 중 팀장이 나가면 서버가 모집글을 삭제해요 */
  const leave = async (p: ProjectData): Promise<boolean> => {
    const { isLeader } = myMembership(p, myProfileId);
    const deletesRecruit = isLeader && p.lifecycleStatus === 'PREPARING';
    try {
      await projectsApi.leave(p.projectId);
    } catch (e) {
      toast(errorText(e, '프로젝트에서 나가지 못했어요'));
      return false;
    }
    // 팀원이 나가면 팀장에게 알려요 (팀장이 나갈 때는 알릴 대상이 없어요)
    if (!isLeader) {
      void notifyLeaderOfLeave({ projectId: String(p.projectId), projectTitle: p.title, memberName: author });
    }
    toast(deletesRecruit ? '모집글을 삭제하고 프로젝트에서 나왔어요' : '프로젝트에서 나왔어요');
    onDone();
    return true;
  };

  /** 팀장을 넘긴 뒤 나가기 (진행 중 팀장) */
  const delegateAndLeave = async (p: ProjectData, targetProfileId: number): Promise<boolean> => {
    try {
      await projectsApi.delegateLeader(p.projectId, targetProfileId);
    } catch (e) {
      toast(errorText(e, '팀장을 넘기지 못했어요'));
      return false;
    }
    try {
      await projectsApi.leave(p.projectId);
      toast('팀장을 넘기고 프로젝트에서 나왔어요');
    } catch (e) {
      // 팀장은 이미 넘어간 상태라서, 화면을 다시 불러와 현재 상태를 보여줘요
      toast(errorText(e, '팀장은 넘겼지만 프로젝트에서 나가지 못했어요. 다시 시도해 주세요'));
    }
    onDone();
    return true;
  };

  return { leave, delegateAndLeave };
}
