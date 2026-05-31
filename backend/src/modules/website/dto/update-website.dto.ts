import { IsString, IsOptional, IsBoolean, IsObject, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== THEME DTO ====================
export class ThemeDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  accentColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  backgroundColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  textColor?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  font?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  logo?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  favicon?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  coverImage?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slogan?: string;
}

// ==================== SEO DTO ====================
export class SeoDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  keywords?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  ogImage?: string;
}

// ==================== SETTINGS DTO ====================
export class SettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableCart?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableCheckout?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  enableContact?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  currency?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  language?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  timezone?: string;
}

// ==================== FEATURES DTO ====================
export class CustomServiceDto {
  @ApiProperty()
  @IsString()
  id: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  description: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  price?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  duration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  icon?: string;
}

export class EcommerceFeatureDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  paymentMethods?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  shippingMethods?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  taxRate?: number;
}

export class BookingFeatureDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxGuestsPerSlot?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  bookingDuration?: number;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  availableTimeSlots?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  advanceBookingDays?: number;
}

export class ContactFeatureDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  autoReply?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  notificationEmail?: string;
}

export class NewsletterFeatureDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  provider?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  welcomeEmail?: boolean;
}

export class BlogFeatureDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  commentsEnabled?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  categoriesEnabled?: boolean;
}

export class GalleryFeatureDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowUpload?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  maxImages?: number;
}

export class ServicesFeatureDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional({ type: [CustomServiceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomServiceDto)
  customServices?: CustomServiceDto[];
}

export class ReviewsFeatureDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  moderationRequired?: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowRatings?: boolean;
}

export class FaqFeatureDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  categories?: string[];
}

export class MultiLanguageFeatureDto {
  @ApiProperty()
  @IsBoolean()
  enabled: boolean;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  languages?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  defaultLanguage?: string;
}

export class FeaturesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => EcommerceFeatureDto)
  ecommerce?: EcommerceFeatureDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => BookingFeatureDto)
  booking?: BookingFeatureDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ContactFeatureDto)
  contact?: ContactFeatureDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => NewsletterFeatureDto)
  newsletter?: NewsletterFeatureDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => BlogFeatureDto)
  blog?: BlogFeatureDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => GalleryFeatureDto)
  gallery?: GalleryFeatureDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ServicesFeatureDto)
  services?: ServicesFeatureDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ReviewsFeatureDto)
  reviews?: ReviewsFeatureDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => FaqFeatureDto)
  faq?: FaqFeatureDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => MultiLanguageFeatureDto)
  multiLanguage?: MultiLanguageFeatureDto;
}

// ==================== BUSINESS CONFIG DTO ====================
export class BusinessConfigDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  industry?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  targetAudience?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsArray()
  uniqueSellingPoints?: string[];

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  customFields?: Record<string, any>;
}

// ==================== UPDATE WEBSITE DTO ====================
export class UpdateWebsiteDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  slug?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => ThemeDto)
  theme?: ThemeDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => SeoDto)
  seo?: SeoDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => SettingsDto)
  settings?: SettingsDto;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => FeaturesDto)
  features?: FeaturesDto;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  businessType?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @ValidateNested()
  @Type(() => BusinessConfigDto)
  businessConfig?: BusinessConfigDto;
}

// ==================== UPDATE FEATURES ONLY DTO ====================
export class UpdateFeaturesDto {
  @ApiProperty({ description: 'Configuration des fonctionnalités du site' })
  @ValidateNested()
  @Type(() => FeaturesDto)
  features: FeaturesDto;
}
