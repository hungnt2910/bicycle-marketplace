# Reviews API Documentation

## Overview

All endpoints use prefix:

/api/v1/reviews

Authentication:

- Required for create/update/delete
- Use Bearer Token

---

## 1. Create Review

**POST** `/api/v1/reviews/create-review`

### Description

Buyer creates a review for a seller after a completed transaction.

### Request Body

```json
{
  "sellerId": "string",
  "transactionId": "string",
  "rating": 5,
  "comment": "string"
}
Response
Success message
Created review object
2. Get Reviews by Seller

GET /api/v1/reviews/seller-reviews/{sellerId}

Params
sellerId (string)
Response
{
  "data": [
    {
      "rating": 5,
      "comment": "Good seller",
      "createdAt": "date"
    }
  ],
  "averageRating": 4.7,
  "totalReviews": 123
}
3. Delete Review

DELETE /api/v1/reviews/delete-review/{reviewId}

Params
reviewId (string)
Response
{
  "message": "Review deleted successfully"
}
4. Update Review

POST /api/v1/reviews/update-review/{reviewId}

Params
reviewId (string)
Request Body
{
  "rating": 4,
  "comment": "Updated review"
}
Response
Updated review object
5. Get Ratings Summary

GET /api/v1/reviews/ratings

Response
{
  "averageRating": 4.7,
  "totalReviews": 123,
  "distribution": {
    "1": 2,
    "2": 5,
    "3": 10,
    "4": 30,
    "5": 76
  }
}
Summary Table
Feature	Method	Endpoint
Create Review	POST	/create-review
Get Seller Reviews	GET	/seller-reviews/{sellerId}
Delete Review	DELETE	/delete-review/{reviewId}
Update Review	POST	/update-review/{reviewId}
Ratings Summary	GET	/ratings

---

# 🚀 2. Prompt để AI code (rất quan trọng)

Bạn dùng prompt này để yêu cầu AI code React / FE:

---

## 🎯 Prompt chuẩn (Frontend React)


I have a Reviews API with the following endpoints:

POST /api/v1/reviews/create-review
GET /api/v1/reviews/seller-reviews/{sellerId}
DELETE /api/v1/reviews/delete-review/{reviewId}
POST /api/v1/reviews/update-review/{reviewId}
GET /api/v1/reviews/ratings

Authentication: Bearer Token required.

Please help me build a complete React feature for Reviews with the following requirements:

Create a review component:
Form with rating (1-5 stars) and comment
Submit to API
Display seller reviews:
Fetch reviews by sellerId
Show list with rating stars, comment, date
Update review:
Allow editing rating and comment
Call update API
Delete review:
Add delete button
Confirm before deleting
Ratings summary:
Show average rating
Show total reviews
Display rating distribution (chart if possible)

Technical requirements:

Use React + hooks
Use Axios for API calls
Clean code, reusable components
Proper error handling
Loading states
Use modern UI (Tailwind or similar)

Optional:

Use React Query for data fetching
Use a star rating UI component

Please provide full code structure including:

API service file
Components
Example usage
```
