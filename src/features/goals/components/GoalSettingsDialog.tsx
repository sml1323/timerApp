import { type FormEvent, useState, useEffect, useRef, type KeyboardEvent } from 'react';
import type { WeeklyGoal } from '../../../domain/goals/weekly-goal';
import { UpdateWeeklyGoalSchema } from '../../../domain/goals/weekly-goal-schema';
import { Button } from '../../../shared/ui/Button';
import { cn } from '../../../shared/lib/cn';
import type { Result } from '../../../shared/lib/result';
import styles from './GoalSettingsDialog.module.css';

interface GoalSettingsDialogProps {
  topicName: string;
  topicId: string;
  existingGoal: WeeklyGoal | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (topicId: string, targetMinutes: number) => Promise<Result<WeeklyGoal>>;
}

export function GoalSettingsDialog({ topicName, topicId, existingGoal, isOpen, onClose, onSave }: GoalSettingsDialogProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLElement | null>(null);

  // 다이얼로그 열릴 때 초기화 및 포커스
  useEffect(() => {
    if (isOpen) {
      triggerRef.current = document.activeElement as HTMLElement;
      setValue(existingGoal ? String(existingGoal.targetMinutes) : '');
      setError(null);
      // 다음 프레임에서 포커스 이동
      requestAnimationFrame(() => {
        inputRef.current?.focus();
      });
    } else {
      // 닫힐 때 트리거 버튼으로 포커스 복원
      triggerRef.current?.focus();
    }
  }, [isOpen, existingGoal]);

  // ESC 키로 닫기
  const handleKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
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
    setError(null);

    const targetMinutes = Number(value);

    // Zod 클라이언트 검증
    const parsed = UpdateWeeklyGoalSchema.safeParse({ targetMinutes });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setError(issue?.message ?? '입력값이 올바르지 않습니다');
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSave(topicId, parsed.data.targetMinutes);
      if (result.ok) {
        onClose();
      } else {
        setError(result.message ?? '목표 저장에 실패했습니다');
      }
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  const inputId = `goal-minutes-${topicId}`;
  const titleId = `goal-dialog-title-${topicId}`;
  const errorId = `goal-error-${topicId}`;

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
        <h2 id={titleId} className={styles.title}>주간 목표 설정</h2>
        <p className={styles.subtitle}>{topicName}</p>

        <form onSubmit={handleSubmit} noValidate>
          <div className={styles.fieldGroup}>
            <label htmlFor={inputId} className={styles.label}>
              주간 목표 (분)
            </label>
            <input
              ref={inputRef}
              id={inputId}
              type="number"
              min="1"
              step="1"
              className={cn(styles.input, error && styles.inputError)}
              value={value}
              onChange={(e) => {
                setValue(e.target.value);
                if (error) setError(null);
              }}
              placeholder="예: 120"
              disabled={isSaving}
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
            {error && (
              <p id={errorId} className={styles.errorMessage} role="alert">
                {error}
              </p>
            )}
          </div>

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
