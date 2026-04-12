# Review API Documentation

This document describes all endpoints available in the ReviewController with sample request and response data for Postman testing.

## 1. Get All Reviews

**Endpoint:** GET `/api/reviews`  
**Description:** Retrieves all reviews for a product or field

**Request Parameters:**
- `productId` (optional): ID of product
- `fieldId` (optional): ID of field
- `type` (default: "product"): "product" or "field"

**Sample Request:**
```
GET http://localhost:8080/api/reviews?productId=1&type=product
GET http://localhost:8080/api/reviews?fieldId=2&type=field
```

**Sample Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "reviewId": 1,
      "productId": 1,
      "customerName": "John Doe",
      "rating": 5,
      "comment": "This product is excellent!",
      "createdDate": "2023-10-15T14:30:00",
      "images": "[\"https://res.cloudinary.com/example/image1.jpg\"]",
      "sellerReplyContent": "Thank you for your feedback!",
      "sellerReplyAdminName": "Admin",
      "sellerReplyDate": "2023-10-16T10:20:00"
    }
  ],
  "stats": {
    "averageRating": 4.5,
    "totalReviews": 10,
    "fiveStarCount": 6,
    "fourStarCount": 3,
    "threeStarCount": 1,
    "twoStarCount": 0,
    "oneStarCount": 0
  }
}
```

## 2. Get Filtered Reviews

**Endpoint:** GET `/api/reviews/filtered`  
**Description:** Gets reviews with filters

**Request Parameters:**
- `productId` (optional): ID of product
- `fieldId` (optional): ID of field
- `type` (default: "product"): "product" or "field"
- `filter` (default: "all"): Filter type ("all", "with_images", "recent", etc.)
- `rating` (optional): Filter by specific rating

**Sample Request:**
```
GET http://localhost:8080/api/reviews/filtered?productId=1&type=product&filter=with_images&rating=5
GET http://localhost:8080/api/reviews/filtered?fieldId=2&type=field&filter=recent
```

**Sample Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "reviewId": 2,
      "productId": 1,
      "customerName": "Jane Smith",
      "rating": 5,
      "comment": "Great quality and fast delivery",
      "createdDate": "2023-10-14T11:20:00",
      "images": "[\"https://res.cloudinary.com/example/image2.jpg\"]"
    }
  ],
  "stats": {
    "averageRating": 4.5,
    "totalReviews": 10,
    "fiveStarCount": 6,
    "fourStarCount": 3,
    "threeStarCount": 1,
    "twoStarCount": 0,
    "oneStarCount": 0
  },
  "filter": "with_images",
  "rating": 5
}
```

## 3. Create Review

**Endpoint:** POST `/api/reviews/create`  
**Description:** Creates a new review for product or field

**Content-Type:** multipart/form-data

**Request Parameters:**
- `productId` (optional): ID of product
- `fieldId` (optional): ID of field
- `type` (default: "product"): "product" or "field"
- `customerName`: Name of the customer
- `rating`: Rating value (1-5)
- `comment`: Review comment text
- `images` (optional): Image files

**Sample Request:**
```
POST http://localhost:8080/api/reviews/create

Form data:
productId: 1
type: product
customerName: John Doe
rating: 5
comment: This product is excellent!
images: [file1.jpg, file2.jpg]
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Đánh giá với ảnh đã được lưu thành công!",
  "reviewId": 3,
  "review": {
    "reviewId": 3,
    "productId": 1,
    "customerName": "John Doe",
    "rating": 5,
    "comment": "This product is excellent!",
    "createdDate": "2023-10-20T15:45:30",
    "images": "[\"https://res.cloudinary.com/example/reviews/abc123.jpg\",\"https://res.cloudinary.com/example/reviews/def456.jpg\"]"
  },
  "uploadedImages": [
    "https://res.cloudinary.com/example/reviews/abc123.jpg",
    "https://res.cloudinary.com/example/reviews/def456.jpg"
  ]
}
```

## 4. Update Review

**Endpoint:** PUT `/api/reviews/{reviewId}`  
**Description:** Updates an existing review

**Path Parameters:**
- `reviewId`: ID of the review to update

**Request Parameters:**
- `type` (default: "product"): "product" or "field"

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated review comment"
}
```

**Sample Request:**
```
PUT http://localhost:8080/api/reviews/1?type=product

Body:
{
  "rating": 4,
  "comment": "I'm updating my review after using it more"
}
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Đánh giá đã được cập nhật!",
  "review": {
    "reviewId": 1,
    "productId": 1,
    "customerName": "John Doe",
    "rating": 4,
    "comment": "I'm updating my review after using it more",
    "createdDate": "2023-10-15T14:30:00",
    "updatedDate": "2023-10-20T16:45:30",
    "images": "[\"https://res.cloudinary.com/example/image1.jpg\"]"
  }
}
```

## 5. Delete Review

**Endpoint:** DELETE `/api/reviews/{reviewId}`  
**Description:** Soft deletes a review

**Path Parameters:**
- `reviewId`: ID of review to delete

**Request Parameters:**
- `type` (default: "product"): "product" or "field"

**Sample Request:**
```
DELETE http://localhost:8080/api/reviews/1?type=product
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Đánh giá đã được xóa!"
}
```

## 6. Get User Reviews

**Endpoint:** GET `/api/reviews/user/{username}`  
**Description:** Gets all reviews by a specific user

**Path Parameters:**
- `username`: Username to fetch reviews for

**Request Parameters:**
- `type` (default: "product"): "product" or "field"

**Sample Request:**
```
GET http://localhost:8080/api/reviews/user/johnsmith?type=product
```

**Sample Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "reviewId": 1,
      "productId": 1,
      "customerName": "John Smith",
      "rating": 5,
      "comment": "This product is excellent!",
      "createdDate": "2023-10-15T14:30:00",
      "images": "[\"https://res.cloudinary.com/example/image1.jpg\"]"
    },
    {
      "reviewId": 4,
      "productId": 2,
      "customerName": "John Smith",
      "rating": 4,
      "comment": "Good quality product",
      "createdDate": "2023-10-16T09:15:00"
    }
  ]
}
```

## 7. Get User Review for Entity

**Endpoint:** GET `/api/reviews/user/{username}/entity`  
**Description:** Gets review by a specific user for a specific product/field

**Path Parameters:**
- `username`: Username

**Request Parameters:**
- `productId` (optional): ID of product
- `fieldId` (optional): ID of field
- `type` (default: "product"): "product" or "field"

**Sample Request:**
```
GET http://localhost:8080/api/reviews/user/johnsmith/entity?productId=1&type=product
GET http://localhost:8080/api/reviews/user/johnsmith/entity?fieldId=2&type=field
```

**Sample Response:**
```json
{
  "success": true,
  "hasReview": true,
  "review": {
    "reviewId": 1,
    "productId": 1,
    "customerName": "John Smith",
    "rating": 5,
    "comment": "This product is excellent!",
    "createdDate": "2023-10-15T14:30:00",
    "images": "[\"https://res.cloudinary.com/example/image1.jpg\"]"
  }
}
```

## 8. Delete User Review for Entity

**Endpoint:** DELETE `/api/reviews/user/{username}/entity`  
**Description:** Deletes user's review for a specific product/field

**Path Parameters:**
- `username`: Username

**Request Parameters:**
- `productId` (optional): ID of product
- `fieldId` (optional): ID of field
- `type` (default: "product"): "product" or "field"

**Sample Request:**
```
DELETE http://localhost:8080/api/reviews/user/johnsmith/entity?productId=1&type=product
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Đánh giá đã được xóa thành công!"
}
```

## 9. Create Seller Reply

**Endpoint:** POST `/api/reviews/review/{reviewId}/reply`  
**Description:** Add seller response to a review

**Path Parameters:**
- `reviewId`: ID of the review

**Request Parameters:**
- `type` (default: "product"): "product" or "field"

**Request Body:**
```json
{
  "adminUsername": "admin1",
  "adminName": "Admin User",
  "content": "Thank you for your feedback. We appreciate it!"
}
```

**Sample Request:**
```
POST http://localhost:8080/api/reviews/review/1/reply?type=product

Body:
{
  "adminUsername": "admin1",
  "adminName": "Admin User", 
  "content": "Thank you for your feedback. We appreciate it!"
}
```

**Sample Response:**
```json
{
  "success": true,
  "message": "Phản hồi đã được gửi thành công!",
  "reply": {
    "reviewId": 1,
    "productId": 1,
    "customerName": "John Smith",
    "rating": 5,
    "comment": "This product is excellent!",
    "createdDate": "2023-10-15T14:30:00",
    "images": "[\"https://res.cloudinary.com/example/image1.jpg\"]",
    "sellerReplyContent": "Thank you for your feedback. We appreciate it!",
    "sellerReplyAdminName": "Admin User",
    "sellerReplyDate": "2023-10-20T17:30:45"
  }
}
```

## 10. Get Reviews by Rating

**Endpoint:** GET `/api/reviews/rating/{rating}`  
**Description:** Gets reviews with a specific rating

**Path Parameters:**
- `rating`: Rating value to filter by (1-5)

**Request Parameters:**
- `productId` (optional): ID of product
- `fieldId` (optional): ID of field
- `type` (default: "product"): "product" or "field"

**Sample Request:**
```
GET http://localhost:8080/api/reviews/rating/5?productId=1&type=product
GET http://localhost:8080/api/reviews/rating/3?fieldId=2&type=field
```

**Sample Response:**
```json
[
  {
    "reviewId": 1,
    "productId": 1,
    "customerName": "John Smith",
    "rating": 5,
    "comment": "This product is excellent!",
    "createdDate": "2023-10-15T14:30:00",
    "images": "[\"https://res.cloudinary.com/example/image1.jpg\"]"
  },
  {
    "reviewId": 6,
    "productId": 1,
    "customerName": "Mary Johnson",
    "rating": 5,
    "comment": "Highly recommended product",
    "createdDate": "2023-10-12T16:45:00"
  }
]
```
