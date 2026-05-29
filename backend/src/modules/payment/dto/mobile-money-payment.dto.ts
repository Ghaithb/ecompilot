import { IsString, IsNumber, IsOptional, IsEnum, Min, IsEmail, IsPhoneNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum MobileMoneyProvider {
  ORANGE_MONEY = 'orange_money',
  MTN_MOMO = 'mtn_momo',
  MOOV_MONEY = 'moov_money',
  AIRTEL_MONEY = 'airtel_money',
  WAVE = 'wave',
  ALL = 'all', // Laisse l'utilisateur choisir
}

export class CreateMobileMoneyPaymentDto {
  @ApiProperty({ description: 'Montant du paiement', example: 15000 })
  @IsNumber()
  @Min(100)
  amount: number;

  @ApiProperty({ description: 'Code de la devise', example: 'XOF' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Description du paiement', example: 'Abonnement Pro - 1 mois' })
  @IsString()
  description: string;

  @ApiProperty({ description: 'Numéro de téléphone du client', example: '+2250709876543' })
  @IsString()
  phoneNumber: string;

  @ApiProperty({ 
    description: 'Provider Mobile Money', 
    enum: MobileMoneyProvider,
    example: MobileMoneyProvider.ORANGE_MONEY,
    required: false 
  })
  @IsOptional()
  @IsEnum(MobileMoneyProvider)
  provider?: MobileMoneyProvider;

  @ApiProperty({ description: 'Nom du client', example: 'Kouassi Jean', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ description: 'Email du client', example: 'jean@example.com', required: false })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ description: 'Code pays', example: 'CI', required: false })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiProperty({ description: 'Métadonnées additionnelles', required: false })
  @IsOptional()
  metadata?: Record<string, any>;
}

export class CheckPaymentStatusDto {
  @ApiProperty({ description: 'ID de la transaction', example: 'TX1697654321123456' })
  @IsString()
  transactionId: string;
}

export class MobileMoneyWebhookDto {
  @ApiProperty({ description: 'ID de la transaction' })
  @IsString()
  transaction_id: string;

  @ApiProperty({ description: 'Statut du paiement' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Montant' })
  @IsNumber()
  amount: number;

  @ApiProperty({ description: 'Devise' })
  @IsString()
  currency: string;

  @ApiProperty({ description: 'Méthode de paiement' })
  @IsOptional()
  @IsString()
  payment_method?: string;

  @ApiProperty({ description: 'Signature pour vérification' })
  @IsOptional()
  @IsString()
  signature?: string;
}
