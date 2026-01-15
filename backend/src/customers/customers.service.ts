import {
  Injectable,
  NotFoundException,
  BadRequestException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CustomersService {
  constructor(private prisma: PrismaService) {}

  /**
   * Find customer by ID
   */
  async findById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        created_at: true,
        user_roles: {
          select: {
            role: {
              select: {
                name: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('Customer not found');
    }

    // Check if user is a customer
    const hasCustomerRole = user.user_roles.some(
      (ur) => ur.role.name === 'customer',
    );

    if (!hasCustomerRole) {
      throw new BadRequestException('User is not a customer');
    }

    return {
      id: user.id,
      email: user.email,
      full_name: user.full_name,
      phone: user.phone,
      created_at: user.created_at,
    };
  }

  /**
   * Update customer profile
   */
  async updateProfile(id: string, updateDto: UpdateProfileDto) {
    // Check if customer exists
    const customer = await this.prisma.user.findUnique({
      where: { id },
      include: { 
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const hasCustomerRole = customer.user_roles.some(
      (ur) => ur.role.name === 'customer',
    );

    if (!hasCustomerRole) {
      throw new BadRequestException('User is not a customer');
    }

    // Check if email is being changed and is unique
    if (updateDto.email && updateDto.email !== customer.email) {
      const existingUser = await this.prisma.user.findUnique({
        where: { email: updateDto.email },
      });

      if (existingUser) {
        throw new BadRequestException('Email already in use');
      }
    }

    // Update customer
    const updatedCustomer = await this.prisma.user.update({
      where: { id },
      data: {
        email: updateDto.email,
        full_name: updateDto.full_name,
        phone: updateDto.phone,
      },
      select: {
        id: true,
        email: true,
        full_name: true,
        phone: true,
        created_at: true,
      },
    });

    return {
      message: 'Profile updated successfully',
      data: updatedCustomer,
    };
  }

  /**
   * Change customer password
   */
  async changePassword(id: string, changePasswordDto: ChangePasswordDto) {
    // Check if customer exists
    const customer = await this.prisma.user.findUnique({
      where: { id },
      include: { 
        user_roles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const hasCustomerRole = customer.user_roles.some(
      (ur) => ur.role.name === 'customer',
    );

    if (!hasCustomerRole) {
      throw new BadRequestException('User is not a customer');
    }

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.current_password,
      customer.password_hash,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.new_password, 10);

    // Update password
    await this.prisma.user.update({
      where: { id },
      data: { password_hash: hashedPassword },
    });

    return {
      message: 'Password changed successfully',
    };
  }
}
