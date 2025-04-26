# app/logs_routes.py

from flask import jsonify, request
from flask_jwt_extended import jwt_required
from app import app
import datetime
from app.database import get_logs


@app.route('/api/logs', methods=['GET'])
@jwt_required()
def fetch_logs():
    """
    Fetch logs (authentication required).
    """
    logs = get_logs()  # call the function
    return jsonify({"success": True, "logs": logs}), 200
