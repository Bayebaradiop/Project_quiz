/**
 * Helper pour gérer la pagination
 */

import { PaginationMeta } from '../dto/ApiResponse.dto';

export interface PaginationParams {
  page?: number;
  limit?: number;
}

export interface PaginationResult {
  skip: number;
  take: number;
}

export class PaginationHelper {
  private static readonly DEFAULT_PAGE = 1;
  private static readonly DEFAULT_LIMIT = 10;
  private static readonly MAX_LIMIT = 100;

  /**
   * Calculer les paramètres Prisma (skip/take) depuis page/limit
   */
  static calculatePrismaParams(params: PaginationParams): PaginationResult {
    const page = Math.max(params.page || this.DEFAULT_PAGE, 1);
    const limit = Math.min(
      Math.max(params.limit || this.DEFAULT_LIMIT, 1),
      this.MAX_LIMIT
    );

    return {
      skip: (page - 1) * limit,
      take: limit,
    };
  }

  /**
   * Créer les métadonnées de pagination
   */
  static createMeta(
    page: number,
    limit: number,
    total: number
  ): PaginationMeta {
    const totalPages = Math.ceil(total / limit);

    return {
      page,
      limit,
      total,
      totalPages,
      hasNext: page < totalPages,
      hasPrev: page > 1,
    };
  }

  /**
   * Extraire les paramètres de pagination depuis l'URL
   */
  static extractParams(searchParams: URLSearchParams): PaginationParams {
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    return { page, limit };
  }
}
