import { IsString, IsNotEmpty, IsOptional, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RasaSendMessageDto {
  @ApiProperty({ description: 'Message de l\'utilisateur' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiProperty({ description: 'ID de la conversation (optionnel)', required: false })
  @IsString()
  @IsOptional()
  conversationId?: string;

  @ApiProperty({ description: 'Canal de communication', required: false })
  @IsString()
  @IsOptional()
  channel?: string;

  @ApiProperty({ description: 'Métadonnées additionnelles', required: false })
  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
