import type { SessionRecordItem } from '../record-correction-service';
import styles from './RecordList.module.css';

function formatDuration(sec: number): string {
  const minutes = Math.round(sec / 60);
  return `${minutes}분`;
}

function formatDate(ms: number): string {
  const d = new Date(ms);
  const month = d.getMonth() + 1;
  const day = d.getDate();
  const hours = String(d.getHours()).padStart(2, '0');
  const mins = String(d.getMinutes()).padStart(2, '0');
  return `${month}/${day} ${hours}:${mins}`;
}

interface RecordListProps {
  records: SessionRecordItem[];
  isLoading: boolean;
  error: string | null;
  onCorrect: (sessionId: string) => void;
}

export function RecordList({ records, isLoading, error, onCorrect }: RecordListProps) {
  if (error) {
    return (
      <section className={styles.recordSection}>
        <h2>학습 기록</h2>
        <p role="alert" className={styles.errorText}>기록을 불러올 수 없습니다.</p>
      </section>
    );
  }

  if (isLoading) {
    return (
      <section className={styles.recordSection}>
        <h2>학습 기록</h2>
        <p className={styles.loadingText} aria-busy="true">불러오는 중...</p>
      </section>
    );
  }

  if (records.length === 0) {
    return (
      <section className={styles.recordSection}>
        <h2>학습 기록</h2>
        <div className={styles.emptyState}>
          <p className={styles.emptyMessage}>아직 완료된 학습 세션이 없습니다.</p>
        </div>
      </section>
    );
  }

  return (
    <section className={styles.recordSection}>
      <h2>학습 기록</h2>
      <ul role="list" className={styles.list}>
        {records.map((item) => {
          const duration = item.session.endedAtMs && item.session.startedAtMs
            ? item.session.endedAtMs - item.session.startedAtMs
            : item.session.plannedDurationSec * 1000;
          const durationSec = Math.round(duration / 1000);

          return (
            <li role="listitem" key={item.session.id} className={styles.item}>
              <div className={styles.itemInfo}>
                <span className={styles.topicName}>{item.topicName}</span>
                <span className={styles.meta}>
                  <span>{formatDuration(durationSec)}</span>
                  <span>{formatDate(item.session.startedAtMs)}</span>
                </span>
              </div>
              <button
                type="button"
                className={styles.editButton}
                onClick={() => onCorrect(item.session.id)}
                aria-label={`${item.topicName} 세션 기록 수정`}
              >
                수정
              </button>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
