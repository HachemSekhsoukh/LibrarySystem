# Library Management System

A modern library management system that helps manage books, students, and staff members efficiently. The system provides separate interfaces for students and staff members, with role-based access control and comprehensive book management features.

## Key Features

- **User Management**
  - Separate interfaces for students and staff
  - Secure authentication and authorization
  - Role-based access control

- **Book Management**
  - Book catalog and inventory
  - Book borrowing and return system
  - Book status tracking
  - Search and filter capabilities

- **Student Features**
  - View available books
  - Borrow and return books
  - Track borrowing history
  - View due dates and fines
  - Comment on books
  - Report inappropriate comments

- **Staff Features**
  - Manage book inventory
  - Process book borrowings and returns
  - Manage student accounts
  - Generate reports
  - Moderate comments
  - Handle comment reports

## Tech Stack

### Backend
- Python 3.x
- Flask (Web Framework)
- Flask-JWT-Extended (Authentication)
- Supabase (Database)
- Flask-CORS (Cross-Origin Resource Sharing)

### Frontend
- HTML5
- CSS3
- JavaScript
- Bootstrap (UI Framework)

## Installation & Usage

1. Clone the repository:
```bash
git clone https://github.com/yourusername/LibrarySystem.git
cd LibrarySystem
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

3. Configure environment variables:
Create a `.env` file in the backend directory with the following variables:
```
SUPABASE_URL=your_supabase_url
SUPABASE_KEY=your_supabase_key
JWT_SECRET_KEY=your_jwt_secret
```

4. Run the backend server:
```bash
python run.py
```

5. Access the application:
- Student Interface: Open `STUDENT/index.html` in your browser
- Staff Interface: Open `STAFF/index.html` in your browser

## Project Structure

```
LibrarySystem/
├── backend/
│   ├── app/
│   ├── requirements.txt
│   └── run.py
├── STUDENT/
│   └── index.html
├── STAFF/
│   └── index.html
└── README.md
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## Security

- All API endpoints are protected with JWT authentication
- Passwords are securely hashed
- CORS is properly configured
- Input validation is implemented
- SQL injection prevention measures are in place

## Support

For support, please open an issue in the GitHub repository or contact the development team. 