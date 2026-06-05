import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { NotificationsService } from './notifications.service';
import { PushService } from './push.service';
import { TwilioSmsProvider } from './providers/twilio-sms.provider';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { CreateNotificationDto } from './dto/notification.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { TenantId } from '../../common/decorators/tenant.decorator';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@ApiTags('notifications')
@ApiBearerAuth()
@Controller('notifications')
@UseGuards(JwtAuthGuard, TenantGuard)
export class NotificationsController {
  constructor(
    private readonly notificationsService: NotificationsService,
    private readonly twilioSms: TwilioSmsProvider,
    private readonly pushService: PushService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a notification' })
  @ApiResponse({ status: 201, description: 'Notification created successfully' })
  create(
    @TenantId() tenantId: string,
    @Body() createNotificationDto: CreateNotificationDto,
  ) {
    return this.notificationsService.create(tenantId, createNotificationDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications' })
  @ApiResponse({ status: 200, description: 'Return all notifications' })
  findAll(
    @TenantId() tenantId: string,
    @Query('read') read?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: string,
    @Query('skip') skip?: string,
  ) {
    return this.notificationsService.findAll(tenantId, {
      read: read === 'true',
      type,
      limit: limit ? parseInt(limit, 10) : undefined,
      skip: skip ? parseInt(skip, 10) : undefined,
    });
  }

  @Patch(':id/read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark notification as read' })
  @ApiResponse({ status: 200, description: 'Notification marked as read' })
  markAsRead(
    @TenantId() tenantId: string,
    @Param('id') id: string,
  ) {
    return this.notificationsService.markAsRead(tenantId, id);
  }

  @Post('mark-all-read')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Mark all notifications as read' })
  @ApiResponse({ status: 200, description: 'All notifications marked as read' })
  markAllAsRead(@TenantId() tenantId: string) {
    return this.notificationsService.markAllAsRead(tenantId);
  }

  @Get('messaging-status')
  @ApiOperation({ summary: 'SMS / messaging integration status for merchant UI' })
  getMessagingStatus() {
    const configured = this.twilioSms.isConfigured();
    return {
      sms: {
        configured,
        status: configured ? 'live' : 'pilot',
        provider: 'twilio',
      },
    };
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notifications count' })
  @ApiResponse({ status: 200, description: 'Return unread notifications count' })
  getUnreadCount(@TenantId() tenantId: string) {
    return this.notificationsService.getUnreadCount(tenantId);
  }

  @Post('push-subscribe')
  @ApiOperation({ summary: 'Subscribe to Web Push notifications' })
  subscribePush(
    @CurrentUser() user: any,
    @Body() subscription: any,
  ) {
    return this.pushService.saveSubscription(user._id, subscription);
  }
}