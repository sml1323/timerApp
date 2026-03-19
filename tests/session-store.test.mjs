import test, { beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { useSessionStore } from '../.test-dist/src/features/session/state/sessionStore.js';

const runningStudySession = {
  id: 'study-1',
  topicId: 'topic-1',
  phaseType: 'study',
  status: 'running',
  startedAtMs: 1000,
  plannedDurationSec: 1500,
  endedAtMs: null,
  createdAtMs: 1000,
  updatedAtMs: 1000,
};

const completedStudySession = {
  ...runningStudySession,
  status: 'completed',
  endedAtMs: 2500,
  updatedAtMs: 2500,
};

const runningBreakSession = {
  ...runningStudySession,
  id: 'break-1',
  phaseType: 'break',
  plannedDurationSec: 300,
  endedAtMs: null,
  updatedAtMs: 3000,
};

beforeEach(() => {
  useSessionStore.getState().reset();
});

test('startSession clears stale completedSession data', () => {
  const store = useSessionStore.getState();
  store.setSelectedTopic('topic-1', '자료구조');
  store.endSession(completedStudySession);

  store.startSession(runningBreakSession);

  const state = useSessionStore.getState();
  assert.equal(state.sessionPhase, 'running');
  assert.equal(state.completedSession, null);
  assert.deepEqual(state.activeSession, runningBreakSession);
  assert.equal(state.selectedTopicId, 'topic-1');
  assert.equal(state.selectedTopicName, '자료구조');
});

test('endSession preserves the latest completed session record for outcome rendering', () => {
  const store = useSessionStore.getState();
  store.startSession(runningStudySession);

  store.endSession(completedStudySession);

  const state = useSessionStore.getState();
  assert.equal(state.sessionPhase, 'completed');
  assert.deepEqual(state.activeSession, completedStudySession);
  assert.deepEqual(state.completedSession, completedStudySession);
});

test('reset clears topic and session state together', () => {
  const store = useSessionStore.getState();
  store.setSelectedTopic('topic-1', '자료구조');
  store.startSession(runningStudySession);

  store.reset();

  const state = useSessionStore.getState();
  assert.equal(state.activeSession, null);
  assert.equal(state.sessionPhase, 'idle');
  assert.equal(state.selectedTopicId, null);
  assert.equal(state.selectedTopicName, null);
  assert.equal(state.completedSession, null);
});

test('interruptCurrentSession preserves session data in completedSession for recovery UI', () => {
  const store = useSessionStore.getState();
  store.setSelectedTopic('topic-1', '자료구조');
  store.startSession(runningStudySession);

  const interruptedSession = {
    ...runningStudySession,
    status: 'interrupted',
    endedAtMs: 1800,
    updatedAtMs: 1800,
  };
  store.interruptCurrentSession(interruptedSession);

  const state = useSessionStore.getState();
  assert.equal(state.sessionPhase, 'interrupted');
  assert.deepEqual(state.completedSession, interruptedSession);
  // activeSession should still be available for topic context (recovery restart)
  assert.deepEqual(state.activeSession, runningStudySession);
  // topic context preserved for "바로 재시작"
  assert.equal(state.selectedTopicId, 'topic-1');
  assert.equal(state.selectedTopicName, '자료구조');
});
