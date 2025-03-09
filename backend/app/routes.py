from flask import jsonify, request
from app import app
from app.database import get_readers, get_resources, create_reservation, add_resource, get_resource_types, get_transactions
import datetime

@app.route('/api/readers', methods=['GET'])
def readers():
    """
    API endpoint to retrieve all readers (users with user_type 'reader')
    """
    reader_list = get_readers()
    return jsonify(reader_list)

@app.route('/api/transactions', methods=['GET'])
def transactions():
    """
    API endpoint to retrieve all reservations (transactions)
    """
    transaction_list = get_transactions()
    return jsonify(transaction_list)


@app.route('/api/resources', methods=['GET'])
def resources():
    """
    API endpoint to retrieve all resources (books)
    """
    resource_list = get_resources()
    return jsonify(resource_list)

@app.route('/api/resource-types', methods=['GET'])
def resource_types():
    """
    API endpoint to retrieve all resource types
    """
    resource_type_list = get_resource_types()
    return jsonify(resource_type_list)

@app.route('/api/resources', methods=['POST'])
def add_resource_endpoint():
    """
    API endpoint to add a new resource (book)
    """
    data = request.json

    # Validate required fields
    required_fields = ["r_inventoryNum", "r_title", "r_author", "r_editor", "r_edition", "r_editionDate", "r_editionPlace", "r_ISBN", "r_price", "r_cote", "r_receivingDate", "r_status", "r_observation", "r_type"]
    
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400

    # Call the function to add the resource
    result = add_resource(data)

    if result.get('success'):
        return jsonify({
            "message": "Resource added successfully",
            "resource": result.get('resource')
        }), 201
    else:
        return jsonify({
            "error": result.get('error', 'An unknown error occurred')
        }), 500

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