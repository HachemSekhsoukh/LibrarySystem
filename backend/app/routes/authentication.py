from flask import jsonify, request, make_response
from app import app
from app.database import sign_up, login
from flask_jwt_extended import create_access_token

@app.route('/api/signup', methods=['POST'])
def api_sign_up():
    data = request.get_json()
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400

    # You can optionally pass name if provided
    name = data.get('name')
    result = sign_up(data['email'], data['password'], name)
    return jsonify(result), (200 if result['success'] else 400)


@app.route('/api/login', methods=['POST'])
def api_login():
    data = request.get_json()
    
    if not data or 'email' not in data or 'password' not in data:
        return jsonify({'success': False, 'error': 'Email and password are required'}), 400

    # Assuming login function checks credentials and returns a result
    result = login(data['email'], data['password'])

    if result['success']:
        # Generate access token
        access_token = create_access_token(identity=data['email'])
        
        # Create the response
        response = make_response(jsonify({'success': True, 'message': 'Login successful'}))
        
        # Set the token as an HTTP-only cookie (also add secure and samesite settings for security)
        response.set_cookie(
            'jwt_token', access_token, 
            httponly=True, 
            secure=True,  # Ensure this is set to True in production (over HTTPS)
            samesite='Strict',  # Optional, set to 'Lax' or 'Strict' as needed
            max_age=3600  # Optional: Set the token expiration time (1 hour in this case)
        )
        
        return response  # Send response with the cookie
    else:
        return jsonify({'success': False, 'error': result['error']}), 401
    
@app.route('/api/logout', methods=['POST'])
def logout():
    resp = make_response({"message": "Logged out successfully"})
    # Clear the jwt_token cookie by setting an expiration in the past
    resp.set_cookie('jwt_token', '', expires=0)
    return resp



@app.route('/api/test', methods=['GET', 'OPTIONS'])
def test():
    return jsonify({"message": "CORS works!"})

