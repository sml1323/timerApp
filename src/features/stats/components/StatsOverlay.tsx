import { useState, useMemo } from 'react';
import { SlideUpPanel } from '../../../shared/ui/SlideUpPanel';
import { useStatistics } from '../hooks/useStatistics';
import { TopicBreakdownList } from './TopicBreakdownList';
import { useRecordCorrection } from '../../records/hooks/useRecordCorrection';
import { getWeekStartAtMs } from '../../../shared/lib/dates';
import type { SessionRecordItem } from '../../records/record-correction-service';
import styles from './StatsOverlay.module.css';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const;
const MAX_WEEK_OFFSET = 12;

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

function getDurationMinutes(item: SessionRecordItem): number {
  const ms = item.session.endedAtMs && item.session.startedAtMs
    ? item.session.endedAtMs - item.session.startedAtMs
    : item.session.plannedDurationSec * 1000;
  return Math.max(0, Math.round(ms / 60000));
}

interface StatsOverlayProps {
  onClose: () => void;
}

export function StatsOverlay({ onClose }: StatsOverlayProps) {
  const { data, isLoading, error } = useStatistics();
  const { records } = useRecordCorrection();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStartMs = useMemo(() => getWeekStartAtMs() - (weekOffset * 7 * DAY_MS), [weekOffset]);

  const weeklyBreakdown = useMemo(() => {
    const buckets = WEEKDAY_LABELS.map((label) => ({ label, totalMinutes: 0 }));
    const weekEndMs = weekStartMs + (7 * DAY_MS);
    for (const item of records) {
      const ms = item.session.startedAtMs;
      if (ms < weekStartMs || ms >= weekEndMs) continue;
      const day = Math.floor((ms - weekStartMs) / DAY_MS);
      if (day >= 0 && day < buckets.length) buckets[day].totalMinutes += getDurationMinutes(item);
    }
    const max = Math.max(...buckets.map((b) => b.totalMinutes), 1);
    return buckets.map((b) => ({
      ...b,
      heightPct: b.totalMinutes === 0 ? 0 : Math.max(18, Math.round((b.totalMinutes / max) * 100)),
    }));
  }, [records, weekStartMs]);

  const weekTotal = weeklyBreakdown.reduce((s, b) => s + b.totalMinutes, 0);

  return (
    <SlideUpPanel onClose={onClose} title="통계">
      {error && <p className={styles.error}>통계를 불러올 수 없습니다.</p>}
      {isLoading && <p className={styles.loading}>불러오는 중...</p>}

      {data?.hasData && (
        <>
          <div className={styles.weekNav}>
            <button type="button" className={styles.navBtn} onClick={() => setWeekOffset((p) => Math.min(p + 1, MAX_WEEK_OFFSET))} disabled={weekOffset >= MAX_WEEK_OFFSET}>‹</button>
            <span className={styles.weekLabel}>{formatMinutes(weekTotal)}</span>
            <button type="button" className={styles.navBtn} onClick={() => setWeekOffset((p) => Math.max(p - 1, 0))} disabled={weekOffset === 0}>›</button>
          </div>

          <div className={styles.chart}>
            {weeklyBreakdown.map((b) => (
              <div key={b.label} className={styles.col}>
                <div className={styles.barTrack}>
                  <div className={styles.bar} style={{ height: `${b.heightPct}%` }} />
                </div>
                <span className={styles.dayLabel}>{b.label}</span>
              </div>
            ))}
          </div>

          <div className={styles.summaryRow}>
            <div className={styles.stat}>
              <span className={styles.statLabel}>오늘</span>
              <strong className={styles.statValue}>{formatMinutes(data.today.totalMinutes)}</strong>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>이번 주</span>
              <strong className={styles.statValue}>{formatMinutes(data.weekly.totalMinutes)}</strong>
            </div>
            <div className={styles.stat}>
              <span className={styles.statLabel}>전체</span>
              <strong className={styles.statValue}>{formatMinutes(data.totalMinutesAllTime)}</strong>
            </div>
          </div>

          <TopicBreakdownList topics={data.byTopic} totalMinutes={data.totalMinutesAllTime} />
        </>
      )}

      {data && !data.hasData && (
        <p className={styles.empty}>아직 학습 기록이 없습니다.</p>
      )}
    </SlideUpPanel>
  );
}
