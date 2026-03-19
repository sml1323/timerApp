/**
 * 주어진 날짜(기본: 현재)가 속한 주의 월요일 00:00:00 UTC epoch ms를 반환한다.
 * ISO 8601 기준: 주는 월요일에 시작한다.
 */
export function getWeekStartAtMs(date = new Date()) {
    const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
    const day = d.getUTCDay(); // 0=일, 1=월, ..., 6=토
    const diff = day === 0 ? -6 : 1 - day; // 월요일까지의 차이
    d.setUTCDate(d.getUTCDate() + diff);
    return d.getTime();
}
