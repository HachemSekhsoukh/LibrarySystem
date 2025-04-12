from flask import jsonify, request
from app import app
from app.database import get_readers, add_reader, delete_reader, get_user_types, add_user_type, add_resource_type

@app.route('/api/readers', methods=['GET'])
def readers():
    """
    API endpoint to retrieve all readers.
    """
    reader_list = get_readers()
    return jsonify(reader_list)

@app.route("/api/user-types", methods=["GET"])
def user_types():
    return jsonify(get_user_types())

@app.route('/api/add-user-types', methods=['POST'])
def add_new_user_type():
    """
    API endpoint to add a new user type.
    Expects JSON data with 'u_type' and 'u_description'.
    """
    data = request.get_json()
    
    # Check if data is provided
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    # Check for required fields
    required_fields = ['ut_name', 'ut_borrow']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    
    if missing_fields:
        return jsonify({'success': False, 'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

    # Add the user type
    result = add_user_type(data)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400


@app.route('/api/add-resource-types', methods=['POST'])
def add_new_resource_type():
    """
    API endpoint to add a new user type.
    Expects JSON data with 'u_type' and 'u_description'.
    This endpoint is now deprecated. Use /api/resource-types instead.
    """
    # Redirect to the new endpoint for backwards compatibility
    from app.routes.resource_types import add_resource_type_endpoint
    return add_resource_type_endpoint()

@app.route('/api/add-readers', methods=['POST'])
def add_new_reader():
    """
    API endpoint to add a new reader.
    Expects JSON data with 'u_name', 'u_email', etc.
    """
    data = request.get_json()
    
    # Check if data is provided
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    # Check for required fields
    required_fields = ['u_name', 'u_email', 'u_birthDate', 'u_phone']
    missing_fields = [field for field in required_fields if field not in data or not data[field]]
    
    if missing_fields:
        return jsonify({'success': False, 'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400

    # Add the reader
    result = add_reader(data)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400


@app.route('/api/readers/<int:reader_id>', methods=['DELETE'])
def remove_reader(reader_id):
    """
    API endpoint to delete a reader by ID.
    """
    result = delete_reader(reader_id)
    return jsonify(result), (200 if result['success'] else 400)

