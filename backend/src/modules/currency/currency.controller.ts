import { Controller, Get, Query, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery, ApiParam } from '@nestjs/swagger';
import { CurrencyService } from './currency.service';
import { REGIONAL_PRICING, getCurrencyByCountry } from '../../config/currencies.config';

@ApiTags('currency')
@Controller('currency')
export class CurrencyController {
  constructor(private readonly currencyService: CurrencyService) {}

  @Get('convert')
  @ApiOperation({ summary: 'Convertir un montant', description: 'Convertit un montant d\'une devise à une autre' })
  @ApiQuery({ name: 'amount', type: Number, description: 'Montant à convertir' })
  @ApiQuery({ name: 'from', type: String, description: 'Devise source (ex: EUR)' })
  @ApiQuery({ name: 'to', type: String, description: 'Devise cible (ex: XOF)' })
  @ApiResponse({ status: 200, description: 'Conversion effectuée avec succès' })
  async convert(
    @Query('amount') amount: string,
    @Query('from') from: string,
    @Query('to') to: string,
  ) {
    const numAmount = parseFloat(amount);
    const converted = await this.currencyService.convert(numAmount, from.toUpperCase(), to.toUpperCase());
    
    return {
      original: {
        amount: numAmount,
        currency: from.toUpperCase(),
        formatted: this.currencyService.formatAmount(numAmount, from.toUpperCase()),
      },
      converted: {
        amount: converted,
        currency: to.toUpperCase(),
        formatted: this.currencyService.formatAmount(converted, to.toUpperCase()),
      },
      rate: converted / numAmount,
    };
  }

  @Get('rates/:base')
  @ApiOperation({ summary: 'Obtenir tous les taux', description: 'Obtient tous les taux de change pour une devise de base' })
  @ApiParam({ name: 'base', type: String, description: 'Devise de base (ex: EUR)' })
  @ApiResponse({ status: 200, description: 'Taux récupérés avec succès' })
  async getAllRates(@Param('base') base: string) {
    const rates = await this.currencyService.getAllRates(base.toUpperCase());
    return {
      base: base.toUpperCase(),
      rates,
      timestamp: new Date().toISOString(),
    };
  }

  @Get('info/:code')
  @ApiOperation({ summary: 'Informations sur une devise', description: 'Obtient les informations détaillées d\'une devise' })
  @ApiParam({ name: 'code', type: String, description: 'Code de la devise (ex: XOF)' })
  @ApiResponse({ status: 200, description: 'Informations récupérées avec succès' })
  getCurrencyInfo(@Param('code') code: string) {
    const info = this.currencyService.getCurrencyInfo(code.toUpperCase());
    if (!info) {
      return {
        error: 'Currency not found',
        code: code.toUpperCase(),
      };
    }
    return info;
  }

  @Get('list')
  @ApiOperation({ summary: 'Liste des devises', description: 'Liste toutes les devises disponibles' })
  @ApiResponse({ status: 200, description: 'Liste récupérée avec succès' })
  getAllCurrencies() {
    return {
      currencies: this.currencyService.getAllCurrencies(),
      count: this.currencyService.getAllCurrencies().length,
    };
  }

  @Get('pricing/:currency')
  @ApiOperation({ summary: 'Tarifs par devise', description: 'Obtient les tarifs adaptés pour une devise' })
  @ApiParam({ name: 'currency', type: String, description: 'Code de la devise (ex: XOF)' })
  @ApiResponse({ status: 200, description: 'Tarifs récupérés avec succès' })
  getPricingByCurrency(@Param('currency') currency: string) {
    const currencyUpper = currency.toUpperCase();
    const pricing = REGIONAL_PRICING[currencyUpper];
    
    if (!pricing) {
      return {
        error: 'Pricing not available for this currency',
        currency: currencyUpper,
        fallback: REGIONAL_PRICING['EUR'],
      };
    }
    
    return {
      currency: currencyUpper,
      region: pricing.region,
      plans: pricing.plans,
    };
  }

  @Get('pricing-by-country/:country')
  @ApiOperation({ summary: 'Tarifs par pays', description: 'Obtient les tarifs adaptés pour un pays' })
  @ApiParam({ name: 'country', type: String, description: 'Code du pays (ex: SN pour Sénégal)' })
  @ApiResponse({ status: 200, description: 'Tarifs récupérés avec succès' })
  getPricingByCountry(@Param('country') country: string) {
    const countryUpper = country.toUpperCase();
    const currency = getCurrencyByCountry(countryUpper);
    const pricing = REGIONAL_PRICING[currency];
    
    return {
      country: countryUpper,
      currency,
      region: pricing?.region || 'Europe',
      plans: pricing?.plans || REGIONAL_PRICING['EUR'].plans,
    };
  }

  @Get('validate')
  @ApiOperation({ summary: 'Valider un montant', description: 'Vérifie si un montant est valide pour une devise' })
  @ApiQuery({ name: 'amount', type: Number, description: 'Montant à valider' })
  @ApiQuery({ name: 'currency', type: String, description: 'Code de la devise' })
  @ApiResponse({ status: 200, description: 'Validation effectuée' })
  validateAmount(
    @Query('amount') amount: string,
    @Query('currency') currency: string,
    @Query('code') code?: string,
  ) {
    const currencyCode = (currency || code || 'TND').toUpperCase();
    const numAmount = amount !== undefined && amount !== '' ? parseFloat(amount) : 0;
    if (!Number.isFinite(numAmount)) {
      return {
        amount: null,
        currency: currencyCode,
        isValid: false,
        minAmount: this.currencyService.getMinAmount(currencyCode),
        message: 'Amount must be a valid number',
      };
    }
    const currencyUpper = currencyCode;
    const isValid = this.currencyService.validateAmount(numAmount, currencyUpper);
    const minAmount = this.currencyService.getMinAmount(currencyUpper);
    
    return {
      amount: numAmount,
      currency: currencyUpper,
      isValid,
      minAmount,
      message: isValid 
        ? 'Amount is valid' 
        : `Amount must be at least ${this.currencyService.formatAmount(minAmount, currencyUpper)}`,
    };
  }
}
