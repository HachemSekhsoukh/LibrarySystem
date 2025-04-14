# app/routes/dashboard.py or wherever your route handlers live
from flask import jsonify
from flask_jwt_extended import jwt_required
from app import app
from app.database import (
    get_stats, get_monthly_borrows, get_most_borrowed_resources
)

@app.route('/api/stats', methods=['GET'])
@jwt_required()
def dashboard_stats():
    try:
        stats = get_stats()
        print(stats)
        return jsonify(stats), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500
    
@app.route('/api/stats/monthly-borrows', methods=['GET'])
@jwt_required()
def monthly_borrows_chart():
    try:
        borrows = get_monthly_borrows()
        return jsonify(borrows), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/stats/most-borrowed-books', methods=['GET'])
@jwt_required()
def most_borrowed():
    try:
        most_borrowed = get_most_borrowed_resources()
        return jsonify({
            "success": True,
            "data": most_borrowed
        }), 200
    except Exception as e:
        return jsonify({
            "success": False,
            "error": str(e)
        }), 500