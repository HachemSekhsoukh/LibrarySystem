from app import app
from app.database import mark_late_reservations

if __name__ == '__main__':
    print("Running mark_late_reservations on backend startup...")
    mark_late_reservations()
    app.run()
