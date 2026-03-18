import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import type { Topic } from '../../../domain/topics/topic';
import { UpdateTopicSchema } from '../../../domain/topics/topic-schema';
import { Button } from '../../../shared/ui/Button';
import { cn } from '../../../shared/lib/cn';
import styles from './TopicCard.module.css';

interface TopicCardProps {
  topic: Topic;
  onEdit: (id: string, name: string) => Promise<{ ok: boolean; message?: string }>;
  onArchive: (id: string) => Promise<{ ok: boolean; message?: string }>;
}

function formatDate(ms: number): string {
  return new Intl.DateTimeFormat('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(ms));
}

export function TopicCard({ topic, onEdit, onArchive }: TopicCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState(topic.name);
  const [editError, setEditError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // 수정 모드 진입 시 input에 자동 포커스
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleStartEdit = () => {
    setEditName(topic.name);
    setEditError(null);
    setIsEditing(true);
    setShowArchiveConfirm(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditName(topic.name);
    setEditError(null);
  };

  const handleSaveEdit = async () => {
    // 1. Zod 인라인 검증
    const parsed = UpdateTopicSchema.safeParse({ name: editName });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setEditError(issue?.message ?? '입력값이 올바르지 않습니다');
      return;
    }

    // 2. 변경 없으면 취소
    if (parsed.data.name === topic.name) {
      handleCancelEdit();
      return;
    }

    // 3. 저장 호출
    setIsSaving(true);
    setEditError(null);
    const result = await onEdit(topic.id, parsed.data.name);
    setIsSaving(false);

    if (result.ok) {
      setIsEditing(false);
    } else {
      setEditError(result.message ?? '주제 수정에 실패했습니다');
    }
  };

  const handleEditKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSaveEdit();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleCancelEdit();
    }
  };

  const handleArchiveClick = () => {
    setShowArchiveConfirm(true);
    setIsEditing(false);
  };

  const handleCancelArchive = () => {
    setShowArchiveConfirm(false);
  };

  const handleConfirmArchive = async () => {
    setIsArchiving(true);
    const result = await onArchive(topic.id);
    setIsArchiving(false);

    if (!result.ok) {
      setEditError(result.message ?? '주제 정리에 실패했습니다');
      setShowArchiveConfirm(false);
    }
    // result.ok → useTopics refetch로 목록에서 자동 제거
  };

  const inputId = `edit-topic-${topic.id}`;

  // 수정 모드
  if (isEditing) {
    return (
      <div className={cn(styles.card, styles.editing)}>
        <div className={styles.editForm}>
          <label htmlFor={inputId} className={styles.editLabel}>
            주제 이름
          </label>
          <input
            ref={inputRef}
            id={inputId}
            type="text"
            className={styles.editInput}
            value={editName}
            onChange={(e) => {
              setEditName(e.target.value);
              setEditError(null);
            }}
            onKeyDown={handleEditKeyDown}
            disabled={isSaving}
            aria-invalid={editError ? true : undefined}
            aria-describedby={editError ? `${inputId}-error` : undefined}
          />
          {editError && (
            <span id={`${inputId}-error`} className={styles.editError} role="alert">
              {editError}
            </span>
          )}
        </div>
        <div className={styles.editActions}>
          <Button variant="text" size="small" onClick={handleCancelEdit} disabled={isSaving}>
            취소
          </Button>
          <Button variant="primary" size="small" onClick={handleSaveEdit} isLoading={isSaving}>
            저장
          </Button>
        </div>
      </div>
    );
  }

  // 아카이브 확인 모드
  if (showArchiveConfirm) {
    return (
      <div className={cn(styles.card, styles.archiveConfirmCard)}>
        <div
          className={styles.archiveConfirm}
          role="alertdialog"
          aria-label="주제 정리 확인"
        >
          <p className={styles.archiveMessage}>
            &apos;{topic.name}&apos;을(를) 정리하시겠습니까?
          </p>
          <p className={styles.archiveHint}>
            주제 선택 목록에서 숨겨지지만, 기존 학습 기록은 유지됩니다.
          </p>
          <div className={styles.archiveActions}>
            <Button variant="text" size="small" onClick={handleCancelArchive} disabled={isArchiving}>
              취소
            </Button>
            <Button variant="destructive" size="small" onClick={handleConfirmArchive} isLoading={isArchiving}>
              정리
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // 기본 보기 모드
  return (
    <div className={styles.card}>
      <div className={styles.info}>
        <span className={styles.name}>{topic.name}</span>
        <span className={styles.date}>{formatDate(topic.createdAtMs)}</span>
      </div>
      <div className={styles.actions}>
        <Button variant="text" size="small" onClick={handleStartEdit}>
          수정
        </Button>
        <Button variant="destructive" size="small" onClick={handleArchiveClick}>
          정리
        </Button>
      </div>
    </div>
  );
}
