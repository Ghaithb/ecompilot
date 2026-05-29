import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class VerifyPaymentDto {
  @ApiProperty({ description: 'ID de la transaction', example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsString()
  transactionId: string;
}

export class RefundPaymentDto {
  @ApiProperty({ description: 'ID de la transaction', example: '507f1f77bcf86cd799439011' })
  @IsNotEmpty()
  @IsString()
  transactionId: string;

  @ApiProperty({ description: 'Raison du remboursement', example: 'Commande annulée' })
  @IsNotEmpty()
  @IsString()
  reason: string;
}
