import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { TablesService } from '../tables/tables.service';
import { RejectOrderDto } from './dto/reject-order.dto';
import { PendingOrdersFilterDto } from './dto/pending-orders-filter.dto';

@Injectable()
export class WaiterService {
  constructor(
    private prisma: PrismaService,
    private tablesService: TablesService,
  ) {}

  /**
   * Get pending orders for a waiter's restaurant
   * Waiters can only see orders from their assigned restaurant
   */
  async getPendingOrders(
    restaurantId: string,
    filters?: PendingOrdersFilterDto,
  ) {
    const whereClause: any = {
      restaurant_id: restaurantId,
      status: 'pending',
    };

    // Filter by table if specified
    if (filters?.table_id) {
      whereClause.table_id = filters.table_id;
    }

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      include: {
        table: {
          select: {
            id: true,
            table_number: true,
            capacity: true,
            location: true,
          },
        },
        order_items: {
          include: {
            menu_item: {
              select: {
                id: true,
                name: true,
                price: true,
                prep_time_minutes: true,
              },
            },
            modifiers: {
              include: {
                modifier_option: {
                  select: {
                    id: true,
                    name: true,
                    price_adjustment: true,
                  },
                },
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'asc', // Oldest pending orders first
      },
    });

    return {
      success: true,
      data: orders.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        table: {
          id: order.table.id,
          number: order.table.table_number,
          location: order.table.location,
        },
        status: order.status,
        total: order.total,
        items_count: order.order_items.reduce(
          (sum, item) => sum + item.quantity,
          0,
        ),
        special_requests: order.special_requests,
        created_at: order.created_at,
        items: order.order_items.map((item) => ({
          id: item.id,
          name: item.menu_item.name,
          quantity: item.quantity,
          unit_price: item.unit_price,
          subtotal: item.subtotal,
          modifiers: item.modifiers.map((mod) => ({
            name: mod.modifier_option.name,
            price_adjustment: mod.price_adjustment,
          })),
          special_requests: item.special_requests,
        })),
      })),
      total: orders.length,
    };
  }

  /**
   * Accept an order (waiter confirms they will handle it)
   * Validates that the order belongs to the waiter's restaurant
   */
  async acceptOrder(orderId: string, restaurantId: string, waiterId: string) {
    // Find the order and verify it belongs to the restaurant
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: true,
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Verify order belongs to waiter's restaurant
    if (order.restaurant_id !== restaurantId) {
      throw new ForbiddenException(
        'You can only accept orders from your restaurant',
      );
    }

    // Check if order is in pending status
    if (order.status !== 'pending') {
      throw new BadRequestException(
        `Order cannot be accepted. Current status: ${order.status}`,
      );
    }

    // Update order status to accepted and assign to waiter
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'accepted',
        accepted_at: new Date(),
        waiter_id: waiterId,
      },
      include: {
        table: {
          select: {
            id: true,
            table_number: true,
            location: true,
          },
        },
        order_items: {
          include: {
            menu_item: {
              select: {
                id: true,
                name: true,
                prep_time_minutes: true,
              },
            },
            modifiers: {
              include: {
                modifier_option: {
                  select: {
                    name: true,
                    price_adjustment: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // TODO: Emit Socket.IO event to kitchen (order_accepted)
    // TODO: Emit Socket.IO event to customer (order_accepted)

    // Auto-update table status
    await this.tablesService.autoUpdateTableStatusByOrder(orderId);

    return {
      success: true,
      message: 'Order accepted successfully',
      data: {
        id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        status: updatedOrder.status,
        table: updatedOrder.table,
        total: updatedOrder.total,
        accepted_at: updatedOrder.accepted_at,
        items: updatedOrder.order_items.map((item) => ({
          name: item.menu_item.name,
          quantity: item.quantity,
          prep_time: item.menu_item.prep_time_minutes,
        })),
      },
    };
  }

  /**
   * Reject an order with a reason
   * Validates that the order belongs to the waiter's restaurant
   */
  async rejectOrder(
    orderId: string,
    restaurantId: string,
    rejectDto: RejectOrderDto,
  ) {
    // Find the order and verify it belongs to the restaurant
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: {
          select: {
            table_number: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Verify order belongs to waiter's restaurant
    if (order.restaurant_id !== restaurantId) {
      throw new ForbiddenException(
        'You can only reject orders from your restaurant',
      );
    }

    // Check if order is in pending status
    if (order.status !== 'pending') {
      throw new BadRequestException(
        `Order cannot be rejected. Current status: ${order.status}`,
      );
    }

    // Update order status to rejected
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'rejected',
        special_requests: order.special_requests
          ? `${order.special_requests}\n\nREJECTION REASON: ${rejectDto.reason}`
          : `REJECTION REASON: ${rejectDto.reason}`,
      },
    });

    // TODO: Emit Socket.IO event to customer (order_rejected)

    // Auto-update table status (table might become available if no other orders)
    await this.tablesService.autoUpdateTableStatusByOrder(orderId);

    return {
      success: true,
      message: 'Order rejected successfully',
      data: {
        id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        status: updatedOrder.status,
        table_number: order.table.table_number,
        rejection_reason: rejectDto.reason,
      },
    };
  }

  /**
   * Mark an order as served
   * Validates that the order belongs to the waiter's restaurant
   */
  async serveOrder(orderId: string, restaurantId: string, waiterId: string) {
    // Find the order and verify it belongs to the restaurant
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: {
        table: {
          select: {
            id: true,
            table_number: true,
          },
        },
      },
    });

    if (!order) {
      throw new NotFoundException(`Order with ID ${orderId} not found`);
    }

    // Verify order belongs to waiter's restaurant
    if (order.restaurant_id !== restaurantId) {
      throw new ForbiddenException(
        'You can only serve orders from your restaurant',
      );
    }

    // Check if order is in ready status
    if (order.status !== 'ready') {
      throw new BadRequestException(
        `Order cannot be served. Current status: ${order.status}. Order must be in 'ready' status.`,
      );
    }

    // Update order status to served
    const updatedOrder = await this.prisma.order.update({
      where: { id: orderId },
      data: {
        status: 'served',
        served_at: new Date(),
      },
    });

    // TODO: Emit Socket.IO event to customer (order_served)

    // Auto-update table status (table still occupied until order completed)
    await this.tablesService.autoUpdateTableStatusByOrder(orderId);

    return {
      success: true,
      message: 'Order marked as served',
      data: {
        id: updatedOrder.id,
        order_number: updatedOrder.order_number,
        status: updatedOrder.status,
        table_number: order.table.table_number,
        served_at: updatedOrder.served_at,
      },
    };
  }

  /**
   * Get all orders for waiter's restaurant with various statuses
   * Useful for waiter dashboard
   */
  async getRestaurantOrders(
    restaurantId: string,
    status?: string,
    tableId?: string,
  ) {
    const whereClause: any = {
      restaurant_id: restaurantId,
    };

    if (status) {
      whereClause.status = status;
    }

    if (tableId) {
      whereClause.table_id = tableId;
    }

    const orders = await this.prisma.order.findMany({
      where: whereClause,
      include: {
        table: {
          select: {
            id: true,
            table_number: true,
            location: true,
          },
        },
        order_items: {
          include: {
            menu_item: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        created_at: 'desc',
      },
      take: 50, // Limit to last 50 orders for performance
    });

    return {
      success: true,
      data: orders.map((order) => ({
        id: order.id,
        order_number: order.order_number,
        table: order.table,
        status: order.status,
        total: order.total,
        items_count: order.order_items.length,
        created_at: order.created_at,
        accepted_at: order.accepted_at,
        ready_at: order.ready_at,
        served_at: order.served_at,
      })),
      total: orders.length,
    };
  }

  /**
   * Get waiter performance analytics
   * Track orders accepted/rejected, average service time
   * Multi-restaurant support: filters by restaurant_id
   */
  async getWaiterPerformance(waiterId: string, restaurantId: string) {
    // Get all orders handled by this waiter in the restaurant
    const acceptedOrders = await this.prisma.order.findMany({
      where: {
        restaurant_id: restaurantId,
        waiter_id: waiterId,
        status: {
          in: ['accepted', 'preparing', 'ready', 'served', 'completed'],
        },
      },
      select: {
        id: true,
        order_number: true,
        status: true,
        total: true,
        created_at: true,
        accepted_at: true,
        served_at: true,
        completed_at: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });

    // Get rejected orders count (orders where rejection reason mentions this waiter)
    // Since we don't explicitly track who rejected, we'll count all rejected orders in the restaurant
    // This is a limitation without full auth - in production, track rejected_by_waiter_id
    const rejectedOrders = await this.prisma.order.count({
      where: {
        restaurant_id: restaurantId,
        status: 'rejected',
      },
    });

    // Calculate statistics
    const totalAccepted = acceptedOrders.length;
    const totalServed = acceptedOrders.filter(
      (o) => o.status === 'served' || o.status === 'completed',
    ).length;
    const totalCompleted = acceptedOrders.filter(
      (o) => o.status === 'completed',
    ).length;

    // Calculate average service time (from order created to served)
    const servedOrders = acceptedOrders.filter((o) => o.served_at !== null);
    let averageServiceTimeMinutes = 0;

    if (servedOrders.length > 0) {
      const totalServiceTime = servedOrders.reduce((sum, order) => {
        const created = new Date(order.created_at).getTime();
        const served = new Date(order.served_at!).getTime();
        const diffMinutes = (served - created) / (1000 * 60);
        return sum + diffMinutes;
      }, 0);

      averageServiceTimeMinutes = Math.round(
        totalServiceTime / servedOrders.length,
      );
    }

    // Calculate total revenue from completed orders
    const totalRevenue = acceptedOrders
      .filter((o) => o.status === 'completed')
      .reduce((sum, order) => sum + Number(order.total), 0);

    // Get today's performance
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayOrders = acceptedOrders.filter(
      (o) => new Date(o.created_at) >= today,
    );

    // Recent orders (last 10)
    const recentOrders = acceptedOrders.slice(0, 10).map((order) => ({
      id: order.id,
      order_number: order.order_number,
      status: order.status,
      total: order.total,
      created_at: order.created_at,
      accepted_at: order.accepted_at,
      served_at: order.served_at,
    }));

    return {
      success: true,
      data: {
        waiter_id: waiterId,
        restaurant_id: restaurantId,
        statistics: {
          total_orders_accepted: totalAccepted,
          total_orders_served: totalServed,
          total_orders_completed: totalCompleted,
          total_orders_rejected: rejectedOrders, // Note: This is restaurant-wide, not waiter-specific
          average_service_time_minutes: averageServiceTimeMinutes,
          total_revenue: totalRevenue,
          acceptance_rate:
            totalAccepted > 0
              ? (
                  (totalAccepted / (totalAccepted + rejectedOrders)) *
                  100
                ).toFixed(2)
              : '0.00',
        },
        today: {
          orders_accepted: todayOrders.length,
          orders_served: todayOrders.filter(
            (o) => o.status === 'served' || o.status === 'completed',
          ).length,
          revenue: todayOrders
            .filter((o) => o.status === 'completed')
            .reduce((sum, order) => sum + Number(order.total), 0),
        },
        recent_orders: recentOrders,
      },
    };
  }
}
