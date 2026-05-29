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
import { CustomersService } from './customers.service';
import { CreateCustomerDto, UpdateCustomerDto } from './dto/customer.dto';

@Controller('customers')
@UseGuards(JwtAuthGuard)
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  @Post()
  async create(@Request() req, @Body() createCustomerDto: CreateCustomerDto) {
    const tenantId = req.user.tenantId;
    return this.customersService.create(tenantId, createCustomerDto);
  }

  @Get()
  async findAll(
    @Request() req,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('search') search?: string,
    @Query('status') status?: string,
    @Query('tags') tags?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.customersService.findAll(tenantId, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
      search,
      status,
      tags: tags ? tags.split(',') : undefined,
    });
  }

  @Get('stats')
  async getStats(@Request() req) {
    const tenantId = req.user.tenantId;
    return this.customersService.getStats(tenantId);
  }

  @Get(':id')
  async findOne(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.customersService.findOne(tenantId, id);
  }

  @Patch(':id')
  async update(@Request() req, @Param('id') id: string, @Body() updateCustomerDto: UpdateCustomerDto) {
    const tenantId = req.user.tenantId;
    return this.customersService.update(tenantId, id, updateCustomerDto);
  }

  @Delete(':id')
  async remove(@Request() req, @Param('id') id: string) {
    const tenantId = req.user.tenantId;
    return this.customersService.remove(tenantId, id);
  }

  @Get(':id/orders')
  async getOrders(
    @Request() req,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const tenantId = req.user.tenantId;
    return this.customersService.getCustomerOrders(tenantId, id, {
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }
}
