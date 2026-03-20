import { create } from 'zustand';
import type { Session } from '../../../domain/sessions/session';

/** UI 흐름 제어용 세션 단계 */
export type SessionPhase = 'idle' | 'running' | 'completed' | 'interrupted';

interface SessionState {
  activeSession: Session | null;
  sessionPhase: SessionPhase;
  selectedTopicId: string | null;
  selectedTopicName: string | null;
  completedSession: Session | null;
  lastCompletedAtMs: number | null;

  startSession: (session: Session) => void;
  endSession: (session: Session) => void;
  interruptCurrentSession: (session: Session) => void;
  setSelectedTopic: (id: string | null, name: string | null) => void;
  reset: () => void;
}

const initialState = {
  activeSession: null,
  sessionPhase: 'idle' as SessionPhase,
  selectedTopicId: null,
  selectedTopicName: null,
  completedSession: null,
  lastCompletedAtMs: null as number | null,
};

export const useSessionStore = create<SessionState>((set) => ({
  ...initialState,

  startSession: (session: Session) =>
    set({ activeSession: session, sessionPhase: 'running', completedSession: null }),

  endSession: (session: Session) =>
    set({
      activeSession: session,
      sessionPhase: 'completed',
      completedSession: session,
      lastCompletedAtMs: Date.now(),
    }),

  interruptCurrentSession: (session: Session) =>
    set({
      sessionPhase: 'interrupted',
      completedSession: session,
      lastCompletedAtMs: Date.now(),
    }),

  setSelectedTopic: (id: string | null, name: string | null) =>
    set({ selectedTopicId: id, selectedTopicName: name }),

  reset: () =>
    set({
      ...initialState,
      lastCompletedAtMs: useSessionStore.getState().lastCompletedAtMs,
    }),
}));
