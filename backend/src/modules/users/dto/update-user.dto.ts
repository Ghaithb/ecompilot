import { IsEmail, IsOptional, IsString, IsArray, IsIn } from 'class-validator';

export class UpdateUserDto {
	@IsOptional()
	@IsEmail()
	email?: string;

	@IsOptional()
	@IsString()
	password?: string;

	@IsOptional()
	@IsString()
	firstName?: string;

	@IsOptional()
	@IsString()
	lastName?: string;

	@IsOptional()
	@IsArray()
	roles?: string[];

	@IsOptional()
	@IsIn(['active', 'invited', 'disabled'])
	status?: 'active' | 'invited' | 'disabled';
}
