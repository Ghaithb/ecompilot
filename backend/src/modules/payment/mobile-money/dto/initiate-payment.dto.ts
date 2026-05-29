import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsNumber, IsString, IsOptional, IsEmail, Min, Matches } from 'class-validator';
import { MobileMoneyProvider } from '../schemas/mobile-transaction.schema';

export class InitiatePaymentDto {
  @ApiProperty({ description: 'ID de la commande', example: 'ORDER-12345' })
  @IsNotEmpty()
  @IsString()
  orderId: string;

  @ApiProperty({ 
    description: 'Provider Mobile Money', 
    enum: MobileMoneyProvider,
    example: MobileMoneyProvider.WAVE
  })
  @IsNotEmpty()
  @IsEnum(MobileMoneyProvider)
  provider: MobileMoneyProvider;

  @ApiProperty({ description: 'Numéro de téléphone', example: '+221771234567' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^\+?[1-9]\d{1,14}$/, { message: 'Numéro de téléphone invalide (format E.164)' })
  phoneNumber: string;

  @ApiProperty({ description: 'Montant à payer', example: 25000 })
  @IsNotEmpty()
  @IsNumber()
  @Min(100, { message: 'Montant minimum: 100' })
  amount: number;

  @ApiProperty({ description: 'Devise', example: 'XOF', default: 'XOF' })
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiProperty({ description: 'Nom du client', example: 'Jean Dupont', required: false })
  @IsOptional()
  @IsString()
  customerName?: string;

  @ApiProperty({ description: 'Email du client', example: 'jean@example.com', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Métadonnées additionnelles', required: false })
  @IsOptional()
  metadata?: any;
}
