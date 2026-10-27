import { HttpResponse } from 'msw';

import { type ApiError, type ErrorCode, getErrorMessage } from '@/app/errors/apiErrors';

export function apiError(
  status: number,
  code: ErrorCode,
  extra: Partial<ApiError['error']> & Record<string, unknown> = {},
) {
  return HttpResponse.json(
    { error: { code, message: getErrorMessage(code), ...extra } },
    { status },
  );
}

export function validationError(fields: Record<string, string>) {
  return apiError(422, 'VALIDATION', { fields });
}
