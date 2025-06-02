# Testing Documentation

This document outlines the testing strategy and procedures for the Library Management System.

## Testing Strategy

### Test Levels

1. **Unit Tests**
   - Individual component testing
   - Function and method testing
   - Isolated testing with mocks

2. **Integration Tests**
   - Component interaction testing
   - API endpoint testing
   - Database integration testing

3. **System Tests**
   - End-to-end testing
   - User flow testing
   - Performance testing

4. **Acceptance Tests**
   - User acceptance testing
   - Business requirement validation
   - User story validation

## Test Environment Setup

### Prerequisites

- Python 3.x
- Node.js
- PostgreSQL
- Chrome/Firefox for E2E testing

### Installation

1. Install test dependencies:
```bash
# Backend tests
cd backend
pip install -r requirements-test.txt

# Frontend tests
cd STUDENT
npm install
```

2. Set up test database:
```bash
# Create test database
createdb library_system_test

# Run migrations
python manage.py db upgrade
```

## Test Types

### Backend Tests

#### Unit Tests

Location: `backend/tests/unit/`

Example:
```python
def test_book_creation():
    book = Book(
        title="Test Book",
        author="Test Author",
        isbn="1234567890"
    )
    assert book.title == "Test Book"
    assert book.author == "Test Author"
    assert book.isbn == "1234567890"
```

#### Integration Tests

Location: `backend/tests/integration/`

Example:
```python
def test_book_borrowing_flow():
    # Create test user
    user = create_test_user()
    
    # Create test book
    book = create_test_book()
    
    # Borrow book
    borrowing = borrow_book(user.id, book.id)
    
    assert borrowing.status == "active"
    assert borrowing.user_id == user.id
    assert borrowing.book_id == book.id
```

#### API Tests

Location: `backend/tests/api/`

Example:
```python
def test_get_books_endpoint():
    response = client.get('/api/books')
    assert response.status_code == 200
    assert len(response.json['items']) > 0
```

### Frontend Tests

#### Unit Tests

Location: `STUDENT/tests/unit/`

Example:
```javascript
describe('BookList', () => {
  it('should render book list', () => {
    const books = [
      { id: 1, title: 'Book 1' },
      { id: 2, title: 'Book 2' }
    ];
    const wrapper = shallow(<BookList books={books} />);
    expect(wrapper.find('.book-item')).toHaveLength(2);
  });
});
```

#### Integration Tests

Location: `STUDENT/tests/integration/`

Example:
```javascript
describe('Book Borrowing', () => {
  it('should allow user to borrow a book', async () => {
    // Login
    await login(user);
    
    // Navigate to book list
    await navigateToBooks();
    
    // Borrow book
    await borrowBook(bookId);
    
    // Verify borrowing
    expect(await getBorrowedBooks()).toContain(bookId);
  });
});
```

#### E2E Tests

Location: `tests/e2e/`

Example:
```javascript
describe('Student Flow', () => {
  it('should complete book borrowing process', async () => {
    // Start at login page
    await page.goto('/login');
    
    // Login
    await page.fill('#email', 'student@example.com');
    await page.fill('#password', 'password123');
    await page.click('#login-button');
    
    // Navigate to books
    await page.click('#books-link');
    
    // Borrow book
    await page.click('.book-item:first-child .borrow-button');
    
    // Verify success
    expect(await page.textContent('.success-message'))
      .toContain('Book borrowed successfully');
  });
});
```

## Test Coverage

### Coverage Requirements

- Unit Tests: 80% minimum
- Integration Tests: 70% minimum
- E2E Tests: Critical paths only

### Running Coverage Reports

```bash
# Backend coverage
pytest --cov=app tests/

# Frontend coverage
npm run test:coverage
```

## Test Data

### Test Fixtures

Location: `tests/fixtures/`

```python
# users.json
{
  "student": {
    "email": "student@example.com",
    "password": "password123",
    "role": "student"
  },
  "staff": {
    "email": "staff@example.com",
    "password": "password123",
    "role": "staff"
  }
}

# books.json
{
  "available": {
    "title": "Available Book",
    "author": "Test Author",
    "isbn": "1234567890",
    "status": "available"
  },
  "borrowed": {
    "title": "Borrowed Book",
    "author": "Test Author",
    "isbn": "0987654321",
    "status": "borrowed"
  }
}
```

## Performance Testing

### Load Testing

Tool: Locust

```python
from locust import HttpUser, task, between

class LibraryUser(HttpUser):
    wait_time = between(1, 5)
    
    @task
    def browse_books(self):
        self.client.get("/api/books")
    
    @task
    def search_books(self):
        self.client.get("/api/books?search=test")
```

### Stress Testing

Tool: Apache JMeter

- Test concurrent users
- Test database performance
- Test API response times

## Security Testing

### Authentication Tests

```python
def test_invalid_login():
    response = client.post('/api/auth/login', json={
        'email': 'invalid@example.com',
        'password': 'wrongpassword'
    })
    assert response.status_code == 401
```

### Authorization Tests

```python
def test_unauthorized_access():
    response = client.get('/api/admin/users')
    assert response.status_code == 403
```

## Test Automation

### CI/CD Integration

```yaml
# .github/workflows/test.yml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Set up Python
        uses: actions/setup-python@v2
      - name: Install dependencies
        run: |
          pip install -r requirements.txt
          pip install -r requirements-test.txt
      - name: Run tests
        run: |
          pytest
          pytest --cov=app tests/
```

## Test Maintenance

### Best Practices

1. Keep tests independent
2. Use meaningful test names
3. Follow AAA pattern (Arrange, Act, Assert)
4. Clean up test data
5. Use appropriate assertions
6. Document test cases
7. Regular test review
8. Update tests with code changes

### Test Review Process

1. Code review includes test review
2. Verify test coverage
3. Check test quality
4. Validate test data
5. Review test documentation

## Troubleshooting

### Common Issues

1. **Test Database Issues**
   - Solution: Reset test database
   - Check database migrations
   - Verify database credentials

2. **Test Environment Issues**
   - Solution: Check environment variables
   - Verify dependencies
   - Check test configuration

3. **Test Data Issues**
   - Solution: Reset test fixtures
   - Check data consistency
   - Verify test data setup

### Getting Help

- Check test documentation
- Review test logs
- Contact test team
- Check CI/CD logs 