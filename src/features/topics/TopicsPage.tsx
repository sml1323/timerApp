import { useTopics } from './hooks/useTopics';
import { TopicForm } from './components/TopicForm';
import { TopicList } from './components/TopicList';
import defaultCharacter from '../../assets/characters/default.svg';
import styles from './TopicsPage.module.css';

export function TopicsPage() {
  const { topics, isLoading, error, createNewTopic } = useTopics();

  const isEmpty = !isLoading && topics.length === 0;

  return (
    <section className={styles.page}>
      <h1 className={styles.title}>주제 관리</h1>

      {isLoading && (
        <div className={styles.loadingState}>
          <p className={styles.loadingText}>주제를 불러오는 중…</p>
        </div>
      )}

      {error && !isLoading && (
        <div className={styles.errorState} role="alert">
          <p className={styles.errorText}>{error}</p>
        </div>
      )}

      {isEmpty && (
        <div className={styles.emptyState}>
          <img
            src={defaultCharacter}
            alt=""
            aria-hidden="true"
            className={styles.character}
          />
          <p className={styles.emptyMessage}>첫 학습 주제를 만들어보세요</p>
        </div>
      )}

      <div className={styles.formSection}>
        <TopicForm onSubmit={async (name) => {
          const result = await createNewTopic(name);
          return { ok: result.ok, message: result.ok ? undefined : result.message };
        }} />
      </div>

      {!isLoading && topics.length > 0 && (
        <div className={styles.listSection}>
          <TopicList topics={topics} />
        </div>
      )}
    </section>
  );
}
