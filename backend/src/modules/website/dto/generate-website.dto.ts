import {
  IsString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  MaxLength,
  MinLength,
  ValidateNested,
  Matches,
  IsHexColor,
  IsIn,
  IsNotEmptyObject,
} from 'class-validator';
import { Type } from 'class-transformer';

class BusinessProfileDto {
  @IsString()
  @IsNotEmpty({ message: 'Le secteur d\'activité est requis' })
  @MaxLength(120)
  industry: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  primaryGoal?: string;

  @IsString()
  @IsOptional()
  @MaxLength(2000)
  description?: string;

  @IsString()
  @IsOptional()
  @IsIn(['general', 'mode', 'tech', 'maison', 'beaute'])
  niche?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  targetAudience?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  keyFeatures?: string;
}

class ContactInfoDto {
  @IsEmail({}, { message: 'Email invalide' })
  @IsNotEmpty({ message: 'L\'email est requis' })
  email: string;

  @IsString()
  @IsOptional()
  @Matches(/^[\d\s+()-]{10,}$/i, {
    message: 'Format de téléphone invalide',
  })
  phone?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  address?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  country?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  location?: string;
}

class BrandingPreferencesDto {
  @IsString()
  @IsOptional()
  @MaxLength(200)
  slogan?: string;

  @IsString()
  @IsOptional()
  @MaxLength(160)
  brandVoice?: string;

  @IsString()
  @IsOptional()
  @MaxLength(200)
  colorPalette?: string;

  @IsString()
  @IsOptional()
  @IsHexColor({ message: 'Couleur principale invalide (format: #RRGGBB)' })
  primaryColor?: string;

  @IsString()
  @IsOptional()
  @IsHexColor({ message: 'Couleur secondaire invalide (format: #RRGGBB)' })
  secondaryColor?: string;

  @IsString()
  @IsOptional()
  @Matches(/^https?:\/\/.+/i, { message: 'URL du logo invalide' })
  logoUrl?: string;
}

class ContentStrategyDto {
  @IsOptional()
  @IsIn(['yes', 'no'])
  hasExistingContent?: 'yes' | 'no';

  @IsString()
  @IsOptional()
  @MaxLength(3000)
  contentNotes?: string;

  @IsString()
  @IsOptional()
  @MaxLength(120)
  launchTimeline?: string;
}

export class GenerateWebsiteDto {
  @IsString()
  @IsNotEmpty({ message: 'Le nom de l\'entreprise est requis' })
  @MinLength(2, { message: 'Le nom doit contenir au moins 2 caractères' })
  @MaxLength(100, { message: 'Le nom ne peut pas dépasser 100 caractères' })
  companyName: string;

  @ValidateNested()
  @Type(() => BusinessProfileDto)
  @IsNotEmptyObject({ nullable: false })
  business: BusinessProfileDto;

  @ValidateNested()
  @Type(() => ContactInfoDto)
  @IsNotEmptyObject({ nullable: false })
  contact: ContactInfoDto;

  @ValidateNested()
  @Type(() => BrandingPreferencesDto)
  @IsOptional()
  branding?: BrandingPreferencesDto;

  @ValidateNested()
  @Type(() => ContentStrategyDto)
  @IsOptional()
  contentStrategy?: ContentStrategyDto;

  /** Thème storefront React (cod-classic, cod-minimal, …) — appliqué à la création uniquement */
  @IsString()
  @IsOptional()
  @MaxLength(64)
  storeTemplate?: string;

  /** Créer 3 produits exemples si le catalogue est vide (défaut: true côté API si omis) */
  @IsOptional()
  seedStarterProducts?: boolean;
}
