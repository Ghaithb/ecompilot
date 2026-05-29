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
import { StaffService } from './staff.service';
import {
    CreateStaffDto,
    UpdateStaffDto,
    CreateTimeEntryDto,
    UpdateTimeEntryDto,
    CreateExpenseDto,
    ApproveExpenseDto,
} from './dto/staff.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { StaffStatus, ExpenseStatus } from './schemas/staff.schema';

@Controller('staff')
@UseGuards(JwtAuthGuard)
export class StaffController {
    constructor(private readonly staffService: StaffService) { }

    // ========== STAFF ==========

    @Post()
    async createStaff(@Req() req, @Body() dto: CreateStaffDto) {
        const tenantId = req.user.tenantId;
        return this.staffService.createStaff(tenantId, dto);
    }

    @Get()
    async getStaffList(
        @Req() req,
        @Query('status') status?: StaffStatus,
        @Query('department') department?: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.staffService.getStaffList(tenantId, { status, department });
    }

    @Get('stats')
    async getStaffStats(@Req() req) {
        const tenantId = req.user.tenantId;
        return this.staffService.getStaffStats(tenantId);
    }

    @Get(':id')
    async getStaff(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.staffService.getStaffById(tenantId, id);
    }

    @Patch(':id')
    async updateStaff(@Req() req, @Param('id') id: string, @Body() dto: UpdateStaffDto) {
        const tenantId = req.user.tenantId;
        return this.staffService.updateStaff(tenantId, id, dto);
    }

    @Post(':id/deactivate')
    async deactivateStaff(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        return this.staffService.deactivateStaff(tenantId, id);
    }

    @Delete(':id')
    async deleteStaff(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        await this.staffService.deleteStaff(tenantId, id);
        return { message: 'Staff member deleted successfully' };
    }

    // ========== TIME ENTRIES ==========

    @Post('time-entries')
    async createTimeEntry(@Req() req, @Body() dto: CreateTimeEntryDto) {
        const tenantId = req.user.tenantId;
        return this.staffService.createTimeEntry(tenantId, dto);
    }

    @Get('time-entries')
    async getTimeEntries(
        @Req() req,
        @Query('staffId') staffId?: string,
        @Query('startDate') startDate?: string,
        @Query('endDate') endDate?: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.staffService.getTimeEntries(tenantId, {
            staffId,
            startDate: startDate ? new Date(startDate) : undefined,
            endDate: endDate ? new Date(endDate) : undefined,
        });
    }

    @Get('time-entries/:staffId/stats')
    async getTimesheetStats(
        @Req() req,
        @Param('staffId') staffId: string,
        @Query('month') month: string,
        @Query('year') year: string,
    ) {
        const tenantId = req.user.tenantId;
        return this.staffService.getTimesheetStats(
            tenantId,
            staffId,
            parseInt(month),
            parseInt(year),
        );
    }

    @Patch('time-entries/:id')
    async updateTimeEntry(@Req() req, @Param('id') id: string, @Body() dto: UpdateTimeEntryDto) {
        const tenantId = req.user.tenantId;
        return this.staffService.updateTimeEntry(tenantId, id, dto);
    }

    @Delete('time-entries/:id')
    async deleteTimeEntry(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        await this.staffService.deleteTimeEntry(tenantId, id);
        return { message: 'Time entry deleted successfully' };
    }

    // ========== EXPENSES ==========

    @Post('expenses')
    async createExpense(@Req() req, @Body() dto: CreateExpenseDto) {
        const tenantId = req.user.tenantId;
        return this.staffService.createExpense(tenantId, dto);
    }

    @Get('expenses')
    async getExpenses(
        @Req() req,
        @Query('staffId') staffId?: string,
        @Query('status') status?: ExpenseStatus,
    ) {
        const tenantId = req.user.tenantId;
        return this.staffService.getExpenses(tenantId, { staffId, status });
    }

    @Post('expenses/:id/review')
    async approveExpense(@Req() req, @Param('id') id: string, @Body() dto: ApproveExpenseDto) {
        const tenantId = req.user.tenantId;
        const approverId = req.user.sub;
        return this.staffService.approveExpense(tenantId, id, approverId, dto);
    }

    @Delete('expenses/:id')
    async deleteExpense(@Req() req, @Param('id') id: string) {
        const tenantId = req.user.tenantId;
        await this.staffService.deleteExpense(tenantId, id);
        return { message: 'Expense deleted successfully' };
    }
}
