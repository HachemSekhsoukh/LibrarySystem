from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

@app.route("/")
def home():
    return "Hello from Flask!"

# Import routes to register them with the app
from app.routes import *  # This imports all route modules
