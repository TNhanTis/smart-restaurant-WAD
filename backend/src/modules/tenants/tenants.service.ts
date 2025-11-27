import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Tenant, TenantDocument, TenantStatus } from './schemas/tenant.schema';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantsService {
  constructor(
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
  ) {}

  async create(createTenantDto: CreateTenantDto): Promise<Tenant> {
    // Check if tenant with same email or slug exists
    const existing = await this.tenantModel.findOne({
      $or: [
        { email: createTenantDto.email },
        { slug: createTenantDto.slug },
      ],
    });

    if (existing) {
      throw new ConflictException('Tenant with this email or slug already exists');
    }

    const createdTenant = new this.tenantModel({
      ...createTenantDto,
      settings: {
        currency: 'VND',
        timezone: 'Asia/Ho_Chi_Minh',
        language: 'vi',
        taxRate: 10,
        ...createTenantDto.settings,
      },
    });

    return createdTenant.save();
  }

  async findAll(status?: string): Promise<Tenant[]> {
    const filter = status ? { status } : {};
    return this.tenantModel.find(filter).sort({ createdAt: -1 }).exec();
  }

  async findOne(id: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findById(id).exec();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async findBySlug(slug: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findOne({ slug }).exec();
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  async update(id: string, updateTenantDto: UpdateTenantDto): Promise<Tenant> {
    const tenant = await this.tenantModel
      .findByIdAndUpdate(id, updateTenantDto, { new: true })
      .exec();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }

  async remove(id: string): Promise<Tenant> {
    const tenant = await this.tenantModel
      .findByIdAndUpdate(id, { status: TenantStatus.INACTIVE }, { new: true })
      .exec();

    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }

    return tenant;
  }
}
