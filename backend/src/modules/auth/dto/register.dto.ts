import { IsEmail, IsString, MinLength, IsNotEmpty, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RegisterDto {
  @ApiProperty({ description: 'Email de l\'utilisateur', example: 'user@example.com' })
  @IsEmail({}, { message: 'L\'email doit être valide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @ApiProperty({ description: 'Mot de passe de l\'utilisateur', minLength: 6, example: 'password123' })
  @IsString({ message: 'Le mot de passe est requis' })
  @MinLength(6, { message: 'Le mot de passe doit contenir au moins 6 caractères' })
  @IsNotEmpty({ message: 'Le mot de passe est requis' })
  password: string;

  @ApiProperty({ description: 'Prénom de l\'utilisateur', example: 'John' })
  @IsString({ message: 'Le prénom est requis' })
  @IsNotEmpty({ message: 'Le prénom est requis' })
  firstName: string;

  @ApiProperty({ description: 'Nom de famille de l\'utilisateur', example: 'Doe' })
  @IsString({ message: 'Le nom est requis' })
  @IsNotEmpty({ message: 'Le nom est requis' })
  lastName: string;

  @ApiProperty({ description: 'Pays (code ISO)', example: 'FR', required: true })
  @IsString({ message: 'Le pays est requis' })
  @IsNotEmpty({ message: 'Le pays est requis' })
  country: string;

  @ApiProperty({ description: 'Numéro de téléphone (avec indicatif)', example: '+33 612345678', required: true })
  @IsString({ message: 'Le numéro de téléphone est requis' })
  @IsNotEmpty({ message: 'Le numéro de téléphone est requis' })
  phone: string;

  @ApiProperty({ description: 'Nom de l\'entreprise (optionnel)', example: 'ACME Inc.', required: false })
  @IsOptional()
  @IsString({ message: 'Le nom de l\'entreprise doit être une chaîne de caractères' })
  companyName?: string;
}