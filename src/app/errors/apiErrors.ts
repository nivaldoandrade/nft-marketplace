import { isAxiosError } from 'axios';

import type { ValueOf } from '@/app/utils/ValueOf';

export const ErrorCode = {
  VALIDATION: 'VALIDATION',
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  FORBIDDEN: 'FORBIDDEN',
  RESOURCE_NOT_FOUND: 'RESOURCE_NOT_FOUND',
  EMAIL_ALREADY_IN_USE: 'EMAIL_ALREADY_IN_USE',
  USERNAME_ALREADY_IN_USE: 'USERNAME_ALREADY_IN_USE',
  INVALID_PASSWORD: 'INVALID_PASSWORD',

  // Catalog / Cart
  EDITION_UNAVAILABLE: 'EDITION_UNAVAILABLE',
  QUANTITY_UNAVAILABLE: 'QUANTITY_UNAVAILABLE',
  COUPON_INVALID: 'COUPON_INVALID',
  COUPON_EXPIRED: 'COUPON_EXPIRED',

  // Checkout
  QUOTE_OUTDATED: 'QUOTE_OUTDATED',
  IDEMPOTENCY_CONFLICT: 'IDEMPOTENCY_CONFLICT',
  WALLET_NOT_FOUND: 'WALLET_NOT_FOUND',

  // HTTP / Network
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_SERVER_ERROR: 'INTERNAL_SERVER_ERROR',
  SERVICE_UNAVAILABLE: 'SERVICE_UNAVAILABLE',
  TIMEOUT: 'TIMEOUT',
  NETWORK_ERROR: 'NETWORK_ERROR',
  INVALID_RESPONSE: 'INVALID_RESPONSE',
} as const;

export type ErrorCode = ValueOf<typeof ErrorCode>;

export type ApiError = {
  error: {
    code: ErrorCode;
    message: string;
    fields?: Record<string, string>;
  };
};

export const ApiErrorMessages: Record<ErrorCode, string> = {
  VALIDATION: 'Verifique os campos e tente novamente.',
  UNAUTHORIZED: 'Faça login para continuar.',
  SESSION_EXPIRED: 'Sua sessão expirou. Faça login novamente.',
  INVALID_CREDENTIALS: 'E-mail ou senha incorretos.',
  FORBIDDEN: 'Você não tem permissão para acessar este recurso.',
  RESOURCE_NOT_FOUND: 'Recurso não encontrado.',
  EMAIL_ALREADY_IN_USE: 'Este e-mail já está em uso.',
  USERNAME_ALREADY_IN_USE: 'Este nome de usuário já está em uso.',
  INVALID_PASSWORD: 'Senha atual incorreta.',
  EDITION_UNAVAILABLE: 'Esta edição não está mais disponível.',
  QUANTITY_UNAVAILABLE: 'Quantidade indisponível para esta edição.',
  COUPON_INVALID: 'Cupom inválido.',
  COUPON_EXPIRED: 'Este cupom expirou.',
  QUOTE_OUTDATED: 'Os valores do pedido mudaram. Revise antes de confirmar.',
  IDEMPOTENCY_CONFLICT: 'Este pedido já foi enviado com dados diferentes.',
  WALLET_NOT_FOUND: 'Carteira não encontrada.',
  BAD_REQUEST: 'Requisição inválida.',
  INTERNAL_SERVER_ERROR: 'Erro interno. Tente novamente mais tarde.',
  SERVICE_UNAVAILABLE: 'Serviço indisponível no momento. Tente novamente em instantes.',
  TIMEOUT: 'A requisição demorou demais. Tente novamente.',
  NETWORK_ERROR: 'Sem conexão com o servidor. Verifique sua internet.',
  INVALID_RESPONSE: 'O servidor enviou uma resposta inesperada. Tente novamente.',
};

export function getErrorMessage(code?: ErrorCode): string {
  return (code && ApiErrorMessages[code]) || 'Ocorreu um erro. Tente novamente.';
}

export function getApiErrorCode(error: unknown): ErrorCode | undefined {
  if (!isAxiosError<ApiError>(error)) {
    return undefined;
  }

  if (error.code === 'ECONNABORTED' || error.code === 'ETIMEDOUT') {
    return ErrorCode.TIMEOUT;
  }

  if (error.code === ErrorCode.INVALID_RESPONSE) {
    return ErrorCode.INVALID_RESPONSE;
  }

  if (!error.response) {
    return ErrorCode.NETWORK_ERROR;
  }

  return error.response.data?.error?.code;
}

export function getApiErrorFields(error: unknown): Record<string, string> | undefined {
  if (!isAxiosError<ApiError>(error)) {
    return undefined;
  }

  return error.response?.data?.error?.fields;
}

export function isTransientError(error: unknown): boolean {
  if (!isAxiosError(error)) {
    return false;
  }

  if (!error.response) {
    return true;
  }

  const { status } = error.response;

  return status === 408 || status === 429 || status >= 500;
}
