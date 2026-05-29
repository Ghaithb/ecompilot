import { IsEmail, IsOptional, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ description: 'Email de l\'utilisateur', required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: 'Prénom', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ description: 'Nom', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ description: 'Nom de l\'entreprise', required: false })
  @IsOptional()
  @IsString()
  companyName?: string;
}

export class ChangePasswordDto {
  @ApiProperty({ description: 'Mot de passe actuel' })
  @IsString()
  @MinLength(6)
  currentPassword: string;

  @ApiProperty({ description: 'Nouveau mot de passe' })
  @IsString()
  @MinLength(6)
  newPassword: string;
}

export class UpdatePreferencesDto {
  @ApiProperty({ description: 'Notifications par email', required: false })
  @IsOptional()
  emailNotifications?: boolean;

  @ApiProperty({ description: 'Notifications push', required: false })
  @IsOptional()
  pushNotifications?: boolean;

  @ApiProperty({ description: 'Mode sombre', required: false })
  @IsOptional()
  darkMode?: boolean;

  @ApiProperty({ description: 'Langue', required: false })
  @IsOptional()
  @IsString()
  language?: string;
}
