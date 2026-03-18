import { useState, useEffect, useRef } from 'react';

interface UseSessionClockOptions {
  startedAtMs: number;
  plannedDurationSec: number;
  isRunning: boolean;
  onComplete?: () => void;
}

interface SessionClockResult {
  remainingSec: number;
  elapsedSec: number;
  progressPercent: number;
  formattedTime: string;
}

function computeRemaining(startedAtMs: number, plannedDurationSec: number): number {
  const elapsedMs = Date.now() - startedAtMs;
  const elapsedSec = Math.floor(elapsedMs / 1000);
  return Math.max(0, plannedDurationSec - elapsedSec);
}

function formatTime(totalSec: number): string {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

/**
 * timestamp 기반 세션 타이머 훅.
 * 매 초 Date.now()로 남은 시간을 재계산하여 drift를 방지한다.
 * 앱이 백그라운드에서 복귀해도 정확한 남은 시간이 즉시 반영된다.
 */
export function useSessionClock(options: UseSessionClockOptions): SessionClockResult {
  const { startedAtMs, plannedDurationSec, isRunning, onComplete } = options;

  const onCompleteRef = useRef(onComplete);
  onCompleteRef.current = onComplete;

  const completedRef = useRef(false);

  const [remainingSec, setRemainingSec] = useState(() =>
    computeRemaining(startedAtMs, plannedDurationSec),
  );

  useEffect(() => {
    if (!isRunning) return;

    // 즉시 한 번 계산
    completedRef.current = false;
    const remaining = computeRemaining(startedAtMs, plannedDurationSec);
    setRemainingSec(remaining);

    if (remaining === 0) {
      completedRef.current = true;
      onCompleteRef.current?.();
      return;
    }

    const intervalId = setInterval(() => {
      const newRemaining = computeRemaining(startedAtMs, plannedDurationSec);
      setRemainingSec(newRemaining);

      if (newRemaining === 0 && !completedRef.current) {
        completedRef.current = true;
        onCompleteRef.current?.();
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [startedAtMs, plannedDurationSec, isRunning]);

  const elapsedSec = plannedDurationSec - remainingSec;
  const progressPercent = plannedDurationSec > 0
    ? Math.min(100, Math.max(0, (elapsedSec / plannedDurationSec) * 100))
    : 0;

  return {
    remainingSec,
    elapsedSec,
    progressPercent,
    formattedTime: formatTime(remainingSec),
  };
}
