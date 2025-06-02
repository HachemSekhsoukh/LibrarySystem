from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Configure CORS to allow requests from the frontend
CORS(app, 
     origins=["http://localhost:5173", "http://127.0.0.1:5173","http://localhost:5174", "http://127.0.0.1:5174"], 
     supports_credentials=True, 
     allow_headers=["Content-Type", "Authorization", "Access-Control-Allow-Credentials"],
     methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"])

# Set the JWT secret key from the environment variable
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
app.config['JWT_TOKEN_LOCATION'] = ['cookies']
app.config['JWT_COOKIE_NAME'] = 'access_token_cookie'  # Must match the cookie you're setting
app.config['JWT_COOKIE_CSRF_PROTECT'] = False  # Disable CSRF for now

jwt = JWTManager(app)

@app.route("/")
def home():
    return "Hello from Flask!"

# Import routes to register them with the app
from app.routes import *  # This imports all route modules

# Register blueprints with the app
from app.routes import register_blueprints
register_blueprints(app)
