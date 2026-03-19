import { useShallow } from 'zustand/react/shallow';
import { useSessionStore } from './sessionStore';

/** 현재 활성 세션 반환 */
export function useActiveSession() {
  return useSessionStore((state) => state.activeSession);
}

/** 현재 세션 단계 반환 */
export function useSessionPhase() {
  return useSessionStore((state) => state.sessionPhase);
}

/** 세션 진행 중 여부 반환 */
export function useIsSessionRunning() {
  return useSessionStore((state) => state.sessionPhase === 'running');
}

/** 선택된 주제 정보 반환 */
export function useSelectedTopic() {
  return useSessionStore(
    useShallow((state) => ({
      id: state.selectedTopicId,
      name: state.selectedTopicName,
    })),
  );
}

/** 완료된 세션 정보 반환 */
export function useCompletedSession() {
  return useSessionStore((state) => state.completedSession);
}
