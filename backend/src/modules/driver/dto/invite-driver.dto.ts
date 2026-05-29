import { IsEmail, IsOptional, IsString, MinLength, Matches } from 'class-validator';

export class InviteDriverDto {
  @IsString()
  @MinLength(2)
  fullName: string;

  @IsString()
  @Matches(/^(\+216|00216|0)?[2-9]\d{7}$/, {
    message: 'Numéro tunisien invalide',
  })
  phone: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  vehicleType?: string;
}
