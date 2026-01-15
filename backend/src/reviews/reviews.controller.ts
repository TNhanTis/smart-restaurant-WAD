import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    Query,
    UseGuards,
    Request,
} from '@nestjs/common';
import { ReviewsService } from './reviews.service';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import { QueryReviewsDto } from './dto/query-reviews.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('api')
export class ReviewsController {
    constructor(private reviewsService: ReviewsService) { }

    // Public endpoint - Get reviews for a menu item
    @Get('public/menu/items/:id/reviews')
    async getReviews(
        @Param('id') menuItemId: string,
        @Query() query: QueryReviewsDto,
    ) {
        return this.reviewsService.findByMenuItem(menuItemId, query);
    }

    // Protected endpoint - Create a review (requires authentication)
    @UseGuards(JwtAuthGuard)
    @Post('reviews')
    async createReview(
        @Request() req,
        @Body() createReviewDto: CreateReviewDto,
    ) {
        return this.reviewsService.create(req.user.userId, createReviewDto);
    }

    // Protected endpoint - Update own review
    @UseGuards(JwtAuthGuard)
    @Put('reviews/:id')
    async updateReview(
        @Param('id') reviewId: string,
        @Request() req,
        @Body() updateReviewDto: UpdateReviewDto,
    ) {
        return this.reviewsService.update(reviewId, req.user.userId, updateReviewDto);
    }

    // Protected endpoint - Delete own review
    @UseGuards(JwtAuthGuard)
    @Delete('reviews/:id')
    async deleteReview(
        @Param('id') reviewId: string,
        @Request() req,
    ) {
        return this.reviewsService.delete(reviewId, req.user.userId);
    }
}
