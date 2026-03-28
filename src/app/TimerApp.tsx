import { useState, useCallback } from 'react';
import { useTimerSession } from './hooks/useTimerSession';
import { WindowChrome } from './components/WindowChrome';
import { TimerDisplay } from './components/TimerDisplay';
import { WeeklyProgressInline } from './components/WeeklyProgressInline';
import { KebabMenu } from './components/KebabMenu';
import { TopicDropdown } from '../features/topics/components/TopicDropdown';
import { SessionOutcomePanel } from '../features/session/components/SessionOutcomePanel';
import { getOutcomeContent, getInterruptedOutcomeContent } from '../features/session/session-flow';
import { StatsOverlay } from '../features/stats/components/StatsOverlay';
import { TopicManageOverlay } from '../features/topics/components/TopicManageOverlay';
import { GoalOverlay } from '../features/goals/components/GoalOverlay';
import { RecordsOverlay } from '../features/records/components/RecordsOverlay';
import styles from './TimerApp.module.css';

type OverlayType = 'stats' | 'topics' | 'goals' | 'records';

export function TimerApp() {
  const {
    sessionPhase,
    activeSession,
    selectedTopic,
    completedSession,
    clock,
    paused,
    actionError,
    isSaving,
    handlers,
  } = useTimerSession();

  const [kebabOpen, setKebabOpen] = useState(false);
  const [activeOverlay, setActiveOverlay] = useState<OverlayType | null>(null);

  const toggleKebab = useCallback(() => setKebabOpen((p) => !p), []);
  const closeKebab = useCallback(() => setKebabOpen(false), []);
  const openOverlay = useCallback((type: OverlayType) => setActiveOverlay(type), []);
  const closeOverlay = useCallback(() => setActiveOverlay(null), []);

  const isRunning = sessionPhase === 'running';
  const isOutcome = sessionPhase === 'completed' || sessionPhase === 'interrupted';
  const phaseType = activeSession?.phaseType ?? 'study';
  const topicDisabled = isRunning || isOutcome;

  const handlePlayOrPause = useCallback(() => {
    if (isRunning) {
      handlers.togglePause();
    } else if (sessionPhase === 'idle') {
      if (!selectedTopic.id || !selectedTopic.name) return;
      void handlers.handleStart(selectedTopic.id, selectedTopic.name);
    }
  }, [isRunning, sessionPhase, selectedTopic.id, selectedTopic.name, handlers]);

  const renderOutcome = () => {
    if (sessionPhase === 'completed') {
      const completedPhaseType = completedSession?.phaseType ?? phaseType;
      const outcomeContent = getOutcomeContent(completedPhaseType);
      const actualDurationSec = (() => {
        if (completedSession?.endedAtMs && completedSession.startedAtMs) {
          return Math.floor((completedSession.endedAtMs - completedSession.startedAtMs) / 1000);
        }
        return activeSession?.plannedDurationSec ?? 0;
      })();

      const handlePrimaryAction = outcomeContent.nextPhaseType === 'break'
        ? handlers.handleStartBreak
        : handlers.handleStartNextStudy;

      return (
        <SessionOutcomePanel
          variant="success"
          topicName={selectedTopic.name ?? ''}
          durationSec={actualDurationSec}
          durationLabel={outcomeContent.durationLabel}
          feedbackMessage={outcomeContent.feedbackMessage}
          primaryActionLabel={outcomeContent.primaryActionLabel}
          onPrimaryAction={handlePrimaryAction}
          onViewStats={() => { handlers.handleGoHome(); setActiveOverlay('stats'); }}
          onGoHome={handlers.handleGoHome}
          isBusy={isSaving}
        />
      );
    }

    if (sessionPhase === 'interrupted') {
      const interruptedContent = getInterruptedOutcomeContent();
      const interruptedDurationSec = (() => {
        const session = completedSession ?? activeSession;
        if (session?.endedAtMs && session.startedAtMs) {
          return Math.floor((session.endedAtMs - session.startedAtMs) / 1000);
        }
        return activeSession?.plannedDurationSec ?? 0;
      })();

      return (
        <SessionOutcomePanel
          variant="recovery"
          topicName={selectedTopic.name ?? ''}
          durationSec={interruptedDurationSec}
          durationLabel="학습 중단"
          feedbackMessage={interruptedContent.feedbackMessage}
          primaryActionLabel={interruptedContent.primaryActionLabel}
          onPrimaryAction={handlers.handleStartNextStudy}
          onViewStats={() => { handlers.handleGoHome(); setActiveOverlay('stats'); }}
          onGoHome={handlers.handleGoHome}
          isBusy={isSaving}
          recoveryHint={interruptedContent.recoveryHint}
          onSelectOtherTopic={handlers.handleGoHome}
        />
      );
    }

    return null;
  };

  return (
    <div className={styles.root}>
      <WindowChrome
        onKebabToggle={toggleKebab}
        kebabOpen={kebabOpen}
        showDismiss={isRunning || isOutcome}
        onDismiss={() => void handlers.handleGoHome()}
        showReset={isRunning}
        onReset={() => void handlers.handleReset()}
      />

      <KebabMenu
        open={kebabOpen}
        onClose={closeKebab}
        onOpenOverlay={openOverlay}
        onInterrupt={handlers.handleInterrupt}
        showInterrupt={isRunning}
        isBusy={isSaving}
      />

      <div className={styles.body}>
        {isOutcome ? (
          renderOutcome()
        ) : (
          <>
            <TopicDropdown
              selectedTopicId={selectedTopic.id}
              selectedTopicName={selectedTopic.name}
              disabled={topicDisabled}
            />

            <TimerDisplay
              formattedTime={clock.formattedTime}
              progressPercent={clock.progressPercent}
              isRunning={isRunning && !paused}
              isPaused={paused}
              onPlay={handlePlayOrPause}
              playDisabled={sessionPhase === 'idle' && (!selectedTopic.id || isSaving)}
            />

            <WeeklyProgressInline />
          </>
        )}

        {actionError && (
          <p className={styles.error} role="alert">{actionError}</p>
        )}
      </div>

      {activeOverlay === 'stats' && <StatsOverlay onClose={closeOverlay} />}
      {activeOverlay === 'topics' && <TopicManageOverlay onClose={closeOverlay} />}
      {activeOverlay === 'goals' && <GoalOverlay onClose={closeOverlay} />}
      {activeOverlay === 'records' && <RecordsOverlay onClose={closeOverlay} />}
    </div>
  );
}
