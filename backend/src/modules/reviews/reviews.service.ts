import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { CreateReviewDto } from './dto/createReview.dto';
import { Transaction, TransactionDocument } from 'src/entities';
import { Review } from 'src/entities/review.entity'; // Import Review entity

@Injectable()
export class ReviewsService {
  @InjectModel(Review.name) private reviewsModel: Model<any>; // Sửa ở đây
  @InjectModel(Transaction.name)
  private transactionModel: Model<TransactionDocument>;

  async createReview(data: CreateReviewDto) {
    const reviewerId = data.reviewerId;
    const transactionId = data.transactionId;

    const checkTransaction = await this.transactionModel
      .findOne({
        buyerId: reviewerId,
      })
      .exec();

    const existingReview = await this.reviewsModel
      .findOne({
        reviewerId: reviewerId,
        transactionId: transactionId,
      })
      .exec();

    if (existingReview) {
      throw new Error('You have already reviewed this transaction');
    }

    const createdReview = new this.reviewsModel(data);
    return createdReview.save();
  }

  async getReviewsBySeller(sellerId: string) {
    const sellerObjectId = sellerId;
    return this.reviewsModel.find({ sellerId: sellerObjectId }).exec();
  }

  //thu hồi đánh giá
  async deleteReview(id: string) {
    return this.reviewsModel.findByIdAndDelete(id).exec();
  }

  // chỉnh sửa đánh giá
  async updateReview(id: string, data: Partial<CreateReviewDto>) {
    return this.reviewsModel.findByIdAndUpdate(id, data, { new: true }).exec();
  }

  // get tất cả các rating
  async getAllRatings() {
    return this.reviewsModel.find({}, 'rating').exec();
  }
}
