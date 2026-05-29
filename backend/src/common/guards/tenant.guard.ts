import { Injectable, CanActivate, ExecutionContext, ForbiddenException, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument } from '../../modules/tenants/schemas/tenant.schema';

@Injectable()
export class TenantGuard implements CanActivate {
  private readonly logger = new Logger(TenantGuard.name);

  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    this.logger.debug('TenantGuard - User object:', JSON.stringify(user, null, 2));

    // Vérification de l'authentification
    if (!user) {
      this.logger.warn('TenantGuard - No user found');
      throw new ForbiddenException('Accès refusé - Authentification requise');
    }

    // Vérification de l'existence du tenantId
    if (!user.tenantId) {
      this.logger.warn('TenantGuard - No tenantId found');
      throw new ForbiddenException('Accès refusé - Tenant non trouvé');
    }

    // Extraction et validation du tenantId
    let tenantId = user.tenantId;
    
    // Sécurité : s'assurer que c'est bien un string
    if (typeof tenantId === 'object') {
      tenantId = tenantId.id || tenantId._id || String(tenantId);
    }

    this.logger.debug('TenantGuard - Extracted tenantId:', tenantId);

    if (!tenantId) {
      this.logger.warn('TenantGuard - Could not extract tenantId');
      throw new ForbiddenException('Accès refusé - ID de tenant invalide');
    }

    // Vérification des rôles utilisateur
    if (!user.roles || user.roles.length === 0) {
      this.logger.warn('TenantGuard - No roles found');
      throw new ForbiddenException('Accès refusé - Rôles non définis');
    }

    // Vérification du statut de l'abonnement
    const tenant = await this.tenantModel.findById(tenantId);
    if (!tenant) {
      this.logger.warn('TenantGuard - Tenant not found in database');
      throw new ForbiddenException('Accès refusé - Tenant inexistant');
    }

    if (tenant.status !== 'active') {
      this.logger.warn('TenantGuard - Inactive tenant');
      throw new ForbiddenException('Accès refusé - Tenant inactif');
    }

    // Vérification du statut de l'abonnement
    const subscription = (tenant as any).subscription;
    if (!subscription || (subscription.status !== 'active' && subscription.status !== 'trial')) {
      this.logger.warn('TenantGuard - Invalid subscription status:', subscription?.status);
      throw new ForbiddenException('Accès refusé - Abonnement invalide ou expiré');
    }

    // Si l'abonnement est en période d'essai, vérifions la date de fin
    if (subscription.status === 'trial' && subscription.trialEndsAt) {
      const trialEndsAt = new Date(subscription.trialEndsAt);
      if (trialEndsAt < new Date()) {
        this.logger.warn('TenantGuard - Trial period expired');
        throw new ForbiddenException('Accès refusé - Période d\'essai expirée');
      }
    }

    try {
      // Vérifier que le tenant existe et est actif
      const tenant = await this.tenantModel.findById(tenantId);
      this.logger.debug('TenantGuard - Found tenant:', tenant ? 'Yes' : 'No');
      
      if (!tenant) {
        this.logger.warn(`TenantGuard - Tenant not found: ${tenantId}`);
        throw new ForbiddenException('Accès refusé - Tenant non trouvé');
      }

      if (tenant.status !== 'active') {
        this.logger.warn(`TenantGuard - Tenant inactive: ${tenantId}`);
        throw new ForbiddenException('Accès refusé - Tenant inactif');
      }

      request.tenant = tenant;
      request.tenantContext = {
        tenantId: String(tenantId),
        userId: user._id?.toString?.() || user.id,
        roles: user.roles || [],
      };

      this.logger.debug(`TenantGuard - Access granted for tenant: ${tenant.name}`);
      return true;
    } catch (error) {
      this.logger.error('TenantGuard - Database error:', error);
      throw new ForbiddenException('Erreur lors de la vérification du tenant');
    }
  }
}

