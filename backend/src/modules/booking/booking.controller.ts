import {
    Controller,
    Get,
    Post,
    Patch,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Req,
} from '@nestjs/common';
import { BookingService } from './booking.service';
import {
    CreateBookingDto,
    UpdateBookingDto,
    GetAvailableSlotsDto,
    CreateServiceDto,
    UpdateServiceDto,
} from './dto/booking.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { BookingStatus } from './schemas/booking.schema';

@Controller('booking')
@UseGuards(JwtAuthGuard)
export class BookingController {
    constructor(private readonly bookingService: BookingService) { }

    // ========== SERVICES ==========

    @Post('services')
    async createService(@Req() req, @Body() dto: CreateServiceDto) {
        const tenantId = req.user.tenantId;
        return this.bookingService.createService(tenantId, dto);
    }

    @Get('services')
    async getServices(@Req() req, @Query('activeOnly') activeOnly?: string) {
        const tenantId = req.user.tenantId;
        return this.bookingService.getServices(tenantId, activeOnly !== 'false');
    }

    @Get('services/:id')
    async getService(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.bookingService.getServiceById(tenantId, id);
    }

    @Patch('services/:id')
    async updateService(@Req() req, @Param('id') id: string, @Body() dto: UpdateServiceDto) {
        const tenantId = req.user.tenantId;
        return this.bookingService.updateService(tenantId, id, dto);
    }

    @Delete('services/:id')
    async deleteService(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        await this.bookingService.deleteService(tenantId, id);
        return { message: 'Service deleted successfully' };
    }

    // ========== BOOKINGS ==========

    @Post()
    async createBooking(@Req() req, @Body() dto: CreateBookingDto) {
        const tenantId = req.user.tenantId;
        return this.bookingService.createBooking(tenantId, dto);
    }

    @Get()
    async getBookings(
        @Req() req,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
        @Query('status') status?: BookingStatus,
        @Query('staffId') staffId?: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.bookingService.getBookings(tenantId, {
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
            status,
            staffId,
        });
    }

    @Get('slots')
    async getAvailableSlots(@Req() req, @Query() dto: GetAvailableSlotsDto) {
        const tenantId = req.user.tenantId;
        return this.bookingService.getAvailableSlots(tenantId, dto);
    }

    @Get('stats')
    async getStats(
        @Req() req,
        @Query('startDate') startDate: string,
        @Query('endDate') endDate: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.bookingService.getBookingStats(
            tenantId,
            new Date(startDate),
            new Date(endDate),
        );
    }

    @Get(':id')
    async getBooking(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.bookingService.getBookingById(tenantId, id);
    }

    @Patch(':id')
    async updateBooking(@Req() req, @Param('id') id: string, @Body() dto: UpdateBookingDto) {
        const tenantId = req.user.tenantId;
        return this.bookingService.updateBooking(tenantId, id, dto);
    }

    @Post(':id/confirm')
    async confirmBooking(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.bookingService.confirmBooking(tenantId, id);
    }

    @Post(':id/cancel')
    async cancelBooking(@Req() req, @Param('id') id: string, @Body('reason') reason?: string) {
        const tenantId = req.user.tenantId;
        return this.bookingService.cancelBooking(tenantId, id, reason);
    }

    @Post(':id/complete')
    async completeBooking(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.bookingService.completeBooking(tenantId, id);
    }
}
