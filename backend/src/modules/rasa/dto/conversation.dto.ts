import { IsString, IsOptional, IsEnum, IsNumber, Min, Max } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateConversationDto {
  @ApiProperty({ description: 'Statut de la conversation', required: false })
  @IsEnum(['active', 'closed', 'resolved', 'escalated', 'abandoned'])
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Note de satisfaction (1-5)', required: false })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  satisfaction?: number;

  @ApiProperty({ description: 'Commentaire de satisfaction', required: false })
  @IsString()
  @IsOptional()
  satisfactionFeedback?: string;

  @ApiProperty({ description: 'Tags', required: false })
  @IsOptional()
  tags?: string[];
}

export class GetConversationsDto {
  @ApiProperty({ description: 'Page', required: false, default: 1 })
  @IsNumber()
  @IsOptional()
  page?: number;

  @ApiProperty({ description: 'Limite par page', required: false, default: 20 })
  @IsNumber()
  @IsOptional()
  limit?: number;

  @ApiProperty({ description: 'Statut', required: false })
  @IsString()
  @IsOptional()
  status?: string;

  @ApiProperty({ description: 'Canal', required: false })
  @IsString()
  @IsOptional()
  channel?: string;

  @ApiProperty({ description: 'ID utilisateur', required: false })
  @IsString()
  @IsOptional()
  userId?: string;
}
