import type { SessionPhase } from './sessionStore';

export type Posture = 'idle' | 'focus' | 'break' | 'paused' | 'complete' | 'interrupted';

/**
 * Derive the visual posture from session state.
 * Pure function — testable without React.
 */
export function derivePosture(
  sessionPhase: SessionPhase,
  phaseType: 'study' | 'break' | null,
  isRunning: boolean,
): Posture {
  switch (sessionPhase) {
    case 'running':
      if (!isRunning) return 'paused';
      return phaseType === 'break' ? 'break' : 'focus';
    case 'completed':
      return 'complete';
    case 'interrupted':
      return 'interrupted';
    case 'idle':
    default:
      return 'idle';
  }
}
