import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ReviewsService } from './reviews.service';

@ApiTags('reviews')
@ApiBearerAuth()
@Controller('reviews')
@UseGuards(JwtAuthGuard, TenantGuard)
export class ReviewsController {
  constructor(private readonly reviewsService: ReviewsService) {}

  @Get()
  @ApiOperation({ summary: 'Liste avis' })
  getReviews(@TenantId() tenantId: string, @Query('productId') productId?: string) {
    return this.reviewsService.getReviews(tenantId, productId);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Statistiques avis' })
  getStats(@TenantId() tenantId: string) {
    return this.reviewsService.getStats(tenantId);
  }

  @Post()
  @ApiOperation({ summary: 'Créer avis' })
  createReview(@TenantId() tenantId: string, @Body() data: any) {
    return this.reviewsService.createReview(tenantId, data);
  }

  @Put(':id/publish')
  @ApiOperation({ summary: 'Publier avis' })
  publishReview(@TenantId() tenantId: string, @Param('id') id: string) {
    return this.reviewsService.publishReview(tenantId, id);
  }

  @Put(':id/reply')
  @ApiOperation({ summary: 'Répondre à avis' })
  replyToReview(@TenantId() tenantId: string, @Param('id') id: string, @Body() data: any) {
    return this.reviewsService.replyToReview(tenantId, id, data.reply);
  }
}
