from datetime import timedelta
from flask import jsonify, request, make_response
from app import app
from app.database import (
    sign_up_student,
    login_student,
    get_student_by_email,
    update_student_password,
    get_student_password,
    update_student_by_email
)
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

@app.route('/api/student/signup', methods=['POST'])
def api_student_signup():
    data = request.get_json()

    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400

    email = data['email']
    password = data['password']
    name = data.get('name')  # Optional field

    result = sign_up_student(email, password, name)

    if result['success']:
        return jsonify({
            'success': True,
            'message': 'User registered successfully',
            'user': result['user']
        }), 201
    else:
        return jsonify({
            'success': False,
            'error': result['error']
        }), 400


@app.route('/api/student/login', methods=['POST'])
def api_student_login():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400

    result = login_student(data['email'], data['password'])

    if result['success']:
        access_token = create_access_token(identity=data['email'], expires_delta=timedelta(hours=8))
        
        response = make_response(jsonify({'success': True, 'message': 'Login successful'}))
        response.set_cookie(
            'access_token_cookie', access_token, 
            httponly=True,
            secure=False,
            samesite='None',
            path='/'
        )
        return response
    else:
        return jsonify({'success': False, 'error': result['error']}), 401

@app.route('/api/student/logout', methods=['POST'])
def student_logout():
    resp = make_response(jsonify({"message": "Logged out successfully"}))
    resp.set_cookie(
        'access_token_cookie',
        '',
        expires=0,
        httponly=True,
        secure=True,
        samesite='None',
        path='/',
    )
    return resp

@app.route('/api/student/user/me', methods=['GET'])
@jwt_required()
def get_student_info():
    access_token = request.cookies.get('access_token_cookie')
    if not access_token:
        return jsonify({"error": "Missing token in cookies"}), 401

    user_email = get_jwt_identity()
    user = get_student_by_email(user_email)
    if user:
        return jsonify({
            'name': user['name'],
            'email': user['email'],
            'phone': user.get('phone'),
            'birthdate': user.get('birthdate'),
            'address': user.get('address')
        }), 200
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/student/user/status', methods=['GET'])
@jwt_required()
def check_student_status():
    access_token = request.cookies.get('access_token_cookie')
    if not access_token:
        return jsonify({"authenticated": False, "error": "Missing token"}), 401

    user_email = get_jwt_identity()
    if user_email:
        return jsonify({
            "authenticated": True,
            "email": user_email
        }), 200

    return jsonify({"authenticated": False, "error": "Invalid token"}), 401

@app.route('/api/student/user/update', methods=['PUT'])
@jwt_required()
def update_student_info():
    access_token = request.cookies.get('access_token_cookie')
    if not access_token:
        return jsonify({"error": "Missing token in cookies"}), 401

    user_email = get_jwt_identity()
    user = get_student_by_email(user_email)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()
    if not data:
        return jsonify({"error": "No input data provided"}), 400

    allowed_fields = ['name', 'birthdate', 'address']
    update_data = {field: data[field] for field in allowed_fields if field in data}

    if not update_data:
        return jsonify({"error": "No valid fields to update"}), 400

    try:
        update_student_by_email(user_email, update_data)
        updated_user = get_student_by_email(user_email)
        return jsonify({
            'name': updated_user['name'],
            'email': updated_user['email'],
            'birthdate': updated_user.get('birthdate'),
            'address': updated_user.get('address')
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to update user: {str(e)}'}), 500

@app.route('/api/student/user/update-password', methods=['PUT'])
@jwt_required()
def update_student_password():
    current_user_email = get_jwt_identity()
    data = request.get_json()
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    user = get_student_by_email(current_user_email)
    old_user_password = get_student_password(current_user_email)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    if not check_password_hash(old_user_password, old_password):
        return jsonify({"error": "Old password is incorrect."}), 400

    try:
        update_student_password(current_user_email, new_password)
        return jsonify({"success": "Password updated successfully."}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 500
