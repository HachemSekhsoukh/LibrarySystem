from flask import Flask
from flask_cors import CORS
from flask_jwt_extended import JWTManager
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = Flask(__name__)

# Allow CORS for only specific origin (your React app)
CORS(app, supports_credentials=True)

# Set the JWT secret key from the environment variable
app.config['JWT_SECRET_KEY'] = os.getenv('JWT_SECRET_KEY')
jwt = JWTManager(app)

@app.route("/")
def home():
    return "Hello from Flask!"

# Import routes to register them with the app
from app.routes import *  # This imports all route modules
