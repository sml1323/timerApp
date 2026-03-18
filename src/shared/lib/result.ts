export type Result<T, E = AppError> =
  | { ok: true; data: T }
  | { ok: false; code: string; message: string; details?: E };

export function ok<T>(data: T): Result<T> {
  return { ok: true, data };
}

export function err<T>(code: string, message: string, details?: unknown): Result<T> {
  return { ok: false, code, message, details } as Result<T>;
}

export interface AppError {
  code: string;
  message: string;
  details?: unknown;
}
