import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewsDto, SortOrder } from './dto/query-reviews.dto';

@Injectable()
export class ReviewsService {
  constructor(private prisma: PrismaService) {}

  async findByMenuItem(menuItemId: string, query: QueryReviewsDto) {
    const { page = 1, limit = 10, sort = SortOrder.NEWEST } = query;
    const skip = (page - 1) * limit;

    // Determine sort order
    let orderBy: any = {};
    switch (sort) {
      case SortOrder.NEWEST:
        orderBy = { created_at: 'desc' };
        break;
      case SortOrder.OLDEST:
        orderBy = { created_at: 'asc' };
        break;
      case SortOrder.HIGHEST:
        orderBy = { rating: 'desc' };
        break;
      case SortOrder.LOWEST:
        orderBy = { rating: 'asc' };
        break;
    }

    // Fetch reviews with pagination
    const [reviews, total] = await Promise.all([
      this.prisma.review.findMany({
        where: { menu_item_id: menuItemId },
        orderBy,
        skip,
        take: limit,
      }),
      this.prisma.review.count({
        where: { menu_item_id: menuItemId },
      }),
    ]);

    // Get rating distribution
    const distribution = await this.prisma.review.groupBy({
      by: ['rating'],
      where: { menu_item_id: menuItemId },
      _count: true,
    });

    const ratingDistribution = {
      5: 0,
      4: 0,
      3: 0,
      2: 0,
      1: 0,
    };

    distribution.forEach((item) => {
      ratingDistribution[item.rating] = item._count;
    });

    // Get menu item rating stats
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
      select: {
        id: true,
      },
    });

    // Get user IDs from reviews
    const userIds = Array.from(new Set(reviews.map((r) => r.user_id)));
    const users = await this.prisma.user.findMany({
      where: { id: { in: userIds } },
      select: { id: true, full_name: true },
    });
    const userMap = new Map<string, { id: string; full_name: string | null }>(
      users.map((u) => [u.id, u]),
    );

    return {
      reviews: reviews.map((review) => ({
        id: review.id,
        rating: review.rating,
        comment: review.comment,
        userName: userMap.get(review.user_id)?.full_name || 'Anonymous',
        userId: review.user_id,
        createdAt: review.created_at,
        updatedAt: review.updated_at,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      summary: {
        averageRating:
          distribution.length > 0
            ? distribution.reduce(
                (sum, item) => sum + item.rating * item._count,
                0,
              ) / total
            : 0,
        totalReviews: total,
        distribution: ratingDistribution,
      },
    };
  }

  async create(userId: string, createReviewDto: CreateReviewDto) {
    const { menuItemId, rating, comment } = createReviewDto;

    // Check if menu item exists
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      throw new NotFoundException('Menu item not found');
    }

    // Check if user already reviewed this item
    const existingReview = await this.prisma.review.findFirst({
      where: {
        menu_item_id: menuItemId,
        user_id: userId,
      },
    });

    if (existingReview) {
      throw new ConflictException('You have already reviewed this item');
    }

    // Create review
    const review = await this.prisma.review.create({
      data: {
        menu_item_id: menuItemId,
        user_id: userId,
        rating,
        comment,
      },
    });

    // Get user info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, full_name: true },
    });

    // Update menu item rating
    await this.updateMenuItemRating(menuItemId);

    return {
      id: review.id,
      menuItemId: review.menu_item_id,
      userId: review.user_id,
      rating: review.rating,
      comment: review.comment,
      userName: user?.full_name || 'Anonymous',
      createdAt: review.created_at,
      updatedAt: review.updated_at,
    };
  }

  async update(
    reviewId: string,
    userId: string,
    updateReviewDto: UpdateReviewDto,
  ) {
    // Find review
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user owns this review
    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Update review
    const updatedReview = await this.prisma.review.update({
      where: { id: reviewId },
      data: updateReviewDto,
    });

    // Get user info
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, full_name: true },
    });

    // Update menu item rating
    await this.updateMenuItemRating(review.menu_item_id);

    return {
      id: updatedReview.id,
      menuItemId: updatedReview.menu_item_id,
      userId: updatedReview.user_id,
      rating: updatedReview.rating,
      comment: updatedReview.comment,
      userName: user?.full_name || 'Anonymous',
      createdAt: updatedReview.created_at,
      updatedAt: updatedReview.updated_at,
    };
  }

  async delete(reviewId: string, userId: string) {
    // Find review
    const review = await this.prisma.review.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      throw new NotFoundException('Review not found');
    }

    // Check if user owns this review
    if (review.user_id !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    const menuItemId = review.menu_item_id;

    // Delete review
    await this.prisma.review.delete({
      where: { id: reviewId },
    });

    // Update menu item rating
    await this.updateMenuItemRating(menuItemId);

    return { message: 'Review deleted successfully' };
  }

  private async updateMenuItemRating(menuItemId: string) {
    // Calculate average rating and count
    const stats = await this.prisma.review.aggregate({
      where: { menu_item_id: menuItemId },
      _avg: { rating: true },
      _count: true,
    });

    // Update menu item
    // Note: average_rating and review_count fields need to be added to schema
    // For now, we skip updating these fields
    // await this.prisma.menuItem.update({
    //     where: { id: menuItemId },
    //     data: {
    //         average_rating: stats._avg.rating || 0,
    //         review_count: stats._count._all,
    //     },
    // });
  }
}
