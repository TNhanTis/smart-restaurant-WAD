import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { KitchenService } from './kitchen.service';
import { KitchenOrdersFilterDto } from './dto/kitchen-orders-filter.dto';

/**
 * Kitchen Controller
 * Handles Kitchen Display System (KDS) operations for multi-restaurant system
 * All endpoints are scoped by restaurant_id to ensure data isolation
 */
@Controller('api/kitchen')
// @UseGuards(JwtAuthGuard, RolesGuard) // TODO: Uncomment when auth is implemented
// @Roles('kitchen', 'admin') // TODO: Uncomment when auth is implemented
export class KitchenController {
  constructor(private readonly kitchenService: KitchenService) {}

  /**
   * GET /api/kitchen/orders
   * Get all orders that need kitchen attention (accepted & preparing)
   * Query params:
   *  - restaurant_id: UUID (required) - The restaurant the kitchen belongs to
   *  - table_id: UUID (optional) - Filter by specific table
   */
  @Get('orders')
  async getKitchenOrders(
    @Query('restaurant_id') restaurantId: string,
    @Query('table_id') tableId?: string,
    // @Request() req?, // TODO: Get kitchen staff info from JWT token
  ) {
    if (!restaurantId) {
      return {
        success: false,
        error: 'restaurant_id is required',
      };
    }

    const filters: KitchenOrdersFilterDto = {};
    if (tableId) {
      filters.table_id = tableId;
    }

    return this.kitchenService.getKitchenOrders(restaurantId, filters);
  }

  /**
   * POST /api/kitchen/orders/:id/start-preparing
   * Kitchen starts preparing an order
   * Query params:
   *  - restaurant_id: UUID (required) - Validates order belongs to this restaurant
   */
  @Post('orders/:id/start-preparing')
  async startPreparing(
    @Param('id') orderId: string,
    @Query('restaurant_id') restaurantId: string,
    // @Request() req?, // TODO: Get kitchen staff ID from JWT token
  ) {
    if (!restaurantId) {
      return {
        success: false,
        error: 'restaurant_id is required',
      };
    }

    // TODO: Get kitchenStaffId from req.user.id
    const kitchenStaffId = 'temp-kitchen-staff-id'; // Placeholder until auth is implemented

    return this.kitchenService.startPreparing(
      orderId,
      restaurantId,
      kitchenStaffId,
    );
  }

  /**
   * POST /api/kitchen/orders/:id/mark-ready
   * Kitchen marks order as ready (food is done)
   * Query params:
   *  - restaurant_id: UUID (required) - Validates order belongs to this restaurant
   */
  @Post('orders/:id/mark-ready')
  async markReady(
    @Param('id') orderId: string,
    @Query('restaurant_id') restaurantId: string,
    // @Request() req?, // TODO: Get kitchen staff ID from JWT token
  ) {
    if (!restaurantId) {
      return {
        success: false,
        error: 'restaurant_id is required',
      };
    }

    // TODO: Get kitchenStaffId from req.user.id
    const kitchenStaffId = 'temp-kitchen-staff-id'; // Placeholder until auth is implemented

    return this.kitchenService.markReady(orderId, restaurantId, kitchenStaffId);
  }

  /**
   * GET /api/kitchen/stats
   * Get kitchen performance statistics
   * Query params:
   *  - restaurant_id: UUID (required) - The restaurant the kitchen belongs to
   *  - date: ISO date string (optional) - Defaults to today
   */
  @Get('stats')
  async getKitchenStats(
    @Query('restaurant_id') restaurantId: string,
    @Query('date') date?: string,
  ) {
    if (!restaurantId) {
      return {
        success: false,
        error: 'restaurant_id is required',
      };
    }

    const statsDate = date ? new Date(date) : new Date();
    return this.kitchenService.getKitchenStats(restaurantId, statsDate);
  }
}
