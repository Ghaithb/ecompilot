import { IsString, IsNotEmpty, IsOptional, IsObject, IsNumber } from 'class-validator';

export class ChatCopilotDto {
  @IsString()
  @IsNotEmpty()
  message: string;

  @IsOptional()
  context?: any;
}

export class GenerateContentDto {
  @IsNotEmpty()
  productData: {
    title: string;
    category?: string;
    price?: number;
    attributes?: Record<string, any>;
  };
}

export class OptimizePricingDto {
  @IsString()
  @IsNotEmpty()
  productId: string;

  @IsOptional()
  marketData?: any;
}

export class MarketingStrategyDto {
  @IsOptional()
  @IsString()
  objective?: string;

  @IsOptional()
  @IsNumber()
  budget?: number;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  target?: string;

  @IsOptional()
  additionalData?: any;
}

