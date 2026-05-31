import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { User, UserDocument } from '../users/schemas/user.schema';

@Injectable()
export class StaffService {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  private tenantQuery(tenantId: string) {
    return Types.ObjectId.isValid(tenantId)
      ? { tenantId: { $in: [tenantId, new Types.ObjectId(tenantId)] } }
      : { tenantId };
  }

  async listStaff(tenantId: string) {
    const users = await this.userModel
      .find(this.tenantQuery(tenantId))
      .select('firstName lastName email phone roles isActive createdAt')
      .lean();

    return users.map((u) => ({
      _id: String(u._id),
      firstName: u.firstName,
      lastName: u.lastName,
      email: u.email,
      phone: u.phone,
      role: u.roles?.includes('admin')
        ? 'admin'
        : u.roles?.includes('manager')
          ? 'manager'
          : 'employee',
      status: u.isActive ? 'active' : 'inactive',
      position: u.roles?.[0] || 'employee',
    }));
  }

  listExpenses() {
    return [];
  }

  async getStats(tenantId: string) {
    const q = this.tenantQuery(tenantId);
    const [total, active] = await Promise.all([
      this.userModel.countDocuments(q),
      this.userModel.countDocuments({ ...q, isActive: true }),
    ]);
    return { total, active, onLeave: 0, pendingExpenses: 0 };
  }

  reviewExpense(_tenantId: string, expenseId: string, status: string) {
    return { ok: true, expenseId, status, message: 'Module notes de frais à venir' };
  }
}
