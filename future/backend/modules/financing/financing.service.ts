import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FinancingRequest, FinancingRequestDocument } from './schemas/financing-request.schema';

@Injectable()
export class FinancingService {
  constructor(
    @InjectModel(FinancingRequest.name) private financingModel: Model<FinancingRequestDocument>,
  ) {}

  async simulateRBF(tenantId: string, userId: string, salesHistory: any) {
    // Algorithme RBF simplifié
    const totalSales = salesHistory.totalSales || 0;
    const amountRequested = Math.round(totalSales * 0.2); // 20% des ventes
    const rbfRate = 0.08; // 8% de commission
    return { amountRequested, rbfRate, totalSales };
  }

  async createRequest(tenantId: string, userId: string, dto: any) {
    const req = new this.financingModel({
      tenantId,
      userId,
      amountRequested: dto.amountRequested,
      rbfRate: dto.rbfRate,
      status: 'pending',
      salesHistory: dto.salesHistory,
      repayment: { totalRepaid: 0, percentRepaid: 0 },
    });
    return req.save();
  }

  async getDashboard(tenantId: string) {
    const requests = await this.financingModel.find({ tenantId }).sort({ createdAt: -1 });
    // Agrégation simple
    return {
      requests,
      active: requests.find(r => r.status === 'active'),
      repaid: requests.filter(r => r.status === 'repaid'),
    };
  }
}
