import { TopicQuickSelectPanel } from '../../features/session/components/TopicQuickSelectPanel';
import { useTopicSelect } from '../../features/session/hooks/useTopicSelect';
import { Button } from '../../shared/ui/Button/Button';
import styles from './HomeRoute.module.css';

export function HomeRoute() {
  const { topics, isLoading, error, selectedTopicId, selectTopic, isReady } = useTopicSelect();

  const handleStartSession = () => {
    // Epic 3에서 세션 시작 로직 연결 예정
    if (selectedTopicId) {
      console.info('[Story 2.4] 세션 시작 준비 완료:', selectedTopicId);
    }
  };

  return (
    <section className={styles.homePage}>
      <h1>홈</h1>
      {/* Study Status Summary Card → Story 5.2에서 구현 */}
      <section aria-label="주제 선택 및 세션 시작" className={styles.quickStartSection}>
        <h2>학습 시작</h2>
        <TopicQuickSelectPanel
          topics={topics}
          isLoading={isLoading}
          error={error}
          selectedTopicId={selectedTopicId}
          onSelectTopic={selectTopic}
        />
        <Button
          variant="primary"
          disabled={!isReady}
          onClick={handleStartSession}
        >
          학습 시작
        </Button>
      </section>
    </section>
  );
}
