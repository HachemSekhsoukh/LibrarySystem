"""
Routes related to resources (books and other library items)
"""

from flask import jsonify, request
from app import app
from app.database import get_resources, add_resource, delete_resource, update_resource

@app.route('/api/resources', methods=['GET'])
def resources():
    """
    API endpoint to retrieve all resources (books)
    """
    resource_list = get_resources()
    return jsonify(resource_list)

@app.route('/api/resources', methods=['POST'])
def add_resource_endpoint():
    """
    API endpoint to add a new resource (book)
    """
    data = request.json

    # Validate required fields
    required_fields = ["r_inventoryNum", "r_title", "r_author", "r_editor", "r_ISBN", "r_price", "r_cote", "r_receivingDate", "r_status", "r_observation", "r_type", "r_description"]
    
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

@app.route('/api/resources/<int:resource_id>', methods=['DELETE'])
def remove_resource(resource_id):
    """
    API endpoint to delete a resource by ID.
    """
    result = delete_resource(resource_id)
    return jsonify(result), (200 if result['success'] else 400)

@app.route('/api/resources/<int:resource_id>', methods=['PUT'])
def update_resource_endpoint(resource_id):
    """
    API endpoint to update a resource by ID.
    """
    data = request.json
    
    # Validate required fields
    required_fields = ["r_inventoryNum", "r_title", "r_author", "r_editor", "r_ISBN", "r_price", "r_cote", "r_receivingDate", "r_status", "r_observation", "r_type"]
    
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        return jsonify({"error": f"Missing required fields: {', '.join(missing_fields)}"}), 400
    
    # Call the function to update the resource
    result = update_resource(resource_id, data)
    
    if result.get('success'):
        return jsonify({
            "message": "Resource updated successfully",
            "resource": result.get('resource')
        }), 200
    else:
        return jsonify({
            "error": result.get('error', 'An unknown error occurred')
        }), 400 