import test from 'node:test';
import assert from 'node:assert/strict';

import { getWeekStartAtMs } from '../.test-dist/src/shared/lib/dates.js';

// 2026-03-16 (월요일) 00:00:00 UTC => epoch ms
const MON_2026_03_16 = Date.UTC(2026, 2, 16); // 1742083200000

test('getWeekStartAtMs — 월요일 입력 시 동일 월요일 반환', () => {
  const monday = new Date(2026, 2, 16); // 2026-03-16
  const result = getWeekStartAtMs(monday);
  assert.equal(result, MON_2026_03_16);
});

test('getWeekStartAtMs — 화요일 입력 시 해당 주 월요일 반환', () => {
  const tuesday = new Date(2026, 2, 17); // 2026-03-17
  const result = getWeekStartAtMs(tuesday);
  assert.equal(result, MON_2026_03_16);
});

test('getWeekStartAtMs — 수요일 입력 시 해당 주 월요일 반환', () => {
  const wednesday = new Date(2026, 2, 18);
  const result = getWeekStartAtMs(wednesday);
  assert.equal(result, MON_2026_03_16);
});

test('getWeekStartAtMs — 목요일 입력 시 해당 주 월요일 반환', () => {
  const thursday = new Date(2026, 2, 19);
  const result = getWeekStartAtMs(thursday);
  assert.equal(result, MON_2026_03_16);
});

test('getWeekStartAtMs — 금요일 입력 시 해당 주 월요일 반환', () => {
  const friday = new Date(2026, 2, 20);
  const result = getWeekStartAtMs(friday);
  assert.equal(result, MON_2026_03_16);
});

test('getWeekStartAtMs — 토요일 입력 시 해당 주 월요일 반환', () => {
  const saturday = new Date(2026, 2, 21);
  const result = getWeekStartAtMs(saturday);
  assert.equal(result, MON_2026_03_16);
});

test('getWeekStartAtMs — 일요일 입력 시 해당 주 월요일 반환', () => {
  const sunday = new Date(2026, 2, 22);
  const result = getWeekStartAtMs(sunday);
  assert.equal(result, MON_2026_03_16);
});

test('getWeekStartAtMs — 경계값: 월요일 자정 직후 (00:00:01)', () => {
  // 2026-03-16 00:00:01 로컬 시간 → 해당 주 월요일
  const justAfterMidnight = new Date(2026, 2, 16, 0, 0, 1);
  const result = getWeekStartAtMs(justAfterMidnight);
  assert.equal(result, MON_2026_03_16);
});

test('getWeekStartAtMs — 경계값: 일요일 23:59:59', () => {
  // 2026-03-22 23:59:59 로컬 시간 → 해당 주 월요일(3/16)
  const justBeforeMidnight = new Date(2026, 2, 22, 23, 59, 59);
  const result = getWeekStartAtMs(justBeforeMidnight);
  assert.equal(result, MON_2026_03_16);
});

test('getWeekStartAtMs — 다음 주 월요일은 다른 값 반환', () => {
  const nextMonday = new Date(2026, 2, 23); // 2026-03-23
  const nextMondayMs = Date.UTC(2026, 2, 23);
  const result = getWeekStartAtMs(nextMonday);
  assert.equal(result, nextMondayMs);
  assert.notEqual(result, MON_2026_03_16);
});

test('getWeekStartAtMs — 이전 주 일요일은 이전 주 월요일 반환', () => {
  const prevSunday = new Date(2026, 2, 15); // 2026-03-15
  const prevMondayMs = Date.UTC(2026, 2, 9); // 2026-03-09
  const result = getWeekStartAtMs(prevSunday);
  assert.equal(result, prevMondayMs);
});
