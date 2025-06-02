# API Documentation

This document describes the REST API endpoints for the Library Management System.

## Base URL

```
https://api.librarysystem.com/v1
```

## Authentication

All API endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

## Error Handling

The API uses standard HTTP response codes:

- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

Error Response Format:
```json
{
    "error": {
        "code": "ERROR_CODE",
        "message": "Human readable error message"
    }
}
```

## Endpoints

### Authentication

#### Login
```
POST /auth/login
```

Request Body:
```json
{
    "email": "user@example.com",
    "password": "password123"
}
```

Response:
```json
{
    "token": "jwt_token",
    "user": {
        "id": "uuid",
        "email": "user@example.com",
        "role": "student"
    }
}
```

#### Register
```
POST /auth/register
```

Request Body:
```json
{
    "email": "user@example.com",
    "password": "password123",
    "role": "student"
}
```

Response:
```json
{
    "id": "uuid",
    "email": "user@example.com",
    "role": "student"
}
```

### Books

#### List Books
```
GET /books
```

Query Parameters:
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)
- `search` (optional): Search term
- `category` (optional): Book category
- `status` (optional): Book status

Response:
```json
{
    "items": [
        {
            "id": "uuid",
            "title": "Book Title",
            "author": "Author Name",
            "isbn": "ISBN123",
            "status": "available",
            "created_at": "2024-01-01T00:00:00Z"
        }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
}
```

#### Get Book
```
GET /books/{id}
```

Response:
```json
{
    "id": "uuid",
    "title": "Book Title",
    "author": "Author Name",
    "isbn": "ISBN123",
    "status": "available",
    "created_at": "2024-01-01T00:00:00Z"
}
```

#### Create Book
```
POST /books
```

Request Body:
```json
{
    "title": "Book Title",
    "author": "Author Name",
    "isbn": "ISBN123",
    "category": "Fiction"
}
```

Response:
```json
{
    "id": "uuid",
    "title": "Book Title",
    "author": "Author Name",
    "isbn": "ISBN123",
    "status": "available",
    "created_at": "2024-01-01T00:00:00Z"
}
```

#### Update Book
```
PUT /books/{id}
```

Request Body:
```json
{
    "title": "Updated Title",
    "author": "Updated Author",
    "isbn": "ISBN123",
    "status": "borrowed"
}
```

Response:
```json
{
    "id": "uuid",
    "title": "Updated Title",
    "author": "Updated Author",
    "isbn": "ISBN123",
    "status": "borrowed",
    "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Delete Book
```
DELETE /books/{id}
```

Response:
```json
{
    "message": "Book deleted successfully"
}
```

### Borrowings

#### List Borrowings
```
GET /borrowings
```

Query Parameters:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `user_id` (optional): Filter by user
- `status` (optional): Filter by status

Response:
```json
{
    "items": [
        {
            "id": "uuid",
            "book": {
                "id": "uuid",
                "title": "Book Title"
            },
            "user": {
                "id": "uuid",
                "email": "user@example.com"
            },
            "borrowed_at": "2024-01-01T00:00:00Z",
            "due_date": "2024-02-01T00:00:00Z",
            "returned_at": null,
            "status": "active"
        }
    ],
    "total": 50,
    "page": 1,
    "limit": 10
}
```

#### Create Borrowing
```
POST /borrowings
```

Request Body:
```json
{
    "book_id": "uuid",
    "user_id": "uuid",
    "due_date": "2024-02-01T00:00:00Z"
}
```

Response:
```json
{
    "id": "uuid",
    "book": {
        "id": "uuid",
        "title": "Book Title"
    },
    "user": {
        "id": "uuid",
        "email": "user@example.com"
    },
    "borrowed_at": "2024-01-01T00:00:00Z",
    "due_date": "2024-02-01T00:00:00Z",
    "status": "active"
}
```

#### Return Book
```
PUT /borrowings/{id}/return
```

Response:
```json
{
    "id": "uuid",
    "book": {
        "id": "uuid",
        "title": "Book Title"
    },
    "user": {
        "id": "uuid",
        "email": "user@example.com"
    },
    "borrowed_at": "2024-01-01T00:00:00Z",
    "due_date": "2024-02-01T00:00:00Z",
    "returned_at": "2024-01-15T00:00:00Z",
    "status": "returned"
}
```

### Users

#### List Users
```
GET /users
```

Query Parameters:
- `page` (optional): Page number
- `limit` (optional): Items per page
- `role` (optional): Filter by role

Response:
```json
{
    "items": [
        {
            "id": "uuid",
            "email": "user@example.com",
            "role": "student",
            "created_at": "2024-01-01T00:00:00Z"
        }
    ],
    "total": 100,
    "page": 1,
    "limit": 10
}
```

#### Get User
```
GET /users/{id}
```

Response:
```json
{
    "id": "uuid",
    "email": "user@example.com",
    "role": "student",
    "created_at": "2024-01-01T00:00:00Z"
}
```

#### Update User
```
PUT /users/{id}
```

Request Body:
```json
{
    "email": "updated@example.com",
    "role": "staff"
}
```

Response:
```json
{
    "id": "uuid",
    "email": "updated@example.com",
    "role": "staff",
    "updated_at": "2024-01-01T00:00:00Z"
}
```

#### Delete User
```
DELETE /users/{id}
```

Response:
```json
{
    "message": "User deleted successfully"
}
```

## Rate Limiting

The API implements rate limiting to prevent abuse:

- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

Rate limit headers:
```
X-RateLimit-Limit: 100
X-RateLimit-Remaining: 95
X-RateLimit-Reset: 1610000000
```

## Webhooks

The API supports webhooks for real-time notifications:

### Available Events

- `book.created`
- `book.updated`
- `book.deleted`
- `borrowing.created`
- `borrowing.returned`
- `user.created`
- `user.updated`

### Webhook Configuration

```
POST /webhooks
```

Request Body:
```json
{
    "url": "https://your-domain.com/webhook",
    "events": ["book.created", "borrowing.returned"]
}
```

Response:
```json
{
    "id": "uuid",
    "url": "https://your-domain.com/webhook",
    "events": ["book.created", "borrowing.returned"],
    "created_at": "2024-01-01T00:00:00Z"
}
```

## SDKs

Official SDKs are available for:

- Python
- JavaScript
- Java
- Ruby

Example usage with Python SDK:
```python
from library_system import Client

client = Client(api_key="your_api_key")

# List books
books = client.books.list(limit=10)

# Create a borrowing
borrowing = client.borrowings.create(
    book_id="uuid",
    user_id="uuid",
    due_date="2024-02-01"
)
```

## Support

For API support:
- Email: api-support@librarysystem.com
- Documentation: https://docs.librarysystem.com
- Status Page: https://status.librarysystem.com 