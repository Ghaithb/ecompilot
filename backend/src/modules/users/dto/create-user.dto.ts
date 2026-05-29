import { IsEmail, IsOptional, IsString, IsArray, ArrayNotEmpty, IsIn } from 'class-validator';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsArray()
  @ArrayNotEmpty()
  roles: string[]; // e.g., ['user'] | ['admin']

  @IsOptional()
  @IsIn(['active', 'invited', 'disabled'])
  status?: 'active' | 'invited' | 'disabled';
}
