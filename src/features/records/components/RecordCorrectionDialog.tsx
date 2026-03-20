import { type FormEvent, useState, useEffect, useRef, type KeyboardEvent } from 'react';
import type { Topic } from '../../../domain/topics/topic';
import type { SessionRecordItem } from '../record-correction-service';
import { Button } from '../../../shared/ui/Button/Button';
import styles from './RecordCorrectionDialog.module.css';

interface RecordCorrectionDialogProps {
  record: SessionRecordItem | null;
  topics: Topic[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (sessionId: string, newTopicId: string) => Promise<{ ok: boolean; message?: string }>;
}

function formatDuration(sec: number): string {
  const minutes = Math.round(sec / 60);
  return `${minutes}분`;
}

export function RecordCorrectionDialog({ record, topics, isOpen, onClose, onSave }: RecordCorrectionDialogProps) {
  const [selectedTopicId, setSelectedTopicId] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const selectRef = useRef<HTMLSelectElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // 다이얼로그 열릴 때 초기화 및 포커스
  useEffect(() => {
    if (isOpen && record) {
      triggerRef.current = document.activeElement as HTMLElement;
      setSelectedTopicId(record.session.topicId);
      setError(null);
      requestAnimationFrame(() => {
        selectRef.current?.focus();
      });
    } else if (!isOpen) {
      triggerRef.current?.focus();
    }
  }, [isOpen, record]);

  // ESC 키로 닫기 및 포커스 트랩
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
      return;
    }

    if (e.key === 'Tab') {
      const focusableElements = e.currentTarget.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      const firstElement = focusableElements[0] as HTMLElement;
      const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          lastElement.focus();
          e.preventDefault();
        }
      } else {
        if (document.activeElement === lastElement) {
          firstElement.focus();
          e.preventDefault();
        }
      }
    }
  };

  // 오버레이 클릭으로 닫기
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!record) return;
    setError(null);

    if (!selectedTopicId) {
      setError('주제를 선택해주세요');
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSave(record.session.id, selectedTopicId);
      if (result.ok) {
        onClose();
      } else {
        setError(result.message ?? '기록 수정에 실패했습니다');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen || !record) return null;

  const duration = record.session.endedAtMs && record.session.startedAtMs
    ? record.session.endedAtMs - record.session.startedAtMs
    : record.session.plannedDurationSec * 1000;
  const durationSec = Math.round(duration / 1000);

  const topicSelectId = 'record-correction-topic';
  const durationFieldId = 'record-correction-duration';
  const titleId = 'record-correction-title';
  const errorId = 'record-correction-error';

  return (
    <div
      className={styles.overlay}
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
      >
        <h2 id={titleId} className={styles.title}>기록 수정</h2>

        <form onSubmit={handleSubmit} noValidate>
          {/* 수정 가능: 주제 */}
          <div className={styles.fieldGroup}>
            <label htmlFor={topicSelectId} className={`${styles.label} ${styles.editableLabel}`}>
              주제 <span className={`${styles.statusTag} ${styles.editableTag}`}>수정 가능</span>
            </label>
            <select
              ref={selectRef}
              id={topicSelectId}
              className={styles.select}
              value={selectedTopicId}
              onChange={(e) => {
                setSelectedTopicId(e.target.value);
                if (error) setError(null);
              }}
              disabled={isSaving}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            >
              {topics.map((topic) => (
                <option key={topic.id} value={topic.id}>
                  {topic.name}
                </option>
              ))}
            </select>
          </div>

          {/* 수정 불가: 학습 시간 */}
          <div className={styles.fieldGroup}>
            <label htmlFor={durationFieldId} className={styles.label}>
              학습 시간 <span className={`${styles.statusTag} ${styles.readonlyTag}`}>수정 불가</span>
            </label>
            <input
              id={durationFieldId}
              type="text"
              className={styles.readonlyField}
              value={formatDuration(durationSec)}
              readOnly
              disabled
              aria-disabled="true"
            />
            <p className={styles.readonlyHint}>
              <span className={styles.lockIcon} aria-hidden="true">🔒</span>
              세션 시간은 실제 기록이므로 수정할 수 없습니다
            </p>
          </div>

          {error && (
            <p id={errorId} className={styles.errorMessage} role="alert">
              {error}
            </p>
          )}

          <div className={styles.actions}>
            <Button
              type="button"
              variant="text"
              size="medium"
              onClick={onClose}
              disabled={isSaving}
            >
              취소
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="medium"
              isLoading={isSaving}
              disabled={isSaving}
            >
              저장
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
