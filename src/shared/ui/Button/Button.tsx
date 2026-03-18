import { type ButtonHTMLAttributes, type ReactNode } from "react";
import styles from "./Button.module.css";
import { cn } from "../../lib/cn";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  /** 버튼 색상 변형 */
  variant?: "primary" | "secondary" | "text" | "destructive";
  /** 버튼 크기 */
  size?: "small" | "medium" | "large";
  /** 로딩 상태 */
  isLoading?: boolean;
  /** 버튼 내용 */
  children: ReactNode;
}

/**
 * 공통 Button 컴포넌트
 *
 * - `variant`: primary | secondary | text | destructive
 * - `size`: small | medium | large
 * - `isLoading`: 로딩 스피너 표시
 * - `disabled` 또는 `aria-disabled`로 비활성 상태 처리
 */
export function Button({
  variant = "primary",
  size = "medium",
  isLoading = false,
  disabled = false,
  className,
  children,
  ...rest
}: ButtonProps) {
  const isDisabled = disabled || isLoading;

  return (
    <button
      className={cn(
        styles.button,
        styles[variant],
        styles[size],
        isDisabled && styles.disabled,
        isLoading && styles.loading,
        className,
      )}
      disabled={isDisabled}
      aria-disabled={isDisabled || undefined}
      aria-busy={isLoading || undefined}
      {...rest}
    >
      {children}
      {isLoading && <span className={styles.spinner} aria-hidden="true" />}
    </button>
  );
}
