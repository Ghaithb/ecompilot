import { IsString, IsNotEmpty, IsEnum, IsOptional, IsUrl, IsDate } from 'class-validator';
import type { NotificationType } from '../schemas/notification.schema';

export class CreateNotificationDto {
  @IsEnum(['stock', 'payment', 'subscription', 'alert', 'system'])
  type: NotificationType;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  message: string;

  @IsUrl()
  @IsOptional()
  link?: string;

  @IsEnum(['low', 'normal', 'high', 'urgent'])
  @IsOptional()
  priority?: string = 'normal';

  @IsDate()
  @IsOptional()
  expiresAt?: Date;

  @IsOptional()
  metadata?: any;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsEnum(['stock', 'payment', 'subscription', 'alert', 'system'])
  type?: NotificationType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  title?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  message?: string;

  @IsOptional()
  @IsUrl()
  link?: string;

  @IsOptional()
  @IsEnum(['low', 'normal', 'high', 'urgent'])
  priority?: string;

  @IsOptional()
  @IsDate()
  expiresAt?: Date;
}