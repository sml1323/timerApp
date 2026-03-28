import { useState } from 'react';
import { SlideUpPanel } from '../../../shared/ui/SlideUpPanel';
import { useRecordCorrection } from '../hooks/useRecordCorrection';
import { useTopics } from '../../topics/hooks/useTopics';
import { RecordCorrectionDialog } from './RecordCorrectionDialog';
import type { SessionRecordItem } from '../record-correction-service';
import styles from './RecordsOverlay.module.css';

interface RecordsOverlayProps {
  onClose: () => void;
}

function formatDuration(startMs: number, endMs: number | null, plannedSec: number): string {
  const ms = endMs && startMs ? endMs - startMs : plannedSec * 1000;
  const minutes = Math.max(0, Math.round(ms / 60000));
  if (minutes < 60) return `${minutes}분`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}시간 ${m}분` : `${h}시간`;
}

function formatDate(ms: number): string {
  return new Intl.DateTimeFormat('ko-KR', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(ms));
}

export function RecordsOverlay({ onClose }: RecordsOverlayProps) {
  const { records, isLoading, error, reassignTopic } = useRecordCorrection();
  const { topics } = useTopics();
  const [editing, setEditing] = useState<SessionRecordItem | null>(null);

  return (
    <SlideUpPanel onClose={onClose} title="학습 기록">
      {error && <p className={styles.error}>기록을 불러올 수 없습니다.</p>}
      {isLoading && <p className={styles.loading}>불러오는 중...</p>}

      {!isLoading && records.length === 0 && (
        <p className={styles.empty}>아직 학습 기록이 없습니다.</p>
      )}

      <div className={styles.list}>
        {records.slice(0, 20).map((item) => (
          <div key={item.session.id} className={styles.record}>
            <div className={styles.info}>
              <span className={styles.topicName}>{item.topicName}</span>
              <span className={styles.meta}>
                {formatDuration(item.session.startedAtMs, item.session.endedAtMs, item.session.plannedDurationSec)}
                {' · '}
                {formatDate(item.session.startedAtMs)}
              </span>
            </div>
            <button
              className={styles.editBtn}
              onClick={() => setEditing(item)}
              type="button"
            >
              수정
            </button>
          </div>
        ))}
      </div>

      <RecordCorrectionDialog
        record={editing}
        topics={topics}
        isOpen={editing !== null}
        onSave={async (sessionId, newTopicId) => {
          const result = await reassignTopic(sessionId, newTopicId);
          if (result.ok) setEditing(null);
          return result;
        }}
        onClose={() => setEditing(null)}
      />
    </SlideUpPanel>
  );
}
