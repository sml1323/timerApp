import { useState, useCallback } from 'react';
import { useStatistics } from '../../features/stats/hooks/useStatistics';
import { StatsSummaryCard } from '../../features/stats/components/StatsSummaryCard';
import { TopicBreakdownList } from '../../features/stats/components/TopicBreakdownList';
import { useRecordCorrection } from '../../features/records/hooks/useRecordCorrection';
import { useTopics } from '../../features/topics/hooks/useTopics';
import { RecordList } from '../../features/records/components/RecordList';
import { RecordCorrectionDialog } from '../../features/records/components/RecordCorrectionDialog';
import type { SessionRecordItem } from '../../features/records/record-correction-service';
import defaultCharacter from '../../assets/characters/default.svg';
import styles from './StatsRoute.module.css';

export function StatsRoute() {
  const { data, isLoading, error, refetch: refetchStats } = useStatistics();
  const { records, isLoading: recordsLoading, error: recordsError, reassignTopic } = useRecordCorrection();
  const { topics } = useTopics();

  const [correctionTarget, setCorrectionTarget] = useState<SessionRecordItem | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCorrect = useCallback((sessionId: string) => {
    const target = records.find((r) => r.session.id === sessionId);
    if (target) {
      setCorrectionTarget(target);
      setIsDialogOpen(true);
    }
  }, [records]);

  const handleSave = useCallback(async (sessionId: string, newTopicId: string) => {
    const result = await reassignTopic(sessionId, newTopicId);
    if (result.ok) {
      refetchStats();
    }
    return result;
  }, [reassignTopic, refetchStats]);

  const handleDialogClose = useCallback(() => {
    setIsDialogOpen(false);
    setCorrectionTarget(null);
  }, []);

  if (error) {
    return (
      <section className={styles.statsPage}>
        <h1>통계</h1>
        <p role="alert" className={styles.errorText}>데이터를 불러올 수 없습니다.</p>
      </section>
    );
  }

  if (isLoading || !data) {
    return (
      <section className={styles.statsPage}>
        <h1>통계</h1>
        <div className={styles.skeleton} aria-busy="true" aria-label="로딩 중" />
      </section>
    );
  }

  if (!data.hasData) {
    return (
      <section className={styles.statsPage}>
        <h1>통계</h1>
        <div className={styles.emptyState}>
          <img src={defaultCharacter} alt="" aria-hidden="true" className={styles.emptyCharacter} />
          <p className={styles.emptyMessage}>아직 학습 기록이 없어요</p>
          <p className={styles.emptyHint}>학습 세션을 완료하면 여기에 통계가 표시됩니다.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.statsPage}>
      <h1>통계</h1>
      <StatsSummaryCard today={data.today} weekly={data.weekly} />
      <TopicBreakdownList topics={data.byTopic} totalMinutes={data.totalMinutesAllTime} />

      <RecordList
        records={records}
        isLoading={recordsLoading}
        error={recordsError}
        onCorrect={handleCorrect}
      />

      <RecordCorrectionDialog
        record={correctionTarget}
        topics={topics}
        isOpen={isDialogOpen}
        onClose={handleDialogClose}
        onSave={handleSave}
      />
    </section>
  );
}

