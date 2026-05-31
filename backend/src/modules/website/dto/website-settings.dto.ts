import { IsBoolean, IsOptional, IsString, MaxLength } from 'class-validator';

export class UpdateWebsiteDomainDto {
  @IsOptional()
  @IsString()
  @MaxLength(253)
  customDomain?: string;
}

export class UpdateWebsiteAnalyticsDto {
  @IsOptional()
  @IsString()
  @MaxLength(32)
  googleAnalyticsId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(32)
  facebookPixelId?: string;

  @IsOptional()
  @IsBoolean()
  enableTracking?: boolean;
}

export class UpdateStoreTemplateDto {
  @IsString()
  templateId!: string;
}

export class UpdateBrandingDto {
  @IsOptional()
  @IsString()
  @MaxLength(2048)
  logo?: string;

  @IsOptional()
  @IsString()
  @MaxLength(2048)
  coverImage?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  slogan?: string;
}
