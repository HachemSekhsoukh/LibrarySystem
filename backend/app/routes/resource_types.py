"""
Routes related to resource types
"""

from flask import jsonify, request
from app import app
from app.database import get_resource_types, add_resource_type, delete_resource_type, update_resource_type
from flask_jwt_extended import create_access_token,jwt_required, get_jwt_identity

@app.route('/api/resource-types', methods=['GET'])
def resource_types():
    """
    API endpoint to retrieve all resource types
    """
    resource_type_list = get_resource_types()
    return jsonify(resource_type_list)

@app.route('/api/resource-types', methods=['POST'])
@jwt_required()
def add_resource_type_endpoint():
    """
    API endpoint to add a new resource type
    """
    data = request.json
    user_email = get_jwt_identity()
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    # Check for required fields
    required_fields = ['rt_name', 'rt_borrow']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({'success': False, 'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Add the resource type
    result = add_resource_type(user_email,data)
    
    if result['success']:
        return jsonify(result), 201
    else:
        return jsonify(result), 400

@app.route('/api/resource-types/<int:resource_type_id>', methods=['DELETE'])
def remove_resource_type(resource_type_id):
    """
    API endpoint to delete a resource type by ID
    """
    result = delete_resource_type(resource_type_id)
    return jsonify(result), (200 if result['success'] else 400)

@app.route('/api/resource-types/<int:resource_type_id>', methods=['PUT'])
def update_resource_type_endpoint(resource_type_id):
    """
    API endpoint to update a resource type by ID
    """
    data = request.json
    
    if not data:
        return jsonify({'success': False, 'error': 'No data provided'}), 400
    
    # Check for required fields
    required_fields = ['rt_name', 'rt_borrow']
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({'success': False, 'error': f'Missing required fields: {", ".join(missing_fields)}'}), 400
    
    # Update the resource type
    result = update_resource_type(resource_type_id, data)
    
    if result['success']:
        return jsonify(result), 200
    else:
        return jsonify(result), 400



