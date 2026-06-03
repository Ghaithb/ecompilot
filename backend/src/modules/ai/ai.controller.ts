import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AiService } from './ai.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';

@Controller('ai')
@UseGuards(JwtAuthGuard, TenantGuard)
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('optimize-product')
  async optimizeProduct(@Body() body: { title: string; description: string }) {
    const optimizedDescription = await this.aiService.optimizeProductDescription(
      body.title,
      body.description,
    );
    const suggestedTags = await this.aiService.suggestProductTags(
      body.title,
      optimizedDescription,
    );

    return {
      description: optimizedDescription,
      tags: suggestedTags,
    };
  }
}
