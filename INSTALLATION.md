# Installation Guide

This guide will help you set up the Library Management System on your local machine.

## Prerequisites

- Python 3.x
- Git
- A modern web browser
- Supabase account (for database)

## Environment Setup

### 1. Python Setup

1. Download and install Python 3.x from [python.org](https://www.python.org/downloads/)
2. Verify installation:
```bash
python --version
pip --version
```

### 2. Git Setup

1. Download and install Git from [git-scm.com](https://git-scm.com/downloads)
2. Verify installation:
```bash
git --version
```

## Project Setup

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/LibrarySystem.git
cd LibrarySystem
```

### 2. Backend Setup

1. Create and activate a virtual environment:
```bash
cd backend
python -m venv venv

# On Windows:
venv\Scripts\activate

# On macOS/Linux:
source venv/bin/activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the backend directory:
```env
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET_KEY=your_jwt_secret
```

### 3. Supabase Setup

1. Create a Supabase account at [supabase.com](https://supabase.com)
2. Create a new project
3. Get your project URL and API key from the project settings
4. Create the following tables in your Supabase database:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR NOT NULL UNIQUE,
    password_hash VARCHAR NOT NULL,
    role VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Books table
CREATE TABLE books (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR NOT NULL,
    author VARCHAR NOT NULL,
    isbn VARCHAR UNIQUE,
    status VARCHAR NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Borrowings table
CREATE TABLE borrowings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id),
    user_id UUID REFERENCES users(id),
    borrowed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    returned_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR NOT NULL
);

-- Comments table
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    book_id UUID REFERENCES books(id),
    user_id UUID REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR NOT NULL DEFAULT 'active'
);

-- Comment Reports table
CREATE TABLE comment_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID REFERENCES comments(id),
    reporter_id UUID REFERENCES users(id),
    reason TEXT NOT NULL,
    status VARCHAR NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE
);
```

## Running the Application

### 1. Start the Backend Server

```bash
cd backend
python run.py
```

The server will start on `http://localhost:5000`

### 2. Access the Frontend

- Student Interface: Open `STUDENT/index.html` in your browser
- Staff Interface: Open `STAFF/index.html` in your browser

## Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm install -g vercel
```

2. Deploy the backend:
```bash
cd backend
vercel
```

3. Configure environment variables in Vercel dashboard

### Frontend Deployment

1. Deploy the frontend files to a static hosting service (e.g., GitHub Pages, Netlify)
2. Update the API endpoint URLs in the frontend code to point to your deployed backend

## Troubleshooting

### Common Issues

1. **ModuleNotFoundError**
   - Solution: Ensure you're in the virtual environment and all dependencies are installed

2. **Database Connection Error**
   - Solution: Verify Supabase credentials in `.env` file

3. **CORS Issues**
   - Solution: Check if the backend CORS configuration matches your frontend domain

4. **JWT Authentication Error**
   - Solution: Verify JWT_SECRET_KEY in `.env` file

### Getting Help

If you encounter any issues not covered in this guide:
1. Check the [GitHub Issues](https://github.com/yourusername/LibrarySystem/issues)
2. Create a new issue with detailed information about your problem
3. Contact the development team 