import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InventoryService } from './inventory.service';
import { TenantsService } from '../tenants/tenants.service';


@Injectable()
export class InventoryTasksService {
  private readonly logger = new Logger(InventoryTasksService.name);

  constructor(
    private readonly inventoryService: InventoryService,

  private readonly tenantsService: TenantsService,
  ) {}

  @Cron(CronExpression.EVERY_HOUR)
  async checkLowStockForAllTenants() {
    this.logger.log('Début de la vérification des stocks bas pour tous les tenants');
    
    try {
      const tenants = await this.tenantsService.findAll();
      for (const tenant of tenants) {
        try {
          if (tenant._id) {
            await this.inventoryService.checkLowStock(tenant._id.toString());
          } else {
            this.logger.warn(`Tenant without _id encountered: ${JSON.stringify(tenant)}`);
          }
        } catch (error) {
          this.logger.error(
            `Erreur lors de la vérification des stocks pour le tenant ${tenant._id}: ${error.message}`,
          );
        }
      }
      this.logger.log('Vérification des stocks bas terminée');
    } catch (error) {
      this.logger.error(`Erreur lors de la vérification des stocks: ${error.message}`);
    }
  }
}