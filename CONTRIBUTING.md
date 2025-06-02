# Developer Guide

This guide is for developers who want to contribute to the Library Management System project.

## Project Architecture

### Overview

The project follows a client-server architecture:

- **Frontend**: HTML, CSS, JavaScript with Bootstrap
- **Backend**: Python Flask REST API
- **Database**: Supabase (PostgreSQL)

### Directory Structure

```
LibrarySystem/
├── backend/
│   ├── app/
│   │   ├── __init__.py
│   │   ├── routes/
│   │   ├── models/
│   │   ├── services/
│   │   └── utils/
│   ├── tests/
│   ├── requirements.txt
│   └── run.py
├── STUDENT/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
├── STAFF/
│   ├── index.html
│   ├── css/
│   ├── js/
│   └── assets/
└── docs/
```

## Development Setup

1. Fork and clone the repository
2. Set up the development environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
pip install -r requirements-dev.txt  # Development dependencies
```

3. Set up pre-commit hooks:
```bash
pre-commit install
```

## Code Style Guide

### Python

- Follow PEP 8 guidelines
- Use type hints
- Maximum line length: 88 characters
- Use Black for formatting
- Use isort for import sorting

Example:
```python
from typing import List, Optional

def get_books(
    category: Optional[str] = None,
    limit: int = 10
) -> List[dict]:
    """
    Retrieve books from the database.

    Args:
        category: Optional category filter
        limit: Maximum number of books to return

    Returns:
        List of book dictionaries
    """
    # Implementation
```

### JavaScript

- Use ESLint with Airbnb config
- Use Prettier for formatting
- Use JSDoc for documentation

Example:
```javascript
/**
 * Fetches books from the API
 * @param {string} category - Optional category filter
 * @param {number} limit - Maximum number of books to return
 * @returns {Promise<Array>} List of books
 */
async function getBooks(category = null, limit = 10) {
  // Implementation
}
```

### HTML/CSS

- Use semantic HTML5 elements
- Follow BEM naming convention for CSS
- Use CSS variables for theming
- Mobile-first responsive design

## Git Workflow

### Branching Strategy

- `main`: Production-ready code
- `develop`: Development branch
- `feature/*`: New features
- `bugfix/*`: Bug fixes
- `hotfix/*`: Urgent production fixes

### Commit Messages

Follow Conventional Commits:
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Formatting
- `refactor`: Code restructuring
- `test`: Adding tests
- `chore`: Maintenance

### Pull Request Process

1. Create a feature branch
2. Make your changes
3. Write/update tests
4. Update documentation
5. Create a pull request
6. Address review comments
7. Merge after approval

## Testing

### Backend Tests

Run tests:
```bash
pytest
```

Test coverage:
```bash
pytest --cov=app tests/
```

### Frontend Tests

Run tests:
```bash
npm test
```

## API Documentation

### Authentication

All API endpoints require JWT authentication:
```
Authorization: Bearer <token>
```

### Endpoints

#### Books

```
GET /api/books
GET /api/books/<id>
POST /api/books
PUT /api/books/<id>
DELETE /api/books/<id>
```

#### Users

```
GET /api/users
GET /api/users/<id>
POST /api/users
PUT /api/users/<id>
DELETE /api/users/<id>
```

#### Borrowings

```
GET /api/borrowings
POST /api/borrowings
PUT /api/borrowings/<id>
```

#### Comments
```
GET /api/comments
GET /api/comments/<id>
POST /api/comments
PUT /api/comments/<id>
DELETE /api/comments/<id>
```

#### Comment Reports
```
GET /api/reports
POST /api/reports
PUT /api/reports/<id>
DELETE /api/reports/<id>
```

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Books Table
```sql
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    author VARCHAR NOT NULL,
    isbn VARCHAR UNIQUE,
    status VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Borrowings Table
```sql
CREATE TABLE borrowings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id),
    user_id UUID REFERENCES users(id),
    borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR NOT NULL
);
```

## Security Guidelines

1. Never commit sensitive data
2. Use environment variables for secrets
3. Validate all user input
4. Implement rate limiting
5. Use HTTPS only
6. Follow OWASP security guidelines

## Performance Guidelines

1. Use database indexes
2. Implement caching where appropriate
3. Optimize database queries
4. Minimize API calls
5. Use pagination for large datasets

## Deployment

### Backend Deployment

1. Build the application:
```bash
python setup.py build
```

2. Deploy to Vercel:
```bash
vercel
```

### Frontend Deployment

1. Build the static files
2. Deploy to a static hosting service

## Monitoring and Logging

- Use structured logging
- Monitor API endpoints
- Track error rates
- Monitor database performance

## Getting Help

- Check existing issues
- Join the development chat
- Contact the maintainers
- Read the documentation 