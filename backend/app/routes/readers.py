from flask import jsonify, request
import supabase
from app import app
from app.database import add_reader, delete_reader, get_readers_by_status, get_user_types, add_user_type, add_resource_type, update_reader_status_in_db,update_user_type, update_reader,delete_user_type, get_reader_history, get_transactions, add_suggestion, fetch_all_suggestions, delete_suggestion
from flask_jwt_extended import create_access_token,jwt_required, get_jwt_identity

@app.route('/api/readers', methods=['GET'])
@jwt_required()
def readers():
    """
    API endpoint to retrieve all readers.
    """
    reader_list = get_readers_by_status()
    return jsonify(reader_list)

@app.route('/api/pending-readers', methods=['GET'])
def pending_readers():
    """
    API endpoint to retrieve pending readers.
    """
    pending_reader_list = get_readers_by_status(0)
    return jsonify(pending_reader_list)

@app.route("/api/user-types", methods=["GET"])
def user_types():
    return jsonify(get_user_types())

@app.route('/api/add-readers', methods=['POST'])
@jwt_required()
def add_new_reader():
    """
    API endpoint to add a new reader.
    Expects JSON data with 'u_name', 'u_email', etc.
    """
    data = request.get_json()
    user_email = get_jwt_identity()
    
    # Check if data is provided
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    # Check for required fields
    required_fields = ['u_name', 'u_email', 'u_birthDate', 'u_phone', 'u_password']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    
    if missing_fields:
        return jsonify({'success': False, 'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

    # Add the reader
    result = add_reader(user_email,data)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@app.route('/api/add-user-types', methods=['POST'])
@jwt_required()
def add_new_user_type():
    """
    API endpoint to add a new user type.
    Expects JSON data with 'ut_name', 'ut_borrow', 'ut_books', and 'ut_renew'.
    """
    data = request.get_json()
    user_email = get_jwt_identity()
    
    # Check if data is provided
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    # Check for required fields
    required_fields = ['ut_name', 'ut_borrow', 'ut_books', 'ut_renew']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    
    if missing_fields:
        return jsonify({'success': False, 'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    # Add the user type
    result = add_user_type(user_email,data)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@app.route('/api/user-types/<int:user_type_id>', methods=['PUT'])
@jwt_required()
def update_user_type_endpoint(user_type_id):
    """
    API endpoint to update a user type.
    Expects JSON data with 'ut_name', 'ut_borrow', 'ut_books', and 'ut_renew'.
    """
    data = request.get_json()
    
    # Check if data is provided
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    # Check for required fields
    required_fields = ['ut_name', 'ut_borrow', 'ut_books', 'ut_renew']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    
    if missing_fields:
        return jsonify({'success': False, 'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

    # Update the user type
    result = update_user_type(user_type_id, data)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@app.route('/api/user-types/<int:user_type_id>', methods=['DELETE'])
@jwt_required()
def delete_user_type_endpoint(user_type_id):
    """
    API endpoint to delete a user type.
    """
    result = delete_user_type(user_type_id)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400
    

@app.route('/api/update-readers/<int:reader_id>/status', methods=['PATCH'])
@jwt_required()
def update_reader_status(reader_id):
    data = request.get_json()
    print("Received data:", data)  # Debug log

    if not data or 'status' not in data:
        return jsonify({'success': False, 'error': 'Missing status in request body'}), 400

    new_status = data['status']
    result = update_reader_status_in_db(reader_id, new_status)
    
    return jsonify(result), (200 if result['success'] else 400)

@app.route('/api/readers/<int:reader_id>', methods=['DELETE'])
@jwt_required()
def remove_reader(reader_id):
    """
    API endpoint to delete a reader by ID.
    """
    user_email = get_jwt_identity()
    result = delete_reader(user_email,reader_id)
    return jsonify(result), (200 if result['success'] else 400)

@app.route('/api/readers/<int:reader_id>', methods=['PUT'])
@jwt_required()
def update_reader_endpoint(reader_id):
    """
    API endpoint to update a reader by ID
    """
    data = request.json
    user_email = get_jwt_identity()
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    # Check for required fields
    required_fields = ['u_name', 'u_email', 'u_birthDate', 'u_phone']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    
    if missing_fields:
        return jsonify({'success': False, 'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Update the reader
    result = update_reader(user_email,reader_id, data)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@app.route('/api/history', methods=['GET'])
def get_history():
    try:
        user_id = request.args.get('user_id')
        print(f"Received request for history with user_id: {user_id}")
        
        if not user_id:
            print("Error: No user_id provided")
            return jsonify({'error': 'User ID is required'}), 400

        print(f"Fetching history for user {user_id}")
        history = get_reader_history(user_id)
        print(f"Retrieved history data: {history}")
        
        return jsonify(history)

    except Exception as e:
        print(f"Error in get_history route: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/suggestions', methods=['POST'])
@jwt_required()
def create_suggestion():
    """
    API endpoint to create a new suggestion
    """
    try:
        data = request.json
        if not data:
            return jsonify({'success': False, 'error': 'No data provided'}), 400

        required_fields = ['userId', 'content']
        missing_fields = [field for field in required_fields if field not in data or not data[field]]
        
        if missing_fields:
            return jsonify({
                'success': False, 
                'error': f'Missing required fields: {", ".join(missing_fields)}'
            }), 400

        result = add_suggestion(data['userId'], data['content'])
        
        if result['success']:
            return jsonify(result), 201
        else:
            return jsonify(result), 400
    except Exception as e:
        print(f"Error in create_suggestion: {str(e)}")
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@app.route('/api/suggestions', methods=['GET'])
@jwt_required()
def get_all_suggestions():
    """
    API endpoint to get all suggestions
    """
    try:
        suggestions = fetch_all_suggestions()
        if not isinstance(suggestions, list):
            print(f"Error: fetch_all_suggestions returned non-list type: {type(suggestions)}")
            return jsonify({'error': 'Invalid response format'}), 500
        return jsonify(suggestions), 200
    except Exception as e:
        print(f"Error in get_all_suggestions route: {str(e)}")
        return jsonify({'error': str(e)}), 500

@app.route('/api/suggestions/<int:suggestion_id>', methods=['DELETE'])
@jwt_required()
def delete_suggestion_endpoint(suggestion_id):
    """
    API endpoint to delete a suggestion
    """
    try:
        result = delete_suggestion(suggestion_id)
        if result['success']:
            return jsonify(result), 200
        return jsonify(result), 400
    except Exception as e:
        return jsonify({'error': str(e)}), 500

