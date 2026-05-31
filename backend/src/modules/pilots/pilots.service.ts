import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { PilotEnrollment, PilotEnrollmentDocument } from './schemas/pilot-enrollment.schema';

export const PILOT_MAX_SLOTS = 20;

@Injectable()
export class PilotsService {
  constructor(
    @InjectModel(PilotEnrollment.name)
    private enrollmentModel: Model<PilotEnrollmentDocument>,
  ) {}

  async getStatus(tenantId?: string) {
    const usedSlots = await this.enrollmentModel.countDocuments();
    const enrollment = tenantId
      ? await this.enrollmentModel.findOne({ tenantId: new Types.ObjectId(tenantId) }).lean()
      : null;

    return {
      maxSlots: PILOT_MAX_SLOTS,
      usedSlots,
      remainingSlots: Math.max(0, PILOT_MAX_SLOTS - usedSlots),
      enrolled: !!enrollment,
      enrolledAt: enrollment?.createdAt ?? null,
      source: enrollment?.source ?? null,
    };
  }

  async enroll(tenantId: string, source = 'landing') {
    const oid = new Types.ObjectId(tenantId);
    const existing = await this.enrollmentModel.findOne({ tenantId: oid });
    if (existing) {
      return { ...await this.getStatus(tenantId), alreadyEnrolled: true };
    }

    const usedSlots = await this.enrollmentModel.countDocuments();
    if (usedSlots >= PILOT_MAX_SLOTS) {
      throw new BadRequestException('Programme pilotes complet — plus de places disponibles');
    }

    await this.enrollmentModel.create({ tenantId: oid, source });
    return { ...(await this.getStatus(tenantId)), alreadyEnrolled: false };
  }
}
