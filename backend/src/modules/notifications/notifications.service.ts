import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument } from './schemas/notification.schema';
import { CreateNotificationDto, UpdateNotificationDto } from './dto/notification.dto';

@Injectable()
export class NotificationsService {
  private readonly logger = new Logger(NotificationsService.name);

  constructor(
    @InjectModel(Notification.name)
    private notificationModel: Model<NotificationDocument>,
  ) {}

  async create(tenantId: string, createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel({
      ...createNotificationDto,
      tenantId,
      read: false,
    });
    
    await notification.save();
    this.logger.log(`Notification créée pour le tenant ${tenantId}: ${notification.title}`);
    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    return notification;
  }

  async findAll(tenantId: string, options: {
    read?: boolean;
    type?: string;
    limit?: number;
    skip?: number;
  } = {}) {
    const { read, type, limit = 10, skip = 0 } = options;
    const query: any = { tenantId };

    if (typeof read === 'boolean') {
      query.read = read;
    }

    if (type) {
      query.type = type;
    }

    const [notifications, total] = await Promise.all([
      this.notificationModel
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .exec(),
      this.notificationModel.countDocuments(query),
    ]);

    return {
      notifications,
      total,
      page: Math.floor(skip / limit) + 1,
      limit,
    };
  }

  async markAsRead(tenantId: string, notificationId: string): Promise<Notification | null> {
    const notification = await this.notificationModel
      .findOneAndUpdate(
        { _id: notificationId, tenantId },
        { $set: { read: true } },
        { new: true },
      )
      .exec();

    if (!notification) {
      throw new NotFoundException('Notification not found');
    }
    this.logger.log(`Notification ${notificationId} marquée comme lue`);
    return notification;
  }

  async markAllAsRead(tenantId: string): Promise<void> {
    await this.notificationModel
      .updateMany(
        { tenantId, read: false },
        { $set: { read: true } }
      )
      .exec();

    this.logger.log(`Toutes les notifications marquées comme lues pour le tenant ${tenantId}`);
  }

  async deleteOldNotifications(daysOld: number = 30): Promise<void> {
    const date = new Date();
    date.setDate(date.getDate() - daysOld);

    await this.notificationModel
      .deleteMany({
        createdAt: { $lt: date },
        read: true,
      })
      .exec();

    this.logger.log(`Notifications plus vieilles que ${daysOld} jours supprimées`);
  }

  async getUnreadCount(tenantId: string): Promise<number> {
    return this.notificationModel.countDocuments({ tenantId, read: false });
  }
}