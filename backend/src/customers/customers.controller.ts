import {
  Controller,
  Get,
  Patch,
  Body,
  Param,
  ValidationPipe,
  NotFoundException,
} from '@nestjs/common';
import { CustomersService } from './customers.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';

@Controller('api/customers')
export class CustomersController {
  constructor(private readonly customersService: CustomersService) {}

  /**
   * GET /api/customers/:id
   * Get customer profile
   */
  @Get(':id')
  async getProfile(@Param('id') id: string) {
    const customer = await this.customersService.findById(id);
    if (!customer) {
      throw new NotFoundException('Customer not found');
    }
    return customer;
  }

  /**
   * PATCH /api/customers/:id
   * Update customer profile
   */
  @Patch(':id')
  async updateProfile(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateDto: UpdateProfileDto,
  ) {
    return this.customersService.updateProfile(id, updateDto);
  }

  /**
   * PATCH /api/customers/:id/password
   * Change customer password
   */
  @Patch(':id/password')
  async changePassword(
    @Param('id') id: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    changePasswordDto: ChangePasswordDto,
  ) {
    return this.customersService.changePassword(id, changePasswordDto);
  }
}
