import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Headers,
  ValidationPipe,
  BadRequestException,
} from '@nestjs/common';
import { CartService } from './cart.service';
import { AddToCartDto, UpdateCartItemDto } from './dto/cart.dto';

@Controller('api/cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  /**
   * POST /api/cart/items
   * Add item to cart
   * Supports both authenticated users and guests (via session_id)
   */
  @Post('items')
  async addToCart(
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    addToCartDto: AddToCartDto,
    @Headers('authorization') auth?: string,
    @Headers('x-session-id') sessionId?: string,
  ) {
    console.log('Received addToCart request:', {
      dto: addToCartDto,
      dtoType: typeof addToCartDto.quantity,
      sessionId,
    });

    // Extract user ID from JWT if available
    let customerId: string | null = null;
    if (auth && auth.startsWith('Bearer ')) {
      // TODO: Decode JWT to get customer_id
      // For now, we'll use session_id for all users
    }

    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    return this.cartService.addToCart(customerId, sessionId, addToCartDto);
  }

  /**
   * GET /api/cart
   * Get current cart with items and modifiers
   */
  @Get()
  async getCart(
    @Headers('authorization') auth?: string,
    @Headers('x-session-id') sessionId?: string,
  ) {
    let customerId: string | null = null;
    if (auth && auth.startsWith('Bearer ')) {
      // TODO: Decode JWT
    }

    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    return this.cartService.getCart(customerId, sessionId);
  }

  /**
   * PATCH /api/cart/items/:id
   * Update cart item quantity or modifiers
   */
  @Patch('items/:id')
  async updateCartItem(
    @Param('id') cartItemId: string,
    @Body(new ValidationPipe({ transform: true, whitelist: true }))
    updateDto: UpdateCartItemDto,
  ) {
    return this.cartService.updateCartItem(cartItemId, updateDto);
  }

  /**
   * DELETE /api/cart/items/:id
   * Remove item from cart
   */
  @Delete('items/:id')
  async removeFromCart(@Param('id') cartItemId: string) {
    return this.cartService.removeFromCart(cartItemId);
  }

  /**
   * DELETE /api/cart
   * Clear entire cart
   */
  @Delete()
  async clearCart(
    @Headers('authorization') auth?: string,
    @Headers('x-session-id') sessionId?: string,
  ) {
    let customerId: string | null = null;
    if (auth && auth.startsWith('Bearer ')) {
      // TODO: Decode JWT
    }

    if (!sessionId) {
      throw new BadRequestException('Session ID is required');
    }

    return this.cartService.clearCart(customerId, sessionId);
  }
}
