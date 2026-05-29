import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe implements PipeTransform {
  constructor(private readonly schema: ZodSchema) {}

  transform(value: unknown) {
    const result = this.schema.safeParse(value);
    if (!result.success) {
      throw new BadRequestException(formatZodError(result.error));
    }
    return result.data;
  }
}

function formatZodError(error: ZodError): { message: string; errors: unknown } {
  return {
    message: 'Validation échouée',
    errors: error.flatten(),
  };
}
