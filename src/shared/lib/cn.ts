/**
 * className 결합 유틸리티
 * 외부 의존성(clsx, classnames) 없이 조건부 className 결합 처리
 */
type ClassValue = string | undefined | null | false | 0;

export function cn(...classes: ClassValue[]): string {
  return classes.filter(Boolean).join(" ");
}
