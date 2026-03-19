import { create } from 'zustand';
const initialState = {
    activeSession: null,
    sessionPhase: 'idle',
    selectedTopicId: null,
    selectedTopicName: null,
    completedSession: null,
};
export const useSessionStore = create((set) => ({
    ...initialState,
    startSession: (session) => set({ activeSession: session, sessionPhase: 'running', completedSession: null }),
    endSession: (session) => set({ activeSession: session, sessionPhase: 'completed', completedSession: session }),
    interruptCurrentSession: () => set({ sessionPhase: 'interrupted' }),
    setSelectedTopic: (id, name) => set({ selectedTopicId: id, selectedTopicName: name }),
    reset: () => set(initialState),
}));
