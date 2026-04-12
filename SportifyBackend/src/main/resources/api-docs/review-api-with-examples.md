# Review API Documentation with Examples

This document lists all the API endpoints available in the ReviewController with concrete examples of request URLs and response data.

## 1. Get All Reviews

**Endpoint:** GET `http://localhost:8081/api/reviews`

**Example Requests:**
```
http://localhost:8081/api/reviews?productId=1&type=product
http://localhost:8081/api/reviews?fieldId=2&type=field
```

**Example Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "reviewId": 1,
      "productId": 1,
      "username": "AdminSportify",
      "customerName": "John Doe",
      "rating": 5,
      "comment": "This product is excellent! The quality is outstanding.",
      "createdDate": "2023-10-15T14:30:00",
      "images": "[\"https://res.cloudinary.com/example/image1.jpg\"]",
      "sellerReplyContent": "Thank you for your feedback!",
      "sellerReplyAdminName": "Admin",
      "sellerReplyDate": "2023-10-16T10:20:00"
    },
    {
      "reviewId": 2,
      "productId": 1,
      "username": "AdminSportify",
      "customerName": "Jane Smith",
      "rating": 4,
      "comment": "Good product but shipping took longer than expected.",
      "createdDate": "2023-10-14T09:15:30",
      "images": null
    }
  ],
  "stats": {
    "averageRating": 4.5,
    "totalReviews": 2,
    "fiveStarCount": 1,
    "fourStarCount": 1,
    "threeStarCount": 0,
    "twoStarCount": 0,
    "oneStarCount": 0
  }
}
```

## 2. Get Filtered Reviews

**Endpoint:** GET `http://localhost:8081/api/reviews/filtered`

**Example Requests:**
```
http://localhost:8081/api/reviews/filtered?fieldId=2&type=field&filter=recent
http://localhost:8081/api/reviews/filtered?productId=1&type=product&filter=all&rating=5
```

**Example Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "reviewId": 1,
      "productId": 1,
      "username": "AdminSportify",
      "customerName": "John Doe",
      "rating": 5,
      "comment": "This product is excellent! The quality is outstanding.",
      "createdDate": "2023-10-15T14:30:00",
      "images": "[\"https://res.cloudinary.com/example/image1.jpg\"]",
      "sellerReplyContent": "Thank you for your feedback!",
      "sellerReplyAdminName": "Admin",
      "sellerReplyDate": "2023-10-16T10:20:00"
    }
  ],
  "stats": {
    "averageRating": 4.5,
    "totalReviews": 2,
    "fiveStarCount": 1,
    "fourStarCount": 1,
    "threeStarCount": 0,
    "twoStarCount": 0,
    "oneStarCount": 0
  },
  "filter": "with_images",
  "rating": ""
}
```

## 3. Create Review

**Endpoint:** POST `http://localhost:8081/api/reviews/create`

**Content-Type:** multipart/form-data

**Example Request:**
```
POST http://localhost:8081/api/reviews/create
```

**Form Data:**
```
productId: 1
type: product
customerName: John Doe
rating: 5
comment: This product is excellent! The quality is outstanding.
images: [file1.jpg, file2.jpg]
```

**Example Response:**
```json
{
  "success": true,
  "message": "Đánh giá với ảnh đã được lưu thành công!",
  "reviewId": 3,
  "review": {
    "reviewId": 3,
    "productId": 1,
    "username": "AdminSportify",
    "customerName": "John Doe",
    "rating": 5,
    "comment": "This product is excellent! The quality is outstanding.",
    "createdDate": "2023-11-20T15:45:30",
    "images": "[\"https://res.cloudinary.com/example/reviews/abc123.jpg\",\"https://res.cloudinary.com/example/reviews/def456.jpg\"]"
  },
  "uploadedImages": [
    "https://res.cloudinary.com/example/reviews/abc123.jpg",
    "https://res.cloudinary.com/example/reviews/def456.jpg"
  ]
}
```

## 4. Update Review

**Endpoint:** PUT `http://localhost:8081/api/reviews/{reviewId}`

**Example Request:**
```
PUT http://localhost:8081/api/reviews/1?type=product
```

**Request Body:**
```json
{
  "rating": 4,
  "comment": "I'm updating my review after using it more. Still good but not perfect."
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Đánh giá đã được cập nhật!",
  "review": {
    "reviewId": 1,
    "productId": 1,
    "username": "AdminSportify",
    "customerName": "John Doe",
    "rating": 4,
    "comment": "I'm updating my review after using it more. Still good but not perfect.",
    "createdDate": "2023-10-15T14:30:00",
    "updatedDate": "2023-11-20T16:45:30",
    "images": "[\"https://res.cloudinary.com/example/image1.jpg\"]",
    "sellerReplyContent": "Thank you for your feedback!",
    "sellerReplyAdminName": "Admin",
    "sellerReplyDate": "2023-10-16T10:20:00"
  }
}
```

## 5. Delete Review

**Endpoint:** DELETE `http://localhost:8081/api/reviews/{reviewId}`

**Example Request:**
```
DELETE http://localhost:8081/api/reviews/1?type=product
```

**Example Response:**
```json
{
  "success": true,
  "message": "Đánh giá đã được xóa!"
}
```

## 6. Get User Reviews

**Endpoint:** GET `http://localhost:8081/api/reviews/user/{username}`

**Example Request:**
```
GET http://localhost:8081/api/reviews/user/AdminSportify?type=product
```

**Example Response:**
```json
{
  "success": true,
  "reviews": [
    {
      "reviewId": 1,
      "productId": 1,
      "username": "AdminSportify",
      "customerName": "John Doe",
      "rating": 5,
      "comment": "This product is excellent! The quality is outstanding.",
      "createdDate": "2023-10-15T14:30:00",
      "images": "[\"https://res.cloudinary.com/example/image1.jpg\"]"
    },
    {
      "reviewId": 2,
      "productId": 2,
      "username": "AdminSportify",
      "customerName": "John Doe",
      "rating": 4,
      "comment": "Good quality product",
      "createdDate": "2023-10-16T09:15:00"
    }
  ]
}
```

## 7. Get User Review for Entity

**Endpoint:** GET `http://localhost:8081/api/reviews/user/{username}/entity`

**Example Requests:**
```
GET http://localhost:8081/api/reviews/user/AdminSportify/entity?productId=1&type=product
GET http://localhost:8081/api/reviews/user/AdminSportify/entity?fieldId=2&type=field
```

**Example Response:**
```json
{
  "success": true,
  "hasReview": true,
  "review": {
    "reviewId": 1,
    "productId": 1,
    "username": "AdminSportify",
    "customerName": "John Doe",
    "rating": 5,
    "comment": "This product is excellent! The quality is outstanding.",
    "createdDate": "2023-10-15T14:30:00",
    "images": "[\"https://res.cloudinary.com/example/image1.jpg\"]"
  }
}
```

**Example Response (No Review):**
```json
{
  "success": true,
  "hasReview": false,
  "review": null
}
```

## 8. Delete User Review for Entity

**Endpoint:** DELETE `http://localhost:8081/api/reviews/user/{username}/entity`

**Example Request:**
```
DELETE http://localhost:8081/api/reviews/user/AdminSportify/entity?productId=1&type=product
```

**Example Response:**
```json
{
  "success": true,
  "message": "Đánh giá đã được xóa thành công!"
}
```

## 9. Create Seller Reply

**Endpoint:** POST `http://localhost:8081/api/reviews/review/{reviewId}/reply`

**Example Request:**
```
POST http://localhost:8081/api/reviews/review/1/reply?type=product
```

**Request Body:**
```json
{
  "adminUsername": "admin1",
  "adminName": "Admin User",
  "content": "Thank you for your feedback. We appreciate it and are glad you enjoyed the product!"
}
```

**Example Response:**
```json
{
  "success": true,
  "message": "Phản hồi đã được gửi thành công!",
  "reply": {
    "reviewId": 1,
    "productId": 1,
    "username": "AdminSportify",
    "customerName": "John Doe",
    "rating": 5,
    "comment": "This product is excellent! The quality is outstanding.",
    "createdDate": "2023-10-15T14:30:00",
    "images": "[\"https://res.cloudinary.com/example/image1.jpg\"]",
    "sellerReplyContent": "Thank you for your feedback. We appreciate it and are glad you enjoyed the product!",
    "sellerReplyAdminName": "Admin User",
    "sellerReplyDate": "2023-11-20T17:30:45"
  }
}
```

## 10. Get Reviews by Rating

**Endpoint:** GET `http://localhost:8081/api/reviews/rating/{rating}`

**Example Requests:**
```
GET http://localhost:8081/api/reviews/rating/5?productId=1&type=product
GET http://localhost:8081/api/reviews/rating/3?fieldId=2&type=field
```

**Example Response:**
```json
[
  {
    "reviewId": 1,
    "productId": 1,
    "username": "AdminSportify",
    "customerName": "John Doe",
    "rating": 5,
    "comment": "This product is excellent! The quality is outstanding.",
    "createdDate": "2023-10-15T14:30:00",
    "images": "[\"https://res.cloudinary.com/example/image1.jpg\"]",
    "sellerReplyContent": "Thank you for your feedback!",
    "sellerReplyAdminName": "Admin",
    "sellerReplyDate": "2023-10-16T10:20:00"
  },
  {
    "reviewId": 3,
    "productId": 1,
    "username": "AdminSportify",
    "customerName": "Mary Johnson",
    "rating": 5,
    "comment": "Highly recommended product",
    "createdDate": "2023-10-18T16:45:00"
  }
]
```

## Common Error Responses

**Example Error Response (Bad Request):**
```json
{
  "success": false,
  "message": "Thiếu ID sản phẩm"
}
```

**Example Error Response (Exception):**
```json
{
  "success": false,
  "message": "Lỗi khi lấy đánh giá: [exception details]"
}
```
