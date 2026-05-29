import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Review, ReviewDocument } from './schemas/review.schema';

@Injectable()
export class ReviewsService {
  constructor(
    @InjectModel(Review.name) private reviewModel: Model<ReviewDocument>,
  ) {}

  async getReviews(tenantId: string, productId?: string) {
    const filter: any = { tenantId, isPublished: true };
    if (productId) filter.productId = productId;
    
    const reviews = await this.reviewModel.find(filter).sort({ createdAt: -1 }).lean();
    return { reviews, count: reviews.length };
  }

  async getStats(tenantId: string) {
    const allReviews = await this.reviewModel.find({ tenantId }).lean();
    const published = allReviews.filter(r => r.isPublished);
    const totalRating = published.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = published.length > 0 ? (totalRating / published.length).toFixed(1) : 0;

    const ratingDistribution = {
      5: published.filter(r => r.rating === 5).length,
      4: published.filter(r => r.rating === 4).length,
      3: published.filter(r => r.rating === 3).length,
      2: published.filter(r => r.rating === 2).length,
      1: published.filter(r => r.rating === 1).length,
    };

    return {
      total: allReviews.length,
      published: published.length,
      pending: allReviews.length - published.length,
      averageRating: avgRating,
      ratingDistribution,
    };
  }

  async createReview(tenantId: string, data: any) {
    const review = new this.reviewModel({ tenantId, ...data, isPublished: false });
    return review.save();
  }

  async publishReview(tenantId: string, id: string) {
    return this.reviewModel.findOneAndUpdate(
      { _id: id, tenantId },
      { isPublished: true },
      { new: true }
    );
  }

  async replyToReview(tenantId: string, id: string, reply: string) {
    return this.reviewModel.findOneAndUpdate(
      { _id: id, tenantId },
      { reply, repliedAt: new Date() },
      { new: true }
    );
  }
}
