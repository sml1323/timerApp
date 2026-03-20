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

test('endSession sets lastCompletedAtMs to a positive timestamp', () => {
  const store = useSessionStore.getState();
  store.startSession(runningStudySession);

  const before = Date.now();
  store.endSession(completedStudySession);
  const after = Date.now();

  const state = useSessionStore.getState();
  assert.ok(state.lastCompletedAtMs !== null, 'lastCompletedAtMs should not be null');
  assert.ok(state.lastCompletedAtMs >= before, 'lastCompletedAtMs should be >= before');
  assert.ok(state.lastCompletedAtMs <= after, 'lastCompletedAtMs should be <= after');
});

test('interruptCurrentSession sets lastCompletedAtMs to a positive timestamp', () => {
  const store = useSessionStore.getState();
  store.startSession(runningStudySession);

  const interruptedSession = {
    ...runningStudySession,
    status: 'interrupted',
    endedAtMs: 1800,
    updatedAtMs: 1800,
  };

  const before = Date.now();
  store.interruptCurrentSession(interruptedSession);
  const after = Date.now();

  const state = useSessionStore.getState();
  assert.ok(state.lastCompletedAtMs !== null, 'lastCompletedAtMs should not be null');
  assert.ok(state.lastCompletedAtMs >= before, 'lastCompletedAtMs should be >= before');
  assert.ok(state.lastCompletedAtMs <= after, 'lastCompletedAtMs should be <= after');
});

test('reset preserves lastCompletedAtMs from before reset', () => {
  const store = useSessionStore.getState();
  store.startSession(runningStudySession);
  store.endSession(completedStudySession);

  const stateAfterEnd = useSessionStore.getState();
  const savedTimestamp = stateAfterEnd.lastCompletedAtMs;
  assert.ok(savedTimestamp !== null, 'lastCompletedAtMs should be set after endSession');

  store.reset();

  const stateAfterReset = useSessionStore.getState();
  assert.equal(stateAfterReset.activeSession, null, 'activeSession should be null after reset');
  assert.equal(stateAfterReset.sessionPhase, 'idle', 'sessionPhase should be idle after reset');
  assert.equal(stateAfterReset.lastCompletedAtMs, savedTimestamp, 'lastCompletedAtMs should be preserved after reset');
});

test('startSession does not change lastCompletedAtMs', () => {
  const store = useSessionStore.getState();
  store.endSession(completedStudySession);

  const stateAfterEnd = useSessionStore.getState();
  const savedTimestamp = stateAfterEnd.lastCompletedAtMs;

  store.startSession(runningBreakSession);

  const stateAfterStart = useSessionStore.getState();
  assert.equal(stateAfterStart.lastCompletedAtMs, savedTimestamp, 'lastCompletedAtMs should not change on startSession');
});

