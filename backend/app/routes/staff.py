from datetime import timedelta
from flask import jsonify, request, make_response
from app.database import get_all_staff_members, add_staff_member
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
    data = request.get_json()
    result, status_code = add_staff_member(data)
    return jsonify(result), status_code