"""
Routes related to transactions (borrowing and reservations)
"""

from flask import jsonify, request
from app import app
from flask_jwt_extended import create_access_token,jwt_required, get_jwt_identity
from app.database import get_transactions, create_reservation, update_reservation, delete_reservation, get_transactions_by_user

@app.route('/api/transactions', methods=['GET'])
def transactions():
    """
    API endpoint to retrieve all reservations (transactions)
    """
    transaction_list = get_transactions()
    return jsonify(transaction_list)

@app.route('/api/transactions', methods=['POST'])
@jwt_required()
def create_transaction_endpoint():
    """
    API endpoint to create a new reservation
    """
    user_email = get_jwt_identity()
    data = request.json
    print("create_transaction_endpoint")
    print(data)
    print("--------------------------------")

    # Validate required fields
    if not data.get('readerId'):
        return jsonify({"error": "Reader ID is required"}), 400
    
    if not data.get('bookId'):
        return jsonify({"error": "Book ID is required"}), 400
    
    # Call the database function to create the reservation
    result = create_reservation(
        user_email,
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

@app.route('/api/transactions/<int:transaction_id>', methods=['PUT'])
def update_transaction(transaction_id):
    """
    API endpoint to update an existing transaction (reservation)
    """
    data = request.json
    
    # Validate that at least one field is provided
    if not data:
        return jsonify({"error": "No update data provided"}), 400
    
    # Extract the fields to update
    user_id = data.get('readerId')
    resource_id = data.get('bookId')
    transaction_type = data.get('transactionType')
    
    # Call the database function to update the reservation
    result = update_reservation(
        reservation_id=transaction_id,
        user_id=user_id,
        resource_id=resource_id,
        transaction_type=transaction_type
    )
    
    if result.get('success'):
        return jsonify({
            "success": True,
            "message": "Transaction updated successfully",
            "reservation": result.get('reservation')
        })
    else:
        return jsonify({
            "success": False,
            "error": result.get('error', 'An unknown error occurred')
        }), 400

@app.route('/api/transactions/<int:transaction_id>', methods=['DELETE'])
def delete_transaction(transaction_id):
    """
    API endpoint to delete a transaction (reservation)
    """
    # Call the database function to delete the reservation
    result = delete_reservation(transaction_id)
    
    if result.get('success'):
        return jsonify({
            "success": True,
            "message": "Transaction deleted successfully"
        })
    else:
        return jsonify({
            "success": False,
            "error": result.get('error', 'An unknown error occurred')
        }), 400 
    
@app.route('/api/transactions/user/<int:user_id>', methods=['GET'])
def get_user_transactions_endpoint(user_id):
    """
    API endpoint to get all transactions for a specific user
    """
    transaction_list = get_transactions_by_user(user_id)
    print("transaction_list")
    print(transaction_list)
    print("--------------------------------")
    return jsonify(transaction_list)