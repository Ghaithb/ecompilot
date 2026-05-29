import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Booking, BookingDocument, BookingStatus, PaymentStatus } from './schemas/booking.schema';
import { Service, ServiceDocument } from './schemas/service.schema';
import { CreateBookingDto, UpdateBookingDto, GetAvailableSlotsDto, CreateServiceDto, UpdateServiceDto } from './dto/booking.dto';

@Injectable()
export class BookingService {
    constructor(
        @InjectModel(Booking.name) private bookingModel: Model<BookingDocument>,
        @InjectModel(Service.name) private serviceModel: Model<ServiceDocument>,
    ) { }

    // ========== SERVICE MANAGEMENT ==========

    async createService(tenantId: string, dto: CreateServiceDto): Promise<ServiceDocument> {
        const service = new this.serviceModel({
            tenantId: new Types.ObjectId(tenantId),
            ...dto,
            durationMinutes: dto.durationMinutes || 60,
        });
        return service.save();
    }

    async getServices(tenantId: string, activeOnly = true): Promise<ServiceDocument[]> {
        const query: any = { tenantId: new Types.ObjectId(tenantId) };
        if (activeOnly) query.isActive = true;
        return this.serviceModel.find(query).sort({ name: 1 }).exec();
    }

    async getServiceById(tenantId: string, serviceId: string): Promise<ServiceDocument> {
        const service = await this.serviceModel.findOne({
            _id: new Types.ObjectId(serviceId),
            tenantId: new Types.ObjectId(tenantId),
        });
        if (!service) throw new NotFoundException('Service not found');
        return service;
    }

    async updateService(tenantId: string, serviceId: string, dto: UpdateServiceDto): Promise<ServiceDocument> {
        const service = await this.serviceModel.findOneAndUpdate(
            { _id: new Types.ObjectId(serviceId), tenantId: new Types.ObjectId(tenantId) },
            { $set: dto },
            { new: true },
        );
        if (!service) throw new NotFoundException('Service not found');
        return service;
    }

    async deleteService(tenantId: string, serviceId: string): Promise<void> {
        const result = await this.serviceModel.deleteOne({
            _id: new Types.ObjectId(serviceId),
            tenantId: new Types.ObjectId(tenantId),
        });
        if (result.deletedCount === 0) throw new NotFoundException('Service not found');
    }

    // ========== BOOKING MANAGEMENT ==========

    async createBooking(tenantId: string, dto: CreateBookingDto): Promise<BookingDocument> {
        const service = await this.getServiceById(tenantId, dto.serviceId);

        const startTime = new Date(dto.startTime);
        const endTime = new Date(startTime.getTime() + service.durationMinutes * 60000);

        // Check for conflicts
        const conflict = await this.checkBookingConflict(tenantId, dto.serviceId, startTime, endTime, dto.staffId);
        if (conflict) {
            throw new BadRequestException('This time slot is not available');
        }

        // Calculate deposit if required
        let depositAmount = 0;
        if (service.requiresDeposit) {
            if (service.depositFixedAmount > 0) {
                depositAmount = service.depositFixedAmount;
            } else if (service.depositPercentage > 0) {
                depositAmount = (service.price * service.depositPercentage) / 100;
            }
        }

        const booking = new this.bookingModel({
            tenantId: new Types.ObjectId(tenantId),
            serviceId: new Types.ObjectId(dto.serviceId),
            staffId: dto.staffId ? new Types.ObjectId(dto.staffId) : undefined,
            customerId: dto.customerId ? new Types.ObjectId(dto.customerId) : undefined,
            customerName: dto.customerName,
            customerEmail: dto.customerEmail,
            customerPhone: dto.customerPhone,
            startTime,
            endTime,
            durationMinutes: service.durationMinutes,
            price: service.price,
            depositAmount,
            customerNotes: dto.customerNotes,
            status: BookingStatus.PENDING,
            paymentStatus: PaymentStatus.PENDING,
        });

        return booking.save();
    }

    async getBookings(
        tenantId: string,
        filters: { startDate?: Date; endDate?: Date; status?: BookingStatus; staffId?: string } = {},
    ): Promise<BookingDocument[]> {
        const query: any = { tenantId: new Types.ObjectId(tenantId) };

        if (filters.startDate) query.startTime = { $gte: filters.startDate };
        if (filters.endDate) query.startTime = { ...query.startTime, $lte: filters.endDate };
        if (filters.status) query.status = filters.status;
        if (filters.staffId) query.staffId = new Types.ObjectId(filters.staffId);

        return this.bookingModel
            .find(query)
            .populate('serviceId', 'name price durationMinutes')
            .populate('customerId', 'name email')
            .populate('staffId', 'name')
            .sort({ startTime: 1 })
            .exec();
    }

    async getBookingById(tenantId: string, bookingId: string): Promise<BookingDocument> {
        const booking = await this.bookingModel
            .findOne({ _id: new Types.ObjectId(bookingId), tenantId: new Types.ObjectId(tenantId) })
            .populate('serviceId')
            .populate('customerId', 'name email phone')
            .populate('staffId', 'name');
        if (!booking) throw new NotFoundException('Booking not found');
        return booking;
    }

    async updateBooking(tenantId: string, bookingId: string, dto: UpdateBookingDto): Promise<BookingDocument> {
        const updateData: any = { ...dto };

        if (dto.status === BookingStatus.CANCELLED) {
            updateData.cancelledAt = new Date();
        }

        const booking = await this.bookingModel.findOneAndUpdate(
            { _id: new Types.ObjectId(bookingId), tenantId: new Types.ObjectId(tenantId) },
            { $set: updateData },
            { new: true },
        );
        if (!booking) throw new NotFoundException('Booking not found');
        return booking;
    }

    async confirmBooking(tenantId: string, bookingId: string): Promise<BookingDocument> {
        return this.updateBooking(tenantId, bookingId, { status: BookingStatus.CONFIRMED });
    }

    async cancelBooking(tenantId: string, bookingId: string, reason?: string): Promise<BookingDocument> {
        return this.updateBooking(tenantId, bookingId, {
            status: BookingStatus.CANCELLED,
            cancellationReason: reason,
        });
    }

    async completeBooking(tenantId: string, bookingId: string): Promise<BookingDocument> {
        return this.updateBooking(tenantId, bookingId, { status: BookingStatus.COMPLETED });
    }

    // ========== AVAILABILITY ==========

    async getAvailableSlots(tenantId: string, dto: GetAvailableSlotsDto): Promise<{ time: string; available: boolean }[]> {
        const service = await this.getServiceById(tenantId, dto.serviceId);
        const date = new Date(dto.date);
        const dayOfWeek = date.getDay();

        // Check if day is available
        if (!service.availableDays.includes(dayOfWeek)) {
            return [];
        }

        const slots: { time: string; available: boolean }[] = [];
        const [fromHour, fromMin] = service.availableFrom.split(':').map(Number);
        const [toHour, toMin] = service.availableTo.split(':').map(Number);

        const startOfDay = new Date(date);
        startOfDay.setHours(fromHour, fromMin, 0, 0);

        const endOfDay = new Date(date);
        endOfDay.setHours(toHour, toMin, 0, 0);

        // Get existing bookings for the day
        const existingBookings = await this.bookingModel.find({
            tenantId: new Types.ObjectId(tenantId),
            serviceId: new Types.ObjectId(dto.serviceId),
            startTime: { $gte: startOfDay, $lt: new Date(date.getTime() + 24 * 60 * 60 * 1000) },
            status: { $nin: [BookingStatus.CANCELLED] },
            ...(dto.staffId && { staffId: new Types.ObjectId(dto.staffId) }),
        });

        let currentSlot = new Date(startOfDay);
        while (currentSlot.getTime() + service.durationMinutes * 60000 <= endOfDay.getTime()) {
            const slotEnd = new Date(currentSlot.getTime() + service.durationMinutes * 60000);

            const isAvailable = !existingBookings.some(booking => {
                return currentSlot < booking.endTime && slotEnd > booking.startTime;
            });

            slots.push({
                time: currentSlot.toISOString(),
                available: isAvailable,
            });

            currentSlot = new Date(currentSlot.getTime() + service.slotIntervalMinutes * 60000);
        }

        return slots;
    }

    private async checkBookingConflict(
        tenantId: string,
        serviceId: string,
        startTime: Date,
        endTime: Date,
        staffId?: string,
    ): Promise<boolean> {
        const query: any = {
            tenantId: new Types.ObjectId(tenantId),
            serviceId: new Types.ObjectId(serviceId),
            status: { $nin: [BookingStatus.CANCELLED] },
            $or: [
                { startTime: { $lt: endTime, $gte: startTime } },
                { endTime: { $gt: startTime, $lte: endTime } },
                { startTime: { $lte: startTime }, endTime: { $gte: endTime } },
            ],
        };

        if (staffId) {
            query.staffId = new Types.ObjectId(staffId);
        }

        const conflict = await this.bookingModel.findOne(query);
        return !!conflict;
    }

    // ========== STATS ==========

    async getBookingStats(tenantId: string, startDate: Date, endDate: Date) {
        const bookings = await this.bookingModel.find({
            tenantId: new Types.ObjectId(tenantId),
            startTime: { $gte: startDate, $lte: endDate },
        });

        const stats = {
            total: bookings.length,
            confirmed: bookings.filter(b => b.status === BookingStatus.CONFIRMED).length,
            completed: bookings.filter(b => b.status === BookingStatus.COMPLETED).length,
            cancelled: bookings.filter(b => b.status === BookingStatus.CANCELLED).length,
            revenue: bookings
                .filter(b => b.status === BookingStatus.COMPLETED)
                .reduce((sum, b) => sum + b.price, 0),
        };

        return stats;
    }
}
