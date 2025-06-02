# Library Management System

A modern, full-stack library management system that helps manage library resources and users efficiently. The system provides separate React applications for readers and staff, with role-based access control, comprehensive resource management, analytics, and multilingual support.

![Library System](STAFF/public/assets/images/logo.png)

## Key Features

- **User Management**
  - Separate React applications for readers and staff
  - Secure authentication and authorization
  - Role-based access control

- **Resource Management**
  - Resource catalog and inventory
  - Borrowing and return system
  - Resource status tracking
  - Advanced search and filter capabilities

- **Reader Features**
  - Browse catalog with modern UI
  - Borrow and return resources
  - Track borrowing history
  - View due dates and fines

- **Staff Features**
  - Interactive dashboard with analytics
  - Complete inventory management
  - Process borrowings and returns
  - Track late returns with notifications
  - Manage reader accounts
  - Generate statistical reports

- **Advanced Features**
  - Multilingual support (English/French)
  - Analytics dashboard with charts
  - Email notifications for due dates
  - Responsive design for mobile access

## Documentation

This project's documentation is organized into the following sections:

- [**Getting Started**](#getting-started): Quick installation and setup
- [**User Guide**](USAGE.md): Instructions for using the system
- [**API Reference**](API.md): Comprehensive API documentation
- [**Security**](SECURITY.md): Security policies and practices

## Technology Stack

- **Frontend**: 
  - React with Vite build tool
  - CSS Modules for styling
  - Chart.js for analytics visualization
  - i18next for internationalization (EN/FR)

- **Backend**: 
  - Python 3.9+ with Flask framework
  - RESTful API architecture
  - SQL database with ORM
  - JWT authentication
  - Email notification service

## Getting Started

### Prerequisites
- Node.js (v16+)
- Python (v3.9+)
- npm or yarn
- SQL database instance

### Quick Setup

#### Backend

```powershell
# Clone repository & navigate to project
git clone https://github.com/yourusername/LibrarySystem.git
cd LibrarySystem

# Set up Python virtual environment
cd backend
python -m venv venv
.\venv\Scripts\activate
pip install -r requirements.txt

# Run backend server
python run.py
```

#### Staff Application

```powershell
cd STAFF
npm install
npm run dev
```

#### Reader Application

```powershell
cd STUDENT
npm install
npm run dev
```


## Project Structure

The project uses a clean architecture with separate frontend applications and a shared backend:

```
LibrarySystem/
├── backend/                  # Flask backend
│   ├── app/                  # Main application package
│   │   ├── database.py       # Database configuration
│   │   ├── email_service.py  # Email notifications
│   │   └── routes/           # API endpoints by resource
│   ├── requirements.txt      # Python dependencies
│   └── run.py                # Application entry point
├── STAFF/                    # Staff frontend (React)
│   ├── public/               # Static assets
│   └── src/                  # Source code
│       ├── components/       # UI components
│       ├── CSS/              # Styling
│       ├── Layouts/          # Page layouts
│       ├── locales/          # Translation files (EN/FR)
│       └── Pages/            # Application views
└── STUDENT/                  # Reader frontend (React)
    ├── package.json          # Node dependencies
    ├── public/               # Static assets
    └── src/                  # Source code
        ├── components/       # UI components
        ├── CSS/              # Styling
        ├── Pages/            # Application views
        └── utils/            # Utility functions
```

## Core Features

### Analytics Dashboard
The staff interface includes a comprehensive analytics dashboard with:
- Monthly borrowing statistics
- Resource type distribution
- Late returns tracking
- Active reader metrics

### Internationalization
Both interfaces support multiple languages:
- English (default)
- French
- Easily extensible to other languages

### Security
- Role-based access control
- Secure JWT authentication
- Data encryption
- Input validation and sanitization
- CORS protection
- SQL injection prevention



