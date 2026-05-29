import { IsString, IsNotEmpty, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum MessageType {
  TEXT = 'text',
  TEMPLATE = 'template',
  IMAGE = 'image',
  DOCUMENT = 'document',
}

export class WhatsAppSendMessageDto {
  @ApiProperty({ description: 'Numéro téléphone destinataire (format international)', example: '+2250709876543' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ description: 'Contenu du message', example: 'Bonjour, votre commande est confirmée!' })
  @IsString()
  @IsNotEmpty()
  message: string;

  @ApiPropertyOptional({ enum: MessageType, default: MessageType.TEXT })
  @IsEnum(MessageType)
  @IsOptional()
  type?: MessageType;
}

export class SendTemplateDto {
  @ApiProperty({ description: 'Numéro téléphone destinataire', example: '+2250709876543' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ description: 'Nom du template', example: 'order_confirmation' })
  @IsString()
  @IsNotEmpty()
  templateName: string;

  @ApiPropertyOptional({ description: 'Paramètres du template', example: { '1': 'Jean', '2': '#1234' } })
  @IsObject()
  @IsOptional()
  params?: Record<string, string>;

  @ApiPropertyOptional({ description: 'Code langue', example: 'fr', default: 'fr' })
  @IsString()
  @IsOptional()
  languageCode?: string;
}

export class SendMediaDto {
  @ApiProperty({ description: 'Numéro téléphone destinataire', example: '+2250709876543' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ description: 'URL du média', example: 'https://example.com/image.jpg' })
  @IsString()
  @IsNotEmpty()
  mediaUrl: string;

  @ApiPropertyOptional({ description: 'Légende ou nom fichier' })
  @IsString()
  @IsOptional()
  caption?: string;

  @ApiProperty({ enum: ['image', 'document'], example: 'image' })
  @IsEnum(['image', 'document'])
  mediaType: 'image' | 'document';
}

export class OrderNotificationDto {
  @ApiProperty({ description: 'Numéro téléphone commerçant' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ description: 'Numéro de commande', example: '1234' })
  @IsString()
  @IsNotEmpty()
  orderNumber: string;

  @ApiProperty({ description: 'Montant avec devise', example: '15,000 CFA' })
  @IsString()
  @IsNotEmpty()
  amount: string;

  @ApiProperty({ description: 'Nom du client', example: 'Jean Kouassi' })
  @IsString()
  @IsNotEmpty()
  customerName: string;

  @ApiPropertyOptional({ description: 'Lien vers la commande' })
  @IsString()
  @IsOptional()
  link?: string;
}

export class LowStockAlertDto {
  @ApiProperty({ description: 'Numéro téléphone commerçant' })
  @IsString()
  @IsNotEmpty()
  to: string;

  @ApiProperty({ description: 'Nom du produit', example: 'T-shirt Rouge M' })
  @IsString()
  @IsNotEmpty()
  productName: string;

  @ApiProperty({ description: 'Stock restant', example: 3 })
  @IsNotEmpty()
  stock: number;

  @ApiPropertyOptional({ description: 'Seuil d\'alerte', example: 5 })
  @IsOptional()
  threshold?: number;
}
