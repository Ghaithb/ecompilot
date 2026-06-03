import { PipeTransform, Injectable, BadRequestException } from '@nestjs/common';

export interface PaginationQuery {
  page: number;
  limit: number;
}

export const MAX_PAGE_LIMIT = 100;
export const DEFAULT_PAGE_LIMIT = 20;

/**
 * SEC-04: Pagination Pipe — forces page + limit bounds on all list endpoints.
 * Prevents fetching thousands of records in a single request.
 */
@Injectable()
export class PaginationPipe implements PipeTransform {
  transform(value: any): PaginationQuery {
    const page = parseInt(value?.page, 10) || 1;
    const limit = parseInt(value?.limit, 10) || DEFAULT_PAGE_LIMIT;

    if (page < 1) {
      throw new BadRequestException('page doit être >= 1');
    }

    if (limit < 1 || limit > MAX_PAGE_LIMIT) {
      throw new BadRequestException(
        `limit doit être entre 1 et ${MAX_PAGE_LIMIT}`,
      );
    }

    return { page, limit };
  }
}
