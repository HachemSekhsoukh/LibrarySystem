# Architecture Documentation

This document describes the architecture of the Library Management System using the C4 model.

## System Context

The Library Management System is a web-based application that helps manage library operations, including book management, user management, and borrowing processes.

### Key Stakeholders

- Students: End users who borrow books
- Staff: Library staff who manage the system
- Administrators: System administrators
- Developers: Software development team

## Container Diagram

The system consists of the following containers:

1. **Web Application**
   - Student Interface (HTML/CSS/JavaScript)
   - Staff Interface (HTML/CSS/JavaScript)
   - Single Page Application

2. **API Application**
   - Python Flask Application
   - RESTful API
   - Authentication Service
   - Business Logic

3. **Database**
   - Supabase (PostgreSQL)
   - Data Storage
   - Data Management

4. **File Storage**
   - Static Assets
   - User Uploads
   - System Files

## Component Diagram

### Web Application Components

1. **Student Interface**
   - Login Component
   - Book Catalog Component
   - Borrowing Management Component
   - Profile Management Component

2. **Staff Interface**
   - Dashboard Component
   - Book Management Component
   - User Management Component
   - Report Generation Component

### API Application Components

1. **Authentication Service**
   - User Authentication
   - JWT Token Management
   - Role-based Access Control

2. **Book Service**
   - Book CRUD Operations
   - Book Search
   - Book Status Management

3. **User Service**
   - User CRUD Operations
   - User Role Management
   - User Profile Management

4. **Borrowing Service**
   - Borrowing Management
   - Return Processing
   - Fine Calculation

5. **Report Service**
   - Report Generation
   - Data Analytics
   - Export Functionality

## Code Diagram

### Backend Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── routes/
│   │   ├── auth.py
│   │   ├── books.py
│   │   ├── users.py
│   │   └── borrowings.py
│   ├── models/
│   │   ├── user.py
│   │   ├── book.py
│   │   └── borrowing.py
│   ├── services/
│   │   ├── auth_service.py
│   │   ├── book_service.py
│   │   ├── user_service.py
│   │   └── borrowing_service.py
│   └── utils/
│       ├── validators.py
│       ├── helpers.py
│       └── constants.py
├── tests/
├── requirements.txt
└── run.py
```

### Frontend Structure

```
STUDENT/
├── index.html
├── css/
│   ├── style.css
│   └── components/
├── js/
│   ├── app.js
│   ├── auth.js
│   ├── books.js
│   └── borrowings.js
└── assets/

STAFF/
├── index.html
├── css/
│   ├── style.css
│   └── components/
├── js/
│   ├── app.js
│   ├── dashboard.js
│   ├── books.js
│   ├── users.js
│   └── reports.js
└── assets/
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

## Security Architecture

### Authentication Flow

1. User submits credentials
2. Server validates credentials
3. JWT token generated
4. Token returned to client
5. Token used for subsequent requests

### Authorization

- Role-based access control
- JWT token validation
- Permission checking
- Resource ownership validation

### Data Protection

- Password hashing
- Input validation
- SQL injection prevention
- XSS protection
- CSRF protection

## Deployment Architecture

### Development Environment

- Local development server
- Development database
- Development configuration

### Staging Environment

- Staging server
- Staging database
- Staging configuration
- Automated testing

### Production Environment

- Production server
- Production database
- Production configuration
- Monitoring and logging

## Monitoring and Logging

### Application Monitoring

- Error tracking
- Performance monitoring
- User activity tracking
- System health checks

### Logging

- Application logs
- Error logs
- Access logs
- Audit logs

## Backup and Recovery

### Database Backup

- Daily automated backups
- Point-in-time recovery
- Backup verification

### System Recovery

- Disaster recovery plan
- System restoration procedures
- Data recovery procedures

## Performance Considerations

### Caching Strategy

- API response caching
- Static asset caching
- Database query caching

### Optimization

- Database indexing
- Query optimization
- Asset optimization
- Code optimization

## Scalability

### Horizontal Scaling

- Load balancing
- Multiple instances
- Database replication

### Vertical Scaling

- Resource allocation
- Performance tuning
- Capacity planning

## Integration Points

### External Systems

- Email service
- SMS service
- Payment gateway
- Analytics service

### APIs

- RESTful API
- Webhook endpoints
- SDK support
- API versioning

## Development Workflow

### Version Control

- Git workflow
- Branching strategy
- Code review process
- Release management

### CI/CD Pipeline

- Automated testing
- Code quality checks
- Deployment automation
- Environment management

## Future Considerations

### Planned Features

- Mobile application
- Advanced analytics
- Machine learning integration
- Enhanced reporting

### Technical Debt

- Code refactoring
- Performance optimization
- Security enhancements
- Documentation updates 