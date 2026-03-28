import { useState, useMemo } from 'react';
import { useStatistics } from '../../features/stats/hooks/useStatistics';
import { TopicBreakdownList } from '../../features/stats/components/TopicBreakdownList';
import { useRecordCorrection } from '../../features/records/hooks/useRecordCorrection';
import type { SessionRecordItem } from '../../features/records/record-correction-service';
import { getWeekStartAtMs } from '../../shared/lib/dates';
import styles from './StatsRoute.module.css';

const DAY_MS = 24 * 60 * 60 * 1000;
const WEEKDAY_LABELS = ['월', '화', '수', '목', '금', '토', '일'] as const;
const MAX_WEEK_OFFSET = 12;

const RANGE_FORMATTER = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric' });

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes}분`;
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return remainingMinutes > 0 ? `${hours}시간 ${remainingMinutes}분` : `${hours}시간`;
}

function formatDateRange(weekStartMs: number): string {
  const start = new Date(weekStartMs);
  const end = new Date(weekStartMs + (6 * DAY_MS));
  return `${RANGE_FORMATTER.format(start)} - ${RANGE_FORMATTER.format(end)}`;
}

function getDurationMinutes(item: SessionRecordItem): number {
  const durationMs = item.session.endedAtMs && item.session.startedAtMs
    ? item.session.endedAtMs - item.session.startedAtMs
    : item.session.plannedDurationSec * 1000;
  return Math.max(0, Math.round(durationMs / 60000));
}

export function StatsRoute() {
  const { data, isLoading, error } = useStatistics();
  const { records, isLoading: recordsLoading, error: recordsError } = useRecordCorrection();
  const [weekOffset, setWeekOffset] = useState(0);

  const weekStartMs = useMemo(
    () => getWeekStartAtMs() - (weekOffset * 7 * DAY_MS),
    [weekOffset],
  );
  const weekLabel = useMemo(() => formatDateRange(weekStartMs), [weekStartMs]);

  const weeklyBreakdown = useMemo(() => {
    const buckets = WEEKDAY_LABELS.map((label) => ({
      label,
      totalMinutes: 0,
      sessionCount: 0,
    }));
    const weekEndMs = weekStartMs + (7 * DAY_MS);

    for (const item of records) {
      const startedAtMs = item.session.startedAtMs;
      if (startedAtMs < weekStartMs || startedAtMs >= weekEndMs) continue;

      const dayIndex = Math.floor((startedAtMs - weekStartMs) / DAY_MS);
      if (dayIndex < 0 || dayIndex >= buckets.length) continue;

      buckets[dayIndex].totalMinutes += getDurationMinutes(item);
      buckets[dayIndex].sessionCount += 1;
    }

    const maxMinutes = Math.max(...buckets.map((bucket) => bucket.totalMinutes), 1);

    return buckets.map((bucket) => ({
      ...bucket,
      heightPercent: bucket.totalMinutes === 0
        ? 0
        : Math.max(18, Math.round((bucket.totalMinutes / maxMinutes) * 100)),
    }));
  }, [records, weekStartMs]);

  const weekSessionCount = weeklyBreakdown.reduce((sum, b) => sum + b.sessionCount, 0);
  const weekTotalMinutes = weeklyBreakdown.reduce((sum, b) => sum + b.totalMinutes, 0);

  const handlePrevWeek = () => {
    setWeekOffset((prev) => Math.min(prev + 1, MAX_WEEK_OFFSET));
  };

  const handleNextWeek = () => {
    setWeekOffset((prev) => Math.max(prev - 1, 0));
  };

  const renderOverview = () => {
    if (error) {
      return <p role="alert" className={styles.errorText}>통계를 불러올 수 없습니다.</p>;
    }

    if (isLoading || !data) {
      return <div className={styles.skeleton} aria-busy="true" aria-label="불러오는 중" />;
    }

    if (!data.hasData) {
      return (
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>아직 학습 기록이 없습니다</p>
          <p className={styles.emptyHint}>첫 학습 세션을 완료하면 통계가 표시됩니다.</p>
        </div>
      );
    }

    return (
      <>
        {/* Week navigation */}
        <div className={styles.rangeRow}>
          <button
            type="button"
            className={styles.rangeArrow}
            onClick={handlePrevWeek}
            disabled={weekOffset >= MAX_WEEK_OFFSET}
            aria-label="이전 주"
          >
            ‹
          </button>
          <div className={styles.rangeTextBlock}>
            <p className={styles.rangeLabel}>{weekLabel}</p>
            <p className={styles.rangeSummary}>{weekSessionCount}개 세션</p>
          </div>
          <button
            type="button"
            className={`${styles.rangeArrow} ${weekOffset === 0 ? styles.rangeArrowDisabled : ''}`}
            onClick={handleNextWeek}
            disabled={weekOffset === 0}
            aria-label="다음 주"
          >
            ›
          </button>
        </div>

        {/* Weekly goal band */}
        <div className={styles.goalBand}>
          <span className={styles.goalBandLabel}>이번 주 학습</span>
          <span className={styles.goalBandValue}>{formatMinutes(weekTotalMinutes)}</span>
        </div>

        {/* Weekly chart */}
        {recordsLoading ? (
          <div className={styles.chartSkeleton} aria-busy="true" aria-label="주간 분포 불러오는 중" />
        ) : recordsError ? (
          <p className={styles.noticeText}>주간 분포를 표시할 수 없습니다.</p>
        ) : (
          <div className={styles.chartGrid} aria-label="이번 주 학습 흐름">
            {weeklyBreakdown.map((bucket) => (
              <div key={bucket.label} className={styles.chartColumn}>
                <span className={styles.barMinutes}>
                  {bucket.totalMinutes > 0 ? formatMinutes(bucket.totalMinutes) : ''}
                </span>
                <div className={styles.barTrack}>
                  <div
                    className={`${styles.barFill} ${bucket.totalMinutes === 0 ? styles.barFillEmpty : ''}`}
                    style={{ height: bucket.totalMinutes === 0 ? '10px' : `${bucket.heightPercent}%` }}
                    aria-hidden="true"
                  />
                </div>
                <span className={styles.barLabel}>{bucket.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Summary row */}
        <div className={styles.summaryGrid}>
          <article className={styles.summaryCard}>
            <span className={styles.summaryLabel}>오늘</span>
            <strong className={styles.summaryValue}>{formatMinutes(data.today.totalMinutes)}</strong>
            <span className={styles.summaryMeta}>{data.today.sessionCount}개 세션</span>
          </article>
          <article className={styles.summaryCard}>
            <span className={styles.summaryLabel}>이번 주</span>
            <strong className={styles.summaryValue}>{formatMinutes(data.weekly.totalMinutes)}</strong>
            <span className={styles.summaryMeta}>{data.weekly.sessionCount}개 세션</span>
          </article>
          <article className={styles.summaryCard}>
            <span className={styles.summaryLabel}>전체</span>
            <strong className={styles.summaryValue}>{formatMinutes(data.totalMinutesAllTime)}</strong>
            <span className={styles.summaryMeta}>{data.totalSessionsAllTime}개 세션</span>
          </article>
        </div>
      </>
    );
  };

  return (
    <section className={styles.statsPage}>
      <div className={styles.heroSection}>
        <h1 className={styles.title}>통계</h1>
        <p className={styles.subtitle}>주간 학습 흐름을 확인하세요.</p>
      </div>

      {renderOverview()}

      {data?.hasData && (
        <div className={styles.breakdownSection}>
          <TopicBreakdownList topics={data.byTopic} totalMinutes={data.totalMinutesAllTime} />
        </div>
      )}
    </section>
  );
}
