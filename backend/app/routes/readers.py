"""
Routes related to readers (users with reader type)
"""

from flask import jsonify
from app import app
from app.database import get_readers

@app.route('/api/readers', methods=['GET'])
def readers():
    """
    API endpoint to retrieve all readers (users with user_type 'reader')
    """
    reader_list = get_readers()
    return jsonify(reader_list) 