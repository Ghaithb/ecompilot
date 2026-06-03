import { SetMetadata } from '@nestjs/common';
import { COD_PROTECTED_KEY } from '../guards/cod-status.guard';

/**
 * Decorator SEC-03: Mark an endpoint as COD-protected.
 * Combined with CodStatusGuard, this prevents merchants from setting status = paid.
 */
export const CodProtected = () => SetMetadata(COD_PROTECTED_KEY, true);
