import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

@Injectable()
export class PrismaService implements OnModuleInit, OnModuleDestroy {
  // Expose all Prisma models
  public table: PrismaClient['table'];
  public menuCategory: PrismaClient['menuCategory'];
  public menuItem: PrismaClient['menuItem'];
  public menuItemPhoto: PrismaClient['menuItemPhoto'];
  public modifierGroup: PrismaClient['modifierGroup'];
  public modifierOption: PrismaClient['modifierOption'];
  public menuItemModifierGroup: PrismaClient['menuItemModifierGroup'];
  public user: PrismaClient['user'];
  public role: PrismaClient['role'];
  public userRole: PrismaClient['userRole'];
  public restaurant: PrismaClient['restaurant'];
  public order: PrismaClient['order'];
  public orderItem: PrismaClient['orderItem'];
  public orderItemModifier: PrismaClient['orderItemModifier'];
  public cart: PrismaClient['cart'];
  public cartItem: PrismaClient['cartItem'];
  public cartItemModifier: PrismaClient['cartItemModifier'];
  public bill_requests: PrismaClient['bill_requests'];
  public payment_methods: PrismaClient['payment_methods'];
  public payments: PrismaClient['payments'];
  public review: PrismaClient['review'];

  private client: PrismaClient;
  private pool: Pool;

  constructor() {
    this.pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: {
        rejectUnauthorized: false,
      },
    });

    const adapter = new PrismaPg(this.pool);
    this.client = new PrismaClient({ adapter });

    // Initialize all models
    this.restaurant = this.client.restaurant;
    this.table = this.client.table;
    this.menuCategory = this.client.menuCategory;
    this.menuItem = this.client.menuItem;
    this.menuItemPhoto = this.client.menuItemPhoto;
    this.modifierGroup = this.client.modifierGroup;
    this.modifierOption = this.client.modifierOption;
    this.menuItemModifierGroup = this.client.menuItemModifierGroup;
    this.user = this.client.user;
    this.role = this.client.role;
    this.userRole = this.client.userRole;
    this.order = this.client.order;
    this.orderItem = this.client.orderItem;
    this.orderItemModifier = this.client.orderItemModifier;
    this.cart = this.client.cart;
    this.cartItem = this.client.cartItem;
    this.cartItemModifier = this.client.cartItemModifier;
    this.bill_requests = this.client.bill_requests;
    this.payment_methods = this.client.payment_methods;
    this.payments = this.client.payments;
    this.review = this.client.review;
  }

  async onModuleInit() {
    await this.client.$connect();
  }

  async onModuleDestroy() {
    await this.client.$disconnect();
    await this.pool.end();
  }

  // Expose $transaction method
  get $transaction() {
    return this.client.$transaction.bind(this.client);
  }
}
