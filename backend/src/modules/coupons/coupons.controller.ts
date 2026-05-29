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
  Request,
} from '@nestjs/common';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CouponsService } from './coupons.service';
import { CreateCouponDto, UpdateCouponDto, ValidateCouponDto } from './dto/coupon.dto';

@Controller('coupons')
@UseGuards(JwtAuthGuard)
export class CouponsController {
  constructor(private readonly couponsService: CouponsService) {}

  @Post()
  async create(@Request() req, @Body() createCouponDto: CreateCouponDto) {
    const tenantId = req.user.tenantId;
    return this.couponsService.create(tenantId, createCouponDto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.couponsService.findAll(tenantId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      status,
    });
  }

  @Get('stats')
  async getStats(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.couponsService.getStats(tenantId);
  }

  @Post('validate')
  async validate(@Request() req, @Body() validateCouponDto: ValidateCouponDto) {
    const tenantId = req.user.tenantId;
    return this.couponsService.validate(tenantId, validateCouponDto);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.couponsService.findOne(tenantId, id);
  }

  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateCouponDto: UpdateCouponDto) {
    const tenantId = req.user.tenantId;
    return this.couponsService.update(tenantId, id, updateCouponDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.couponsService.remove(tenantId, id);
  }
}
