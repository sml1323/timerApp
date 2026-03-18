import { type FormEvent, useState } from 'react';
import { CreateTopicSchema } from '../../../domain/topics/topic-schema';
import { Button } from '../../../shared/ui/Button';
import { cn } from '../../../shared/lib/cn';
import styles from './TopicForm.module.css';

interface TopicFormProps {
  onSubmit: (name: string) => Promise<{ ok: boolean; message?: string }>;
}

export function TopicForm({ onSubmit }: TopicFormProps) {
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    // Zod 클라이언트 검증
    const parsed = CreateTopicSchema.safeParse({ name });
    if (!parsed.success) {
      const issue = parsed.error.issues[0];
      setError(issue?.message ?? '입력값이 올바르지 않습니다');
      return;
    }

    setIsSaving(true);
    try {
      const result = await onSubmit(parsed.data.name);
      if (result.ok) {
        setName('');
        setError(null);
      } else {
        setError(result.message ?? '주제 생성에 실패했습니다');
      }
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <form className={styles.form} onSubmit={handleSubmit} noValidate>
      <div className={styles.fieldGroup}>
        <label htmlFor="topic-name" className={styles.label}>
          주제 이름
        </label>
        <div className={styles.inputRow}>
          <input
            id="topic-name"
            name="name"
            type="text"
            className={cn(styles.input, error && styles.inputError)}
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              if (error) setError(null);
            }}
            placeholder="예: 수학, 영어, 프로그래밍"
            disabled={isSaving}
            autoComplete="off"
          />
          <Button
            type="submit"
            variant="primary"
            size="medium"
            isLoading={isSaving}
            disabled={isSaving}
            aria-busy={isSaving || undefined}
          >
            저장
          </Button>
        </div>
        {error && (
          <p className={styles.errorMessage} role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
