"""
Routes related to resource types
"""

from flask import jsonify
from app import app
from app.database import get_resource_types

@app.route('/api/resource-types', methods=['GET'])
def resource_types():
    """
    API endpoint to retrieve all resource types
    """
    resource_type_list = get_resource_types()
    return jsonify(resource_type_list) 