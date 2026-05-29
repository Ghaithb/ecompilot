import { IsString, MinLength, IsEmail, Matches } from 'class-validator';

export class RequestPasswordResetDto {
  @IsEmail({}, { message: 'Veuillez fournir une adresse email valide' })
  email: string;
}

export class ConfirmPasswordResetDto {
  @IsString()
  token: string;

  @IsString()
  @MinLength(8, { message: 'Le mot de passe doit contenir au moins 8 caractères' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message: 'Le mot de passe doit contenir au moins une majuscule, une minuscule et un chiffre',
  })
  newPassword: string;
}
