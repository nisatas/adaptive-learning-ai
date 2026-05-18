import { HttpErrorResponse } from '@angular/common/http';

export function logApiError(
  context: string,
  error: unknown,
  endpoint?: string,
): void {
  if (error instanceof HttpErrorResponse) {
    console.error(`[API] ${context} failed`, {
      endpoint: endpoint ?? error.url,
      status: error.status,
      statusText: error.statusText,
      message: error.message,
      error: error.error,
    });
    return;
  }

  console.error(`[API] ${context} failed`, {
    endpoint,
    error,
  });
}
