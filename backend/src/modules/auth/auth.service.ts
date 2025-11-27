import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { TenantsService } from '../tenants/tenants.service';
import { UserRole } from '../users/schemas/user.schema';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private tenantsService: TenantsService,
    private jwtService: JwtService,
  ) {}

  async login(email: string, password: string) {
    const user = await this.usersService.validatePassword(email, password);

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = {
      sub: (user as any)._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: (user as any)._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
    };
  }

  async register(data: {
    tenantName: string;
    tenantSlug: string;
    email: string;
    password: string;
    fullName: string;
  }) {
    // Create tenant
    const tenant = await this.tenantsService.create({
      name: data.tenantName,
      slug: data.tenantSlug,
      email: data.email,
    });

    // Create admin user for tenant
    const user = await this.usersService.create({
      fullName: data.fullName,
      email: data.email,
      password: data.password,
      role: UserRole.TENANT_ADMIN,
      tenantId: (tenant as any)._id,
    } as any);

    const payload = {
      sub: (user as any)._id.toString(),
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
    };

    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: (user as any)._id.toString(),
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        tenantId: user.tenantId,
      },
      tenant,
    };
  }
}
