import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { DeliveryProviderId } from '../enums/delivery-provider.enum';

export class ManifestItemDto {
  @ApiProperty()
  index: number;

  @ApiProperty()
  trackingNumber: string;

  @ApiPropertyOptional()
  orderNumber?: string;

  @ApiProperty()
  customerName: string;

  @ApiProperty()
  phone: string;

  @ApiProperty()
  address: string;

  @ApiProperty()
  codAmount: number;

  @ApiProperty()
  status: string;
}

export class ManifestSummaryDto {
  @ApiProperty()
  parcels: number;

  @ApiProperty()
  codParcels: number;

  @ApiProperty()
  codTotal: number;
}

export class DeliveryManifestDto {
  @ApiProperty({ enum: DeliveryProviderId })
  provider: DeliveryProviderId;

  @ApiProperty()
  providerLabel: string;

  @ApiProperty()
  generatedAt: string;

  @ApiProperty({ type: ManifestSummaryDto })
  summary: ManifestSummaryDto;

  @ApiProperty({ type: [ManifestItemDto] })
  items: ManifestItemDto[];

  @ApiPropertyOptional()
  html?: string;
}
