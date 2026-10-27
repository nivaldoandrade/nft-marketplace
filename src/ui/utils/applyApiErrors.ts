import type { FieldValues, Path, UseFormReturn } from 'react-hook-form';

import { getApiErrorCode, getApiErrorFields, getErrorMessage } from '@/app/errors/apiErrors';

export function applyApiErrors<T extends FieldValues>(form: UseFormReturn<T>, error: unknown) {
  const fields = getApiErrorFields(error);

  if (fields) {
    Object.entries(fields).forEach(([name, message]) => {
      form.setError(name as Path<T>, { message }, { shouldFocus: true });
    });
    return;
  }

  form.setError('root.api', { message: getErrorMessage(getApiErrorCode(error)) });
}
