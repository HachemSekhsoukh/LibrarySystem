from datetime import timedelta
from flask import jsonify, request, make_response
from app.database import get_all_staff_members, add_staff_member, get_staff_types, add_staff_type, delete_staff_type, update_staff_type, assign_privileges_to_user_type, delete_staff_member, update_staff_member
from app import app
from flask_jwt_extended import jwt_required, get_jwt_identity

@app.route('/api/staff', methods=['GET'])
@jwt_required()  # Require a valid JWT to access this route
def get_all_staff():
    current_user = get_jwt_identity()  # Optional: use this if you need the user's identity

    staff_data = get_all_staff_members()
    return jsonify({'success': True, 'staff': staff_data})

@app.route('/api/staff/add', methods=['POST'])
@jwt_required()
def handle_add_staff():
    user_email = get_jwt_identity()
    data = request.get_json()
    print(data)
    result, status_code = add_staff_member(user_email,data)
    return jsonify(result), status_code


@app.route('/api/staff-types', methods=['GET'])
@jwt_required()
def staff_types():
    """
    API endpoint to retrieve all staff types
    """
    staff_type_list = get_staff_types()
    return jsonify(staff_type_list)

@app.route('/api/staff-types', methods=['POST'])
@jwt_required()
def add_staff_type_endpoint():
    """
    API endpoint to add a new staff type
    """
    data = request.json
    user_email = get_jwt_identity()
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    # Check for required fields
    required_fields = ['st_name']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({'success': False, 'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Add the resource type
    result = add_staff_type(user_email,data)
    print(result)
    
    if result['success']:
        return jsonify(result), 201
    else:
        return jsonify(result), 400

@app.route('/api/staff-types/<int:staff_type_id>', methods=['DELETE'])
@jwt_required()
def remove_staff_type(staff_type_id):
    """
    API endpoint to delete a resource type by ID
    """
    try:
        user_email = get_jwt_identity()
        result = delete_staff_type(user_email, staff_type_id)
        
        if not result['success']:
            print(f"Failed to delete staff type {staff_type_id}: {result.get('error', 'Unknown error')}")
            return jsonify(result), 400
            
        print(f"Successfully deleted staff type {staff_type_id}")
        return jsonify(result), 200
    except Exception as e:
        print(f"Error in remove_staff_type: {str(e)}")
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/api/staff-types/<int:staff_type_id>', methods=['PUT'])
@jwt_required()
def update_staff_type_endpoint(staff_type_id):
    """
    API endpoint to update a staff type by ID
    """
    data = request.json
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    # Check for required fields
    required_fields = ['st_name']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({'success': False, 'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Update the staff type
    result = update_staff_type(staff_type_id, data)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400
    
@app.route('/api/staff-types/<int:user_type_id>/privileges', methods=['POST'])
@jwt_required()
def assign_privileges(user_type_id):
    """
    API endpoint to assign privileges to a staff type
    """
    data = request.json

    if not data or 'privileges' not in data:
        return jsonify({'success': False, 'error': 'Missing privileges data'}), 400

    privileges = data['privileges']  # Expected to be a list of privilege names or IDs

    if not isinstance(privileges, list):
        return jsonify({'success': False, 'error': 'Privileges should be a list'}), 400

    print("calling assign...")
    result = assign_privileges_to_user_type(user_type_id, privileges)

    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400

@app.route('/api/staff/<int:staff_id>', methods=['DELETE'])
@jwt_required()
def remove_staff(staff_id):
    """
    API endpoint to delete a staff member by ID
    """
    user_email = get_jwt_identity()
    result = delete_staff_member(user_email, staff_id)
    return jsonify(result), (200 if result['success'] else 400)

@app.route('/api/staff/<int:staff_id>', methods=['PUT'])
@jwt_required()
def update_staff(staff_id):
    """
    API endpoint to update a staff member by ID
    """
    user_email = get_jwt_identity()
    data = request.json
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    # Update the staff member
    result = update_staff_member(user_email, staff_id, data)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400