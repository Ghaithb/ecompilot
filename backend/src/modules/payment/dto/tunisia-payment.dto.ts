import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class ConnectKonnectDto {
  @IsString()
  @IsNotEmpty()
  apiKey: string;

  @IsString()
  @IsNotEmpty()
  walletId: string;

  @IsBoolean()
  @IsOptional()
  sandbox?: boolean;
}

export class ConnectFlouciDto {
  @IsString()
  @IsNotEmpty()
  publicKey: string;

  @IsString()
  @IsNotEmpty()
  privateKey: string;

  @IsBoolean()
  @IsOptional()
  sandbox?: boolean;
}

export class ConfigureCodDto {
  @IsBoolean()
  enabled: boolean;

  @IsBoolean()
  @IsOptional()
  otpRequired?: boolean;
}

export class InitiateOrderPaymentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsNotEmpty()
  provider: 'konnect' | 'flouci';
}

export class CreatePaymentIntentDto {
  @IsString()
  @IsNotEmpty()
  orderId: string;

  @IsString()
  @IsOptional()
  provider?: 'konnect' | 'flouci';
}
