/**
 * DTO pour standardiser toutes les réponses API
 */

export interface ApiResponseMeta {
  timestamp: string;
  version: string;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface ErrorDetails {
  code: string;
  message: string;
  details?: any;
}

export class ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: ErrorDetails;
  meta: ApiResponseMeta;
  pagination?: PaginationMeta;

  constructor(
    success: boolean,
    data?: T | undefined,
    error?: ErrorDetails | undefined,
    pagination?: PaginationMeta | undefined
  ) {
    this.success = success;
    if (data !== undefined) {
      this.data = data;
    }
    if (error !== undefined) {
      this.error = error;
    }
    this.meta = {
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    };
    if (pagination !== undefined) {
      this.pagination = pagination;
    }
  }

  /**
   * Créer une réponse de succès
   */
  static success<T>(data: T, pagination?: PaginationMeta): ApiResponse<T> {
    return new ApiResponse<T>(true, data, undefined, pagination);
  }

  /**
   * Créer une réponse d'erreur
   */
  static error(code: string, message: string, details?: any): ApiResponse<null> {
    return new ApiResponse<null>(false, undefined, { code, message, details });
  }
}

/**
 * Codes d'erreur standardisés
 */
export const ERROR_CODES = {
  // Erreurs générales
  VALIDATION_ERROR: 'VALIDATION_ERROR',
  INTERNAL_ERROR: 'INTERNAL_ERROR',
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',

  // Erreurs utilisateur
  USER_NOT_FOUND: 'USER_NOT_FOUND',
  USER_ALREADY_EXISTS: 'USER_ALREADY_EXISTS',
  INVALID_CREDENTIALS: 'INVALID_CREDENTIALS',
  EMAIL_ALREADY_EXISTS: 'EMAIL_ALREADY_EXISTS',

  // Erreurs quiz
  QUIZ_NOT_FOUND: 'QUIZ_NOT_FOUND',
  QUIZ_NOT_PUBLISHED: 'QUIZ_NOT_PUBLISHED',
  QUIZ_ALREADY_PARTICIPATED: 'QUIZ_ALREADY_PARTICIPATED',
  QUIZ_ACCESS_DENIED: 'QUIZ_ACCESS_DENIED',

  // Erreurs question
  QUESTION_NOT_FOUND: 'QUESTION_NOT_FOUND',
  INVALID_QUESTION_ORDER: 'INVALID_QUESTION_ORDER',

  // Erreurs invitation
  INVITATION_NOT_FOUND: 'INVITATION_NOT_FOUND',
  INVITATION_EXPIRED: 'INVITATION_EXPIRED',
  INVALID_ACCESS_CODE: 'INVALID_ACCESS_CODE',

  // Erreurs participation
  PARTICIPATION_NOT_FOUND: 'PARTICIPATION_NOT_FOUND',
  PARTICIPATION_ALREADY_COMPLETED: 'PARTICIPATION_ALREADY_COMPLETED',
  PARTICIPATION_NOT_IN_PROGRESS: 'PARTICIPATION_NOT_IN_PROGRESS',
  PARTICIPATION_ACCESS_DENIED: 'PARTICIPATION_ACCESS_DENIED',

  // Erreurs réponse
  INVALID_RESPONSE: 'INVALID_RESPONSE',
  RESPONSE_ALREADY_SUBMITTED: 'RESPONSE_ALREADY_SUBMITTED',
} as const;
