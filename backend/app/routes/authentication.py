from datetime import timedelta
from flask import jsonify, request, make_response
from app import app
from app.database import get_user_privileges, login, get_user_by_email, update_user_password, get_user_password, update_user_by_email, add_log
from werkzeug.security import check_password_hash
from flask_jwt_extended import create_access_token,jwt_required, get_jwt_identity

@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400

    # Assuming login function checks credentials and returns a result
    result = login(data['email'], data['password'])

    if result['success']:
        # Generate access token
        access_token = create_access_token(identity=data['email'],  expires_delta=timedelta(hours=8))  # Token expires in 1 hour)
        
        user = get_user_by_email(data['email'])
        privileges = get_user_privileges(data['email'])
        # Create the response
        response = make_response(jsonify({
            'success': True, 
            'message': 'Login successful',
            'user': {
                'id': user['id'],
                'name': user['name'],
                'email': user['email'],
                'staff_type': user.get('type'),
            },
            'privileges': privileges
        }))
        # Set the token as an HTTP-only cookie (also add secure and samesite settings for security)
        response.set_cookie(
            'access_token_cookie', access_token, 
            httponly=True,
            secure=True,  # Set to True in production (with HTTPS)
            samesite='None',  # Or 'None' if using cross-origin with credentials
            path='/'  # Make sure this is correct
        )
        return response  # Send response with the cookie
    else:
        return jsonify({'success': False, 'error': result['error']}), 401
    
@app.route('/api/logout', methods=['POST'])
@jwt_required()
def logout():
    resp = make_response(jsonify({"message": "Logged out successfully"}))
    current_user_email = get_jwt_identity()
    add_log(current_user_email, f"logged out")
    # Make sure to match all cookie settings used during     creation
    resp.set_cookie(
        'access_token_cookie',  # Match the cookie name
        '',  # Empty value to clear the cookie
        expires=0,  # Set to 0 to expire immediately
        httponly=True,  # Same flag as during creation
        secure=True,  # Secure flag, use True for HTTPS
        samesite='None',  # Same as during creation
        path='/',  # Same path as during creation
    )
    
    return resp

@app.route('/api/user/me', methods=['GET'])
@jwt_required()
def get_user_info():
    access_token = request.cookies.get('access_token_cookie')  # Extract token from cookies
    
    if not access_token:
        return jsonify({"error": "Missing token in cookies"}), 401

    user_email = get_jwt_identity()
    user = get_user_by_email(user_email)
    if user:
        return jsonify({
            'id': user['id'],
            'name': user['name'],
            'email': user['email'],
            'phone': user.get('phone'),  # Use .get in case it's optional
            'birthdate': user.get('birthdate'),  # Use .get in case it's optional
            'address': user.get('address')  # Use .get in case it's optional
        }), 200
    return jsonify({'error': 'User not found'}), 404

@app.route('/api/user/status', methods=['GET'])
@jwt_required()
def check_user_status():
    access_token = request.cookies.get('access_token_cookie')  # Check for cookie

    if not access_token:
        return jsonify({"authenticated": False, "error": "Missing token"}), 401

    user_email = get_jwt_identity()
    if user_email:
        return jsonify({
            "authenticated": True,
            "email": user_email
        }), 200

    return jsonify({"authenticated": False, "error": "Invalid token"}), 401

@app.route('/api/user/update', methods=['PUT'])
@jwt_required()
def update_user_info():
    access_token = request.cookies.get('access_token_cookie')  # Extract token from cookies
    if not access_token:
        return jsonify({"error": "Missing token in cookies"}), 401

    user_email = get_jwt_identity()
    user = get_user_by_email(user_email)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json()

    if not data:
        return jsonify({"error": "No input data provided"}), 400

    # Allowed fields to update
    allowed_fields = ['name', 'birthdate', 'address']
    update_data = {}

    for field in allowed_fields:
        if field in data:
            update_data[field] = data[field]

    if not update_data:
        return jsonify({"error": "No valid fields to update"}), 400

    try:
        # You can validate or parse values here if needed, e.g. birthdate format
        update_user_by_email(user_email, update_data)

        # After update, return the new user info
        updated_user = get_user_by_email(user_email)
        return jsonify({
            'name': updated_user['name'],
            'email': updated_user['email'],
            'birthdate': updated_user.get('birthdate'),
            'address': updated_user.get('address')
        }), 200
    except Exception as e:
        return jsonify({'error': f'Failed to update user: {str(e)}'}), 500
    
@app.route('/api/user/update-password', methods=['PUT'])
@jwt_required() 
def update_password():
    # Get the current user's email from the JWT token
    current_user_email = get_jwt_identity()

    # Get the request data
    data = request.get_json()
    old_password = data.get('oldPassword')
    new_password = data.get('newPassword')

    # Fetch the user from the database by their email
    user = get_user_by_email(current_user_email)
    old_user_password = get_user_password(current_user_email)

    if not user:
        return jsonify({'error': 'User not found'}), 404

    # Verify that the old password matches
    if not check_password_hash(old_user_password, old_password):
        return jsonify({"error": "Old password is incorrect."}), 400

    # Call the database function to update the password
    try:
        update_user_password(current_user_email, new_password)  # Call the helper function to update password
        return jsonify({"success": "Password updated successfully."}), 200
    except ValueError as e:
        return jsonify({"error": str(e)}), 500