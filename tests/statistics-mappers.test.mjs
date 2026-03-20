import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toTodayStudySummary,
  toWeeklyStudySummary,
  toTopicStudySummary,
} from '../.test-dist/src/domain/statistics/statistics-mappers.js';

// --- toTodayStudySummary ---

test('toTodayStudySummary — total_seconds → totalMinutes 변환', () => {
  const result = toTodayStudySummary({ total_seconds: 5400, session_count: 3 });
  assert.equal(result.totalMinutes, 90); // 5400/60 = 90
  assert.equal(result.sessionCount, 3);
});

test('toTodayStudySummary — 반올림 검증 (Math.round)', () => {
  const result = toTodayStudySummary({ total_seconds: 1530, session_count: 1 });
  assert.equal(result.totalMinutes, 26); // Math.round(1530/60) = Math.round(25.5) = 26
});

test('toTodayStudySummary — undefined row → 기본값 반환', () => {
  const result = toTodayStudySummary(undefined);
  assert.equal(result.totalMinutes, 0);
  assert.equal(result.sessionCount, 0);
});

test('toTodayStudySummary — 0초 row 처리', () => {
  const result = toTodayStudySummary({ total_seconds: 0, session_count: 0 });
  assert.equal(result.totalMinutes, 0);
  assert.equal(result.sessionCount, 0);
});

// --- toWeeklyStudySummary ---

test('toWeeklyStudySummary — total_seconds → totalMinutes 변환', () => {
  const result = toWeeklyStudySummary({ total_seconds: 18000, session_count: 12 });
  assert.equal(result.totalMinutes, 300); // 18000/60 = 300
  assert.equal(result.sessionCount, 12);
});

test('toWeeklyStudySummary — undefined row → 기본값 반환', () => {
  const result = toWeeklyStudySummary(undefined);
  assert.equal(result.totalMinutes, 0);
  assert.equal(result.sessionCount, 0);
});

// --- toTopicStudySummary ---

test('toTopicStudySummary — snake_case → camelCase 변환', () => {
  const result = toTopicStudySummary({
    topic_id: 'topic-abc',
    topic_name: '자료구조',
    total_seconds: 3600,
    session_count: 4,
  });
  assert.equal(result.topicId, 'topic-abc');
  assert.equal(result.topicName, '자료구조');
  assert.equal(result.totalMinutes, 60); // 3600/60 = 60
  assert.equal(result.sessionCount, 4);
});

test('toTopicStudySummary — 반올림 검증', () => {
  const result = toTopicStudySummary({
    topic_id: 'topic-1',
    topic_name: '알고리즘',
    total_seconds: 1530,
    session_count: 1,
  });
  assert.equal(result.totalMinutes, 26); // Math.round(25.5)
});
