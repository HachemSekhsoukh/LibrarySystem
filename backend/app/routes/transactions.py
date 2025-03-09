"""
Routes related to transactions (borrowing and reservations)
"""

from flask import jsonify, request
from app import app
from app.database import get_transactions, create_reservation

@app.route('/api/transactions', methods=['GET'])
def transactions():
    """
    API endpoint to retrieve all reservations (transactions)
    """
    transaction_list = get_transactions()
    return jsonify(transaction_list)

@app.route('/api/transactions', methods=['POST'])
def create_transaction_endpoint():
    """
    API endpoint to create a new reservation
    """
    data = request.json
    
    # Validate required fields
    if not data.get('readerId'):
        return jsonify({"error": "Reader ID is required"}), 400
    
    if not data.get('bookId'):
        return jsonify({"error": "Book ID is required"}), 400
    
    # Call the database function to create the reservation
    result = create_reservation(
        user_id=data.get('readerId'),
        resource_id=data.get('bookId'),
        transaction_type=data.get('transactionType', 'Borrow')
    )
    
    if result.get('success'):
        return jsonify({
            "message": "Reservation created successfully",
            "reservation": result.get('reservation')
        })
    else:
        return jsonify({
            "error": result.get('error', 'An unknown error occurred')
        }), 500 