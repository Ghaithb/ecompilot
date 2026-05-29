import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, FilterQuery } from 'mongoose';
import { User } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private userModel: Model<User>) {}

  private toView(u: any) {
    if (!u) return u;
    const obj = typeof u.toObject === 'function' ? u.toObject() : { ...u };
    delete obj.password;
    // Map status from isActive
    obj.status = obj.isActive ? 'active' : 'disabled';
    return obj;
  }

  async findAll(tenantId: string, page = 1, limit = 10, search?: string) {
    const filter: FilterQuery<User> = { tenantId } as any;
    if (search) {
      const regex = new RegExp(search, 'i');
      Object.assign(filter, { $or: [{ email: regex }, { firstName: regex }, { lastName: regex }] });
    }
    const skip = (page - 1) * limit;
    const [rows, total] = await Promise.all([
      this.userModel.find(filter).select('-password').sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
      this.userModel.countDocuments(filter),
    ]);
    const data = rows.map((r: any) => this.toView(r));
    return { data, total, page, limit };
  }

  async create(tenantId: string, dto: CreateUserDto) {
    const existing = await this.userModel.findOne({ email: dto.email, tenantId });
    if (existing) throw new ConflictException('Email déjà utilisé');
    const toCreate: any = {
      ...dto,
      tenantId,
      isActive: dto.status !== 'disabled',
    };
    if (dto.password) {
      toCreate.password = await bcrypt.hash(dto.password, 12);
    } else {
      toCreate.password = await bcrypt.hash(Math.random().toString(36).slice(2), 12);
    }
    const user = await this.userModel.create(toCreate);
    return this.toView(user);
  }

  async update(tenantId: string, id: string, dto: UpdateUserDto) {
    const user = await this.userModel.findOne({ _id: id, tenantId });
    if (!user) throw new NotFoundException('Utilisateur non trouvé');
    if (dto.email && dto.email !== user.email) {
      const collision = await this.userModel.findOne({ email: dto.email, tenantId });
      if (collision) throw new ConflictException('Email déjà utilisé');
    }
    if (dto.password) {
      (dto as any).password = await bcrypt.hash(dto.password, 12);
    }
    if (dto.status) {
      (dto as any).isActive = dto.status !== 'disabled';
    }
    Object.assign(user, dto);
    await user.save();
    return this.toView(user);
  }

  async remove(tenantId: string, id: string) {
    const res = await this.userModel.findOneAndDelete({ _id: id, tenantId });
    if (!res) throw new NotFoundException('Utilisateur non trouvé');
    return { success: true };
  }
}
