"""
Routes related to resources (books and other library items)
"""

from flask import jsonify, request
from app import app
from app.database import get_resources, add_resource

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
    required_fields = ["r_inventoryNum", "r_title", "r_author", "r_editor", "r_ISBN", "r_price", "r_cote", "r_receivingDate", "r_status", "r_observation", "r_type"]
    
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